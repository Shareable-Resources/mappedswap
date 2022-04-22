package decats

import (
	"bytes"
	"context"
	"fmt"
	"io/ioutil"
	"math"
	"math/big"

	"strings"

	"eurus-backend/asset_service/asset"
	"eurus-backend/foundation"
	"eurus-backend/foundation/ethereum"
	"eurus-backend/foundation/log"
	"eurus-backend/secret"
	"eurus-backend/smartcontract/build/golang/contract"

	"time"

	geth "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/shopspring/decimal"
)

var tokenList = [...]string{"BTCM", "ETHM", "USDM"}

type DecatsProcessor struct {
	context         *DecatsProcessorContext //context has replaced db
	scProcessor     *DecatsSCProcessor
	config          *DecatsObserverConfig
	ethClient       *ethereum.EthClient
	progressCounter *DecatsProgressCounter

	//=======
	poolContractAddress common.Address
	factoryContract     *contract.RaijinSwapFactory
	ethPairContract     *contract.RaijinSwapPair
	btcPairContract     *contract.RaijinSwapPair
	ethPairRev0         bool
	btcPairRev0         bool

	PriceList           map[string]*DecatsPrice
	TokenDecimal        map[string]*big.Float
	TokenDecimalInt     map[string]*big.Int
	ClientMap           map[common.Address]*DecatsClient
	EventHash           map[string]common.Hash
	InterestRateMap     map[string]*big.Int
	InterestRateHistory map[string][]*DecatsInterestRate
	PoolAbi             abi.ABI

	IsSync bool

	LastInterestBlockTime uint64
	LastK0BlockTime       uint64
	LastK1BlockTime       uint64
	Lastk2BlockTime       uint64
	Lastk3BlockTime       uint64
}

type DecatsPrice struct {
	PairName string
	Price    *big.Float
	Reserve0 *big.Int
	Reserve1 *big.Int
	Open     *big.Float
	High     *big.Float
	Low      *big.Float
	Volume   *big.Int
}

type DecatsInterestRate struct {
	Rate          *big.Int
	EffectiveTime *big.Int
}

type DecatsBalances struct {
	Balance   int64
	Timestamp uint64
}

type DecatsClient struct {
	Id      uint64
	AgentId uint64
	Address common.Address
	Balance map[string]*big.Int

	BalanceUpdateTime uint64
	CreditMode        uint8
	Credit            *big.Int
	Interest          map[string]*big.Int
	BalanceInReal     map[string]*big.Float
	InterestInReal    map[string]*big.Float
	CreditInReal      *big.Float
	Leverage          *big.Float
	RiskLevel         *big.Float
	RiskLevelCurrent  *big.Float
	LastStopoutTime   *time.Time
	LastStopoutTx     *types.Transaction
}

func NewDecatsProcessor(config *DecatsObserverConfig, scProcessor *DecatsSCProcessor, context *DecatsProcessorContext, ethClient *ethereum.EthClient, counter *DecatsProgressCounter) *DecatsProcessor {
	processor := new(DecatsProcessor)
	processor.config = config
	processor.context = context
	processor.scProcessor = scProcessor
	processor.ethClient = ethClient
	processor.progressCounter = counter
	return processor
}

const interestInterval time.Duration = 60 * time.Minute
const k0IntervalSeconds int = 60
const k1IntervalSeconds int = 300
const k2IntervalSeconds int = 3600
const k3IntervalSeconds int = 86400
const k0Interval time.Duration = 60 * time.Second
const k1Interval time.Duration = 300 * time.Second
const k2Interval time.Duration = 3600 * time.Second
const k3Interval time.Duration = 86400 * time.Second

func (me *DecatsProcessor) Init() error {
	me.PriceList = make(map[string]*DecatsPrice)

	me.poolContractAddress = common.HexToAddress(secret.PoolContractAddress)

	FactoryAddress := common.HexToAddress(secret.FactoryContractAddress)
	factoryContract, err := contract.NewRaijinSwapFactory(FactoryAddress, me.ethClient.Client)
	if err != nil {
		return err
	}

	me.factoryContract = factoryContract

	if secret.TokenETHMContractAddress < secret.TokenUSDMContractAddress {
		me.ethPairRev0 = true
	} else {
		me.ethPairRev0 = false
	}
	pairAddress, _ := factoryContract.GetPair(&bind.CallOpts{}, common.HexToAddress(secret.TokenETHMContractAddress), common.HexToAddress(secret.TokenUSDMContractAddress))
	pairContract, err := contract.NewRaijinSwapPair(pairAddress, me.ethClient.Client)
	if err != nil {
		return err
	}
	me.ethPairContract = pairContract
	decatsPrice := new(DecatsPrice)
	decatsPrice.PairName = "ETHM/USDM"
	decatsPrice.Open = big.NewFloat(0)
	decatsPrice.High = big.NewFloat(0)
	decatsPrice.Low = big.NewFloat(math.MaxFloat64)
	decatsPrice.Volume = big.NewInt(0)
	decatsPrice.Price = big.NewFloat(0)
	me.PriceList["ETHM"] = decatsPrice

	log.GetLogger(log.Name.Root).Infoln("ETHM Pair address ", pairAddress)

	if secret.TokenBTCMContractAddress < secret.TokenUSDMContractAddress {
		me.btcPairRev0 = true
	} else {
		me.btcPairRev0 = false
	}
	pairAddress, _ = factoryContract.GetPair(&bind.CallOpts{}, common.HexToAddress(secret.TokenBTCMContractAddress), common.HexToAddress(secret.TokenUSDMContractAddress))
	pairContract, err = contract.NewRaijinSwapPair(pairAddress, me.ethClient.Client)
	if err != nil {
		return err
	}
	me.btcPairContract = pairContract
	decatsPrice = new(DecatsPrice)
	decatsPrice.PairName = "BTCM/USDM"
	decatsPrice.Open = big.NewFloat(0)
	decatsPrice.High = big.NewFloat(0)
	decatsPrice.Low = big.NewFloat(math.MaxFloat64)
	decatsPrice.Volume = big.NewInt(0)
	decatsPrice.Price = big.NewFloat(0)
	me.PriceList["BTCM"] = decatsPrice

	log.GetLogger(log.Name.Root).Infoln("BTCM Pair address ", pairAddress)

	decatsPrice = new(DecatsPrice)
	decatsPrice.PairName = "USDM/USDM"
	decatsPrice.Price = big.NewFloat(1)
	decatsPrice.Open = big.NewFloat(0)
	decatsPrice.High = big.NewFloat(0)
	decatsPrice.Low = big.NewFloat(math.MaxFloat64)
	decatsPrice.Volume = big.NewInt(0)
	me.PriceList["USDM"] = decatsPrice

	me.TokenDecimal = make(map[string]*big.Float)
	me.TokenDecimal["ETHM"] = big.NewFloat(1000000000000000000)
	me.TokenDecimal["BTCM"] = big.NewFloat(1000000000000000000)
	me.TokenDecimal["USDM"] = big.NewFloat(1000000)

	me.TokenDecimalInt = make(map[string]*big.Int)
	me.TokenDecimalInt["ETHM"] = big.NewInt(1000000000000000000)
	me.TokenDecimalInt["BTCM"] = big.NewInt(1000000000000000000)
	me.TokenDecimalInt["USDM"] = big.NewInt(1000000)

	me.InterestRateMap = make(map[string]*big.Int)
	me.InterestRateHistory = make(map[string][]*DecatsInterestRate)

	for _, token := range tokenList {
		tokenInterestList := me.scProcessor.GetInterestRateHistory(token)
		rateHistoryList := me.InterestRateHistory[token]
		for _, tokenInterest := range tokenInterestList {
			rateHistory := new(DecatsInterestRate)
			rateHistory.EffectiveTime = tokenInterest.EffectiveTime
			rateHistory.Rate = tokenInterest.Value
			rateHistoryList = append(rateHistoryList, rateHistory)
		}
		me.InterestRateHistory[token] = rateHistoryList
		me.InterestRateMap[token] = me.InterestRateHistory[token][len(me.InterestRateHistory[token])-1].Rate
	}

	return nil
}

func (me *DecatsProcessor) InitClientList(context *DecatsProcessorContext) {
	me.ClientMap = make(map[common.Address]*DecatsClient)

	clientList, err := DbGetUserList(context)
	if err != nil {
		panic(err.Error())
	}

	for _, client := range clientList {
		me.createNewClient(&client)

	}
}

func (me *DecatsProcessor) ReloadClientBalanceFromDB(context *DecatsProcessorContext) {
	for _, client := range me.ClientMap {
		for _, token := range tokenList {
			balance, err := DbGetUserBalance(context, strings.ToLower(client.Address.Hex()), token)
			if err != nil {
				panic(err.Error())
			}
			client.Balance[token] = balance.Balance.BigInt()
			client.BalanceInReal[token] = new(big.Float).Quo(new(big.Float).SetInt(client.Balance[token]), me.TokenDecimal[token])
			client.Interest[token] = balance.Interest.BigInt()
			client.InterestInReal[token] = new(big.Float).Quo(new(big.Float).SetInt(client.Interest[token]), me.TokenDecimal[token])

		}
	}
}

func (me *DecatsProcessor) InitEventList(poolAbiPath string) {
	me.EventHash = make(map[string]common.Hash)
	abiContent, err := ioutil.ReadFile(poolAbiPath)
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Unable to read abi: ", err.Error())
	}

	poolAbi, err := abi.JSON(strings.NewReader(string(abiContent)))
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Unable to read abi: ", err.Error())
	}
	me.PoolAbi = poolAbi

	me.EventHash["Withdraw"] = crypto.Keccak256Hash([]byte(poolAbi.Events["Withdraw"].Sig))

	me.EventHash["IncreaseBalance"] = crypto.Keccak256Hash([]byte(poolAbi.Events["IncreaseBalance"].Sig))

	me.EventHash["Buy"] = crypto.Keccak256Hash([]byte(poolAbi.Events["Buy"].Sig))

	me.EventHash["Sell"] = crypto.Keccak256Hash([]byte(poolAbi.Events["Sell"].Sig))

	me.EventHash["Interest"] = crypto.Keccak256Hash([]byte(poolAbi.Events["Interest"].Sig))

	me.EventHash["UpdateCredit"] = crypto.Keccak256Hash([]byte(poolAbi.Events["UpdateCredit"].Sig))

	me.EventHash["UpdateRiskLevel"] = crypto.Keccak256Hash([]byte(poolAbi.Events["UpdateRiskLevel"].Sig))

	me.EventHash["Stopout"] = crypto.Keccak256Hash([]byte(poolAbi.Events["Stopout"].Sig))

	me.EventHash["UpdateTokenInterestRate"] = crypto.Keccak256Hash([]byte(poolAbi.Events["UpdateTokenInterestRate"].Sig))

	me.EventHash["UpdateStatus"] = crypto.Keccak256Hash([]byte(poolAbi.Events["UpdateStatus"].Sig))

	log.GetLogger(log.Name.Root).Infoln("Withdraw ", me.EventHash["Withdraw"])
	log.GetLogger(log.Name.Root).Infoln("IncreaseBalance ", me.EventHash["IncreaseBalance"])
	log.GetLogger(log.Name.Root).Infoln("Buy ", me.EventHash["Buy"])
	log.GetLogger(log.Name.Root).Infoln("Sell ", me.EventHash["Sell"])
	log.GetLogger(log.Name.Root).Infoln("UpdateCredit ", me.EventHash["UpdateCredit"])
	log.GetLogger(log.Name.Root).Infoln("UpdateRiskLevel ", me.EventHash["UpdateRiskLevel"])
	log.GetLogger(log.Name.Root).Infoln("Stopout ", me.EventHash["Stopout"])
	log.GetLogger(log.Name.Root).Infoln("UpdateTokenInterestRate ", me.EventHash["UpdateTokenInterestRate"])
	log.GetLogger(log.Name.Root).Infoln("UpdateStatus ", me.EventHash["UpdateStatus"])

}

func (me *DecatsProcessor) RunRescanFromLastBlock() {
	var currentNumber *big.Int
	var progressNumber *big.Int

	headnumber, err := me.ethClient.Client.BlockNumber(context.Background())
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Unable to read headnumber: ", err.Error())
	}

	log.GetLogger(log.Name.Root).Infoln("Current live block: ", headnumber)

	//get last scan from DB
	lastCounter, err := me.progressCounter.GetScannedBlock()
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Unable to read progress: ", err.Error())
	}

	progressNumber = lastCounter.CurrentNum.BigInt()
	currentNumber = new(big.Int).SetUint64(headnumber)

	log.GetLogger(log.Name.Root).Infoln("Last scanned block: ", progressNumber)

	for {
		query := geth.FilterQuery{
			FromBlock: progressNumber,
			ToBlock:   currentNumber,
			Addresses: []common.Address{
				common.HexToAddress(secret.PoolContractAddress),
			},
		}

		logs, err := me.ethClient.Client.FilterLogs(context.Background(), query)
		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("failed to filter logs: ", err.Error())
		}

		for _, vLog := range logs {

			me.proccessDecatsLog(vLog)

		}

		me.progressCounter.UpdateScannedBlock(currentNumber)
		progressNumber.Set(currentNumber)

		headnumber, err := me.ethClient.Client.BlockNumber(context.Background())
		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("Unable to read headnumber: ", err.Error())
		}

		log.GetLogger(log.Name.Root).Infoln("Current live block: ", headnumber)

		currentNumber = new(big.Int).SetUint64(headnumber)

		log.GetLogger(log.Name.Root).Infoln("Last scanned block: ", progressNumber)

		if currentNumber.Cmp(progressNumber) == 0 {
			lastblock, _ := me.ethClient.GetBlockByNumber(progressNumber)
			me.LastInterestBlockTime = lastblock.Time() / (uint64(interestInterval) / 1000000000) //in terms of interval
			me.LastK0BlockTime = lastblock.Time() / (uint64(k0Interval) / 1000000000)
			me.LastK1BlockTime = lastblock.Time() / (uint64(k1Interval) / 1000000000) //in terms of interval
			me.Lastk2BlockTime = lastblock.Time() / (uint64(k2Interval) / 1000000000) //in terms of interval
			me.Lastk3BlockTime = lastblock.Time() / (uint64(k3Interval) / 1000000000) //in terms of interval
			break
		}
	}

	me.IsSync = true
	log.GetLogger(log.Name.Root).Infoln("Rescan finished")
}

func (me *DecatsProcessor) proccessDecatsLog(vLog types.Log) {

	switch vLog.Topics[0].Hex() {

	case me.EventHash["Withdraw"].Hex():
		var events LogWithdraw
		err := me.PoolAbi.UnpackIntoInterface(&events, "Withdraw", vLog.Data)

		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("failed to unpack logs: ", err.Error())
			break
		}

		customerAddr := common.HexToAddress(vLog.Topics[1].Hex())
		customer := strings.ToLower(customerAddr.Hex())

		log.GetLogger(log.Name.Root).Infof("Withdraw %s %s %d %d\n", customer, events.TokenName, events.Amount, events.NewBalance)
		if _, ok := me.ClientMap[customerAddr]; !ok {
			user, err := DbGetUser(me.context, customer)
			if err != nil {
				log.GetLogger(log.Name.Root).Errorln("Can't get user addr=", customer)
				break
			} else {
				//create client
				log.GetLogger(log.Name.Root).Infoln("Created new user ", customer)
				me.createNewClient(user)
			}
		}
		if client, ok := me.ClientMap[customerAddr]; ok {
			txBlock, _ := me.ethClient.GetBlockByNumber(new(big.Int).SetUint64(vLog.BlockNumber))

			if client.CreditMode == 0 && !me.IsSync && client.BalanceUpdateTime != 0 {
				//cal interest
				fromTime := time.Unix(int64(client.BalanceUpdateTime), 0).Truncate(interestInterval)
				toTime := fromTime.Add(interestInterval)

				for toTime.Unix() < int64(txBlock.Time()) {
					me.CalInterest(client, fromTime, toTime, true, true)
					fromTime = toTime
					toTime = fromTime.Add(interestInterval)
				}

			}
			client.Balance[events.TokenName] = events.NewBalance
			client.BalanceInReal[events.TokenName] = new(big.Float).Quo(new(big.Float).SetInt(events.NewBalance), me.TokenDecimal[events.TokenName])
			client.BalanceUpdateTime = txBlock.Time()

			dbUB := new(asset.TDecatsBalance)
			dbUB.Address = customer
			dbUB.CustomerId = client.Id
			dbUB.AgentId = client.AgentId
			dbUB.Token = events.TokenName
			dbUB.Balance = decimal.NewFromBigInt(client.Balance[events.TokenName], 0)
			dbUB.Interest = decimal.NewFromBigInt(client.Interest[events.TokenName], 0)
			dbUB.Status = 0
			txTime := time.Unix(int64(client.BalanceUpdateTime), 0)
			dbUB.UpdateTime = &txTime
			dbOp := new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalance
			dbOp.DecatsBalance = dbUB
			me.context.TransactionOp <- dbOp

			dbUBH := new(asset.TDecatsBalancesHistory)
			dbUBH.Address = customer
			dbUBH.CustomerId = client.Id
			dbUBH.AgentId = client.AgentId
			dbUBH.Token = events.TokenName
			dbUBH.Type = asset.DecatsTxTypeWithdraw
			dbUBH.Amount = decimal.NewFromBigInt(events.Amount, 0)
			dbUBH.Balance = decimal.NewFromBigInt(client.Balance[events.TokenName], 0)
			dbUBH.UpdateTime = &txTime
			dbUBH.TxHash = vLog.TxHash.Hex()
			dbUBH.Status = 0
			dbOp = new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalanceHistory
			dbOp.DecatsBalanceHis = dbUBH
			me.context.TransactionOp <- dbOp

		}

	case me.EventHash["IncreaseBalance"].Hex():
		var events LogIncreaseBalance
		err := me.PoolAbi.UnpackIntoInterface(&events, "IncreaseBalance", vLog.Data)

		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("failed to unpack logs: ", err.Error())
			break
		}
		customerAddr := common.HexToAddress(vLog.Topics[1].Hex())
		customer := strings.ToLower(customerAddr.Hex())
		log.GetLogger(log.Name.Root).Infof("IncreaseBalance %s %s %d %d\n", customer, events.TokenName, events.Amount, events.NewBalance)
		if _, ok := me.ClientMap[customerAddr]; !ok {
			user, err := DbGetUser(me.context, customer)
			if err != nil {
				log.GetLogger(log.Name.Root).Errorln("Can't get user addr=", customer)
				break
			} else {
				//create client
				log.GetLogger(log.Name.Root).Infoln("Created new user ", customer)
				me.createNewClient(user)
			}
		}
		if client, ok := me.ClientMap[customerAddr]; ok {
			txBlock, _ := me.ethClient.GetBlockByNumber(new(big.Int).SetUint64(vLog.BlockNumber))

			if client.CreditMode == 0 && !me.IsSync && client.BalanceUpdateTime != 0 {
				//cal interest
				fromTime := time.Unix(int64(client.BalanceUpdateTime), 0).Truncate(interestInterval)
				toTime := fromTime.Add(interestInterval)

				for toTime.Unix() < int64(txBlock.Time()) {
					me.CalInterest(client, fromTime, toTime, true, true)
					fromTime = toTime
					toTime = fromTime.Add(interestInterval)
				}

			}

			client.Balance[events.TokenName] = events.NewBalance
			client.BalanceInReal[events.TokenName] = new(big.Float).Quo(new(big.Float).SetInt(events.NewBalance), me.TokenDecimal[events.TokenName])
			client.BalanceUpdateTime = txBlock.Time()
			dbUB := new(asset.TDecatsBalance)
			dbUB.Address = customer
			dbUB.CustomerId = client.Id
			dbUB.AgentId = client.AgentId
			dbUB.Token = events.TokenName
			dbUB.Balance = decimal.NewFromBigInt(client.Balance[events.TokenName], 0)
			dbUB.Interest = decimal.NewFromBigInt(client.Interest[events.TokenName], 0)
			dbUB.Status = 0
			txTime := time.Unix(int64(client.BalanceUpdateTime), 0)
			dbUB.UpdateTime = &txTime
			dbOp := new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalance
			dbOp.DecatsBalance = dbUB
			me.context.TransactionOp <- dbOp

			dbUBH := new(asset.TDecatsBalancesHistory)
			dbUBH.Address = customer
			dbUBH.CustomerId = client.Id
			dbUBH.AgentId = client.AgentId
			dbUBH.Token = events.TokenName
			dbUBH.Type = asset.DecatsTxTypeDeposit
			dbUBH.Amount = decimal.NewFromBigInt(events.Amount, 0)
			dbUBH.Balance = decimal.NewFromBigInt(client.Balance[events.TokenName], 0)
			dbUBH.UpdateTime = &txTime
			dbUBH.TxHash = vLog.TxHash.Hex()
			dbUBH.Status = 0
			dbOp = new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalanceHistory
			dbOp.DecatsBalanceHis = dbUBH
			me.context.TransactionOp <- dbOp
		}
	case me.EventHash["Buy"].Hex():
		var events LogBuy
		err := me.PoolAbi.UnpackIntoInterface(&events, "Buy", vLog.Data)

		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("failed to unpack logs: ", err.Error())
			break
		}
		customerAddr := common.HexToAddress(vLog.Topics[1].Hex())
		customer := strings.ToLower(customerAddr.Hex())
		log.GetLogger(log.Name.Root).Infof("Buy %s %s %s %d %d %d %d\n", customer, events.PairName, events.TokenNameBuy, events.NewBalanceBuy,
			events.AmountBuy, events.AmountSell, events.NewBalanceSell)
		if _, ok := me.ClientMap[customerAddr]; !ok {
			user, err := DbGetUser(me.context, customer)
			if err != nil {
				log.GetLogger(log.Name.Root).Errorln("Can't get user addr=", customer)
				break
			} else {
				//create client
				log.GetLogger(log.Name.Root).Infoln("Created new user ", customer)
				me.createNewClient(user)
			}
		}
		if client, ok := me.ClientMap[customerAddr]; ok {
			dbTrans := new(asset.TDecatsTransaction)
			dbTrans.Address = customer
			dbTrans.BuyToken = events.TokenNameBuy
			dbTrans.BuyAmount = decimal.NewFromBigInt(events.AmountBuy, 0)
			sellToken := findTradePair(events.PairName, events.TokenNameBuy)
			dbTrans.SellToken = sellToken
			dbTrans.SellAmount = decimal.NewFromBigInt(events.AmountSell, 0)
			dbTrans.BlockHeight = int(vLog.BlockNumber)
			dbTrans.BlockHash = vLog.BlockHash.Hex()
			dbTrans.TxHash = vLog.TxHash.Hex()
			dbTrans.TxStatus = asset.DecatsTxConfirmed
			dbTrans.CustomerId = me.ClientMap[customerAddr].Id
			dbTrans.AgentId = me.ClientMap[customerAddr].AgentId
			dbTrans.Stopout = events.IsStopout
			txBlock, _ := me.ethClient.GetBlockByNumber(new(big.Int).SetUint64(vLog.BlockNumber))

			txTime := time.Unix(int64(txBlock.Time()), 0)
			dbTrans.TxTime = &txTime
			dbOp := new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpTrans
			dbOp.DecatsTrans = dbTrans
			me.context.TransactionOp <- dbOp

			if !me.IsSync {
				if client.CreditMode == 0 && client.BalanceUpdateTime != 0 {
					//cal interest
					fromTime := time.Unix(int64(client.BalanceUpdateTime), 0).Truncate(interestInterval)
					toTime := fromTime.Add(interestInterval)

					for toTime.Unix() < int64(txBlock.Time()) {
						me.CalInterest(client, fromTime, toTime, true, true)
						fromTime = toTime
						toTime = fromTime.Add(interestInterval)
					}
				}
			} else {
				if events.TokenNameBuy == "USDM" {
					if dPrice, ok := me.PriceList[sellToken]; ok {
						dPrice.Volume = new(big.Int).Add(dPrice.Volume, events.AmountBuy)
					}
				} else {
					if dPrice, ok := me.PriceList[events.TokenNameBuy]; ok {
						dPrice.Volume = new(big.Int).Add(dPrice.Volume, events.AmountSell)
					}
				}
			}

			// process interests first then update balance with new balance
			client.Balance[events.TokenNameBuy] = events.NewBalanceBuy
			client.BalanceInReal[events.TokenNameBuy] = new(big.Float).Quo(new(big.Float).SetInt(events.NewBalanceBuy), me.TokenDecimal[events.TokenNameBuy])
			client.Balance[sellToken] = events.NewBalanceSell
			client.BalanceInReal[sellToken] = new(big.Float).Quo(new(big.Float).SetInt(events.NewBalanceSell), me.TokenDecimal[sellToken])
			client.BalanceUpdateTime = txBlock.Time()
			dbUB := new(asset.TDecatsBalance)
			dbUB.Address = customer
			dbUB.CustomerId = client.Id
			dbUB.AgentId = client.AgentId
			dbUB.Token = events.TokenNameBuy
			dbUB.Balance = decimal.NewFromBigInt(client.Balance[events.TokenNameBuy], 0)
			dbUB.Interest = decimal.NewFromBigInt(client.Interest[events.TokenNameBuy], 0)
			dbUB.Status = 0
			dbUB.UpdateTime = &txTime
			dbOp = new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalance
			dbOp.DecatsBalance = dbUB
			me.context.TransactionOp <- dbOp

			dbUBH := new(asset.TDecatsBalancesHistory)
			dbUBH.Address = customer
			dbUBH.CustomerId = client.Id
			dbUBH.AgentId = client.AgentId
			dbUBH.Token = events.TokenNameBuy
			dbUBH.Type = asset.DecatsTxTypeBuy
			dbUBH.Amount = decimal.NewFromBigInt(events.AmountBuy, 0)
			dbUBH.Balance = decimal.NewFromBigInt(client.Balance[events.TokenNameBuy], 0)
			dbUBH.UpdateTime = &txTime
			dbUBH.TxHash = vLog.TxHash.Hex()
			dbUBH.Status = 0
			dbOp = new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalanceHistory
			dbOp.DecatsBalanceHis = dbUBH
			me.context.TransactionOp <- dbOp

			dbUBS := new(asset.TDecatsBalance)
			dbUBS.Address = customer
			dbUBS.CustomerId = client.Id
			dbUBS.AgentId = client.AgentId
			dbUBS.Token = sellToken
			dbUBS.Balance = decimal.NewFromBigInt(client.Balance[sellToken], 0)
			dbUBS.Interest = decimal.NewFromBigInt(client.Interest[sellToken], 0)
			dbUBS.Status = 0
			dbUBS.UpdateTime = &txTime
			dbOp = new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalance
			dbOp.DecatsBalance = dbUBS
			me.context.TransactionOp <- dbOp

			dbUBHS := new(asset.TDecatsBalancesHistory)
			dbUBHS.Address = customer
			dbUBHS.CustomerId = client.Id
			dbUBHS.AgentId = client.AgentId
			dbUBHS.Token = sellToken
			dbUBHS.Type = asset.DecatsTxTypeSell
			dbUBHS.Amount = decimal.NewFromBigInt(events.AmountSell, 0)
			dbUBHS.Balance = decimal.NewFromBigInt(client.Balance[sellToken], 0)
			dbUBHS.UpdateTime = &txTime
			dbUBHS.TxHash = vLog.TxHash.Hex()
			dbUBHS.Status = 0
			dbOp = new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalanceHistory
			dbOp.DecatsBalanceHis = dbUBHS
			me.context.TransactionOp <- dbOp
		}
	case me.EventHash["Sell"].Hex():
		var events LogSell
		err := me.PoolAbi.UnpackIntoInterface(&events, "Sell", vLog.Data)

		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("failed to unpack logs: ", err.Error())
			break
		}
		customerAddr := common.HexToAddress(vLog.Topics[1].Hex())
		customer := strings.ToLower(customerAddr.Hex())

		log.GetLogger(log.Name.Root).Infof("Sell %s %s %d %d %s %d %d\n", customer, events.PairName, events.NewBalanceBuy,
			events.AmountBuy, events.TokenNameSell, events.AmountSell, events.NewBalanceSell)
		if _, ok := me.ClientMap[customerAddr]; !ok {
			user, err := DbGetUser(me.context, customer)
			if err != nil {
				log.GetLogger(log.Name.Root).Errorln("Can't get user addr=", customer)
				break
			} else {
				//create client
				log.GetLogger(log.Name.Root).Infoln("Created new user ", customer)
				me.createNewClient(user)
			}
		}
		if client, ok := me.ClientMap[customerAddr]; ok {
			dbTrans := new(asset.TDecatsTransaction)
			dbTrans.Address = customer
			tokenBuy := findTradePair(events.PairName, events.TokenNameSell)
			dbTrans.BuyToken = tokenBuy
			dbTrans.BuyAmount = decimal.NewFromBigInt(events.AmountBuy, 0)
			dbTrans.SellToken = events.TokenNameSell
			dbTrans.SellAmount = decimal.NewFromBigInt(events.AmountSell, 0)
			dbTrans.BlockHeight = int(vLog.BlockNumber)
			dbTrans.BlockHash = vLog.BlockHash.Hex()
			dbTrans.TxHash = vLog.TxHash.Hex()
			dbTrans.TxStatus = asset.DecatsTxConfirmed
			dbTrans.CustomerId = me.ClientMap[customerAddr].Id
			dbTrans.AgentId = me.ClientMap[customerAddr].AgentId
			dbTrans.Stopout = events.IsStopout
			txBlock, _ := me.ethClient.GetBlockByNumber(new(big.Int).SetUint64(vLog.BlockNumber))

			txTime := time.Unix(int64(txBlock.Time()), 0)
			dbTrans.TxTime = &txTime
			dbOp := new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpTrans
			dbOp.DecatsTrans = dbTrans
			me.context.TransactionOp <- dbOp

			if !me.IsSync {
				if client.CreditMode == 0 && client.BalanceUpdateTime != 0 {
					//cal interest
					fromTime := time.Unix(int64(client.BalanceUpdateTime), 0).Truncate(interestInterval)
					toTime := fromTime.Add(interestInterval)

					for toTime.Unix() < int64(txBlock.Time()) {
						me.CalInterest(client, fromTime, toTime, true, true)
						fromTime = toTime
						toTime = fromTime.Add(interestInterval)
					}
				}
			} else {
				if events.TokenNameSell == "USDM" {
					if dPrice, ok := me.PriceList[tokenBuy]; ok {
						dPrice.Volume = new(big.Int).Add(dPrice.Volume, events.AmountSell)
					}
				} else {
					if dPrice, ok := me.PriceList[events.TokenNameSell]; ok {
						dPrice.Volume = new(big.Int).Add(dPrice.Volume, events.AmountBuy)
					}
				}
			}

			client.Balance[tokenBuy] = events.NewBalanceBuy
			client.BalanceInReal[tokenBuy] = new(big.Float).Quo(new(big.Float).SetInt(events.NewBalanceBuy), me.TokenDecimal[tokenBuy])
			client.Balance[events.TokenNameSell] = events.NewBalanceSell
			client.BalanceInReal[events.TokenNameSell] = new(big.Float).Quo(new(big.Float).SetInt(events.NewBalanceSell), me.TokenDecimal[events.TokenNameSell])
			client.BalanceUpdateTime = txBlock.Time()
			dbUB := new(asset.TDecatsBalance)
			dbUB.Address = customer
			dbUB.CustomerId = client.Id
			dbUB.AgentId = client.AgentId
			dbUB.Token = events.TokenNameSell
			dbUB.Balance = decimal.NewFromBigInt(client.Balance[events.TokenNameSell], 0)
			dbUB.Interest = decimal.NewFromBigInt(client.Interest[events.TokenNameSell], 0)
			dbUB.Status = 0
			dbUB.UpdateTime = &txTime
			dbOp = new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalance
			dbOp.DecatsBalance = dbUB
			me.context.TransactionOp <- dbOp

			dbUBH := new(asset.TDecatsBalancesHistory)
			dbUBH.Address = customer
			dbUBH.CustomerId = client.Id
			dbUBH.AgentId = client.AgentId
			dbUBH.Token = events.TokenNameSell
			dbUBH.Type = asset.DecatsTxTypeBuy
			dbUBH.Amount = decimal.NewFromBigInt(events.AmountSell, 0)
			dbUBH.Balance = decimal.NewFromBigInt(client.Balance[events.TokenNameSell], 0)
			dbUBH.UpdateTime = &txTime
			dbUBH.TxHash = vLog.TxHash.Hex()
			dbUBH.Status = 0
			dbOp = new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalanceHistory
			dbOp.DecatsBalanceHis = dbUBH
			me.context.TransactionOp <- dbOp

			dbUBS := new(asset.TDecatsBalance)
			dbUBS.Address = customer
			dbUBS.CustomerId = client.Id
			dbUBS.AgentId = client.AgentId
			dbUBS.Token = tokenBuy
			dbUBS.Balance = decimal.NewFromBigInt(client.Balance[tokenBuy], 0)
			dbUBS.Interest = decimal.NewFromBigInt(client.Interest[tokenBuy], 0)
			dbUBS.Status = 0
			dbUBS.UpdateTime = &txTime
			dbOp = new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalance
			dbOp.DecatsBalance = dbUBS
			me.context.TransactionOp <- dbOp

			dbUBHS := new(asset.TDecatsBalancesHistory)
			dbUBHS.Address = customer
			dbUBHS.CustomerId = client.Id
			dbUBHS.AgentId = client.AgentId
			dbUBHS.Token = tokenBuy
			dbUBHS.Type = asset.DecatsTxTypeSell
			dbUBHS.Amount = decimal.NewFromBigInt(events.AmountBuy, 0)
			dbUBHS.Balance = decimal.NewFromBigInt(client.Balance[tokenBuy], 0)
			dbUBHS.UpdateTime = &txTime
			dbUBHS.TxHash = vLog.TxHash.Hex()
			dbUBHS.Status = 0
			dbOp = new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpBalanceHistory
			dbOp.DecatsBalanceHis = dbUBHS
			me.context.TransactionOp <- dbOp
		}
	case me.EventHash["Interest"].Hex():
		var events LogInterest
		err := me.PoolAbi.UnpackIntoInterface(&events, "Interest", vLog.Data)

		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("failed to unpack logs: ", err.Error())
			break
		}

		customerAddr := common.HexToAddress(vLog.Topics[1].Hex())
		customer := strings.ToLower(customerAddr.Hex())
		txBlock, _ := me.ethClient.GetBlockByNumber(new(big.Int).SetUint64(vLog.BlockNumber))
		log.GetLogger(log.Name.Root).Infof("Interest %s %s %d %d %d %d\n", customer, events.TokenNames[:], events.BeginTime, events.EndTime, events.RealizedBalances[:], events.Interests[:])

		if _, ok := me.ClientMap[customerAddr]; !ok {
			user, err := DbGetUser(me.context, customer)
			if err != nil {
				log.GetLogger(log.Name.Root).Errorln("Can't get user addr=", customer)
				break
			} else {
				//create client
				log.GetLogger(log.Name.Root).Infoln("Created new user ", customer)
				me.createNewClient(user)
			}
		}
		if client, ok := me.ClientMap[customerAddr]; ok {
			for i, tokenName := range events.TokenNames {
				client.Balance[tokenName] = events.RealizedBalances[i]
				client.BalanceInReal[tokenName] = new(big.Float).Quo(new(big.Float).SetInt(events.RealizedBalances[i]), me.TokenDecimal[tokenName])
				client.Interest[tokenName] = big.NewInt(0)
				client.InterestInReal[tokenName] = big.NewFloat(0)

				dbUB := new(asset.TDecatsBalance)
				dbUB.Address = customer
				dbUB.CustomerId = client.Id
				dbUB.AgentId = client.AgentId
				dbUB.Token = tokenName
				dbUB.Balance = decimal.NewFromBigInt(client.Balance[tokenName], 0)
				dbUB.Interest = decimal.New(0, 0)
				dbUB.Status = 0
				txTime := time.Unix(int64(txBlock.Time()), 0)
				dbUB.UpdateTime = &txTime
				dbOp := new(DecatsTxOp)
				dbOp.DecatsOpType = DecatsOpBalance
				dbOp.DecatsBalance = dbUB
				me.context.TransactionOp <- dbOp

				dbUBH := new(asset.TDecatsBalancesHistory)
				dbUBH.Address = customer
				dbUBH.CustomerId = client.Id
				dbUBH.AgentId = client.AgentId
				dbUBH.Token = tokenName
				dbUBH.Type = asset.DecatsTxTypeInterest
				dbUBH.Amount = decimal.NewFromBigInt(events.Interests[i], 0)
				dbUBH.Balance = decimal.NewFromBigInt(client.Balance[tokenName], 0)
				dbUBH.UpdateTime = &txTime
				dbUBH.TxHash = vLog.TxHash.Hex()
				dbUBH.Status = 0
				dbOp = new(DecatsTxOp)
				dbOp.DecatsOpType = DecatsOpBalanceHistory
				dbOp.DecatsBalanceHis = dbUBH
			}
			client.BalanceUpdateTime = txBlock.Time()
		}

	case me.EventHash["UpdateCredit"].Hex():
		var events LogUpdateCredit
		err := me.PoolAbi.UnpackIntoInterface(&events, "UpdateCredit", vLog.Data)

		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("failed to unpack logs: ", err.Error())
			break
		}
		customerAddr := common.HexToAddress(vLog.Topics[1].Hex())
		customer := strings.ToLower(customerAddr.Hex())
		log.GetLogger(log.Name.Root).Infof("UpdateCredit %s %d %d\n", customer, events.NewCredit, events.OldCredit)
		if client, ok := me.ClientMap[customerAddr]; ok {
			client.Credit = events.NewCredit
			client.CreditInReal = new(big.Float).Quo(new(big.Float).SetInt(events.NewCredit), me.TokenDecimal["USDM"])
		} else {
			//find client details in db
			user, err := DbGetUser(me.context, customer)
			if err != nil {
				log.GetLogger(log.Name.Root).Errorln("Can't get user addr=", customer)
			} else {
				//create client
				log.GetLogger(log.Name.Root).Infoln("Created new user ", customer)
				me.createNewClient(user)
			}

		}

	case me.EventHash["UpdateRiskLevel"].Hex():
		var events LogUpdateRiskLevel
		err := me.PoolAbi.UnpackIntoInterface(&events, "UpdateRiskLevel", vLog.Data)

		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("failed to unpack logs: ", err.Error())
			break
		}

		customerAddr := common.HexToAddress(vLog.Topics[1].Hex())
		customer := strings.ToLower(customerAddr.Hex())
		log.GetLogger(log.Name.Root).Infof("UpdateRiskLevel %s %d %d\n", customer, events.NewRiskLevel, events.OldRiskLevel)

		if client, ok := me.ClientMap[customerAddr]; ok {
			//client.RiskLevel = events.NewRiskLevel
			client.RiskLevel = new(big.Float).Quo(new(big.Float).SetInt(events.NewRiskLevel), big.NewFloat(1000000))
		} else {
			//find client details in db
			user, err := DbGetUser(me.context, customer)
			if err != nil {
				log.GetLogger(log.Name.Root).Errorln("Can't get user addr=", customer)
			} else {
				//create client
				log.GetLogger(log.Name.Root).Infoln("Created new user ", customer)
				me.createNewClient(user)
			}
		}

	case me.EventHash["Stopout"].Hex():
		var events LogStopOut
		err := me.PoolAbi.UnpackIntoInterface(&events, "Stopout", vLog.Data)

		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("failed to unpack logs: ", err.Error())
			break
		}

		customerAddr := common.HexToAddress(vLog.Topics[1].Hex())
		customer := strings.ToLower(customerAddr.Hex())
		log.GetLogger(log.Name.Root).Infof("Stopout %s %d %d %d\n", customer, events.StopoutEquity, events.StopoutFunding, events.FinalBalance)

		txBlock, _ := me.ethClient.GetBlockByNumber(new(big.Int).SetUint64(vLog.BlockNumber))
		if client, ok := me.ClientMap[customerAddr]; ok {
			//dbStopout := new(asset.TDecatsStopout)
			dbStopout, err := DbGetStopoutByTxHash(me.context, vLog.TxHash.Hex())
			if err != nil {
				// no record from db, mark only details from events
				dbStopout = new(asset.TDecatsStopout)
				dbStopout.Address = customer
				dbStopout.AgentId = client.AgentId
				dbStopout.CustomerId = client.Id
				dbStopout.Credit = decimal.NewFromBigInt(events.StopoutFunding, 0)
				dbStopout.Equity = decimal.NewFromBigInt(events.StopoutEquity, 0)
			}

			txTime := time.Unix(int64(txBlock.Time()), 0)
			dbStopout.TxTime = &txTime
			dbStopout.TxStatus = 2

			dbOp := new(DecatsTxOp)
			dbOp.DecatsOpType = DecatsOpStopout
			dbOp.DecatsStopout = dbStopout
			me.context.TransactionOp <- dbOp
		}

	case me.EventHash["UpdateTokenInterestRate"].Hex():
		var events LogUpdateTokenInterestRate
		err := me.PoolAbi.UnpackIntoInterface(&events, "UpdateTokenInterestRate", vLog.Data)

		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("failed to unpack logs: ", err.Error())
			break
		}

		me.InterestRateMap[events.TokenName] = events.NewInterestRate
		log.GetLogger(log.Name.Root).Infof("UpdateTokenInterestRate %s %d %d %d %d\n", events.TokenName, events.OldEffectiveTime, events.OldInterestRate, events.NewInterestRate, events.NewEffectiveTime)

	case me.EventHash["UpdateStatus"].Hex():
		var events LogUpdateStatus
		err := me.PoolAbi.UnpackIntoInterface(&events, "UpdateStatus", vLog.Data)

		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("failed to unpack logs: ", err.Error())
			break
		}

		customerAddr := common.HexToAddress(vLog.Topics[1].Hex())
		customer := strings.ToLower(customerAddr.Hex())
		log.GetLogger(log.Name.Root).Infof("UpdateStatus %s %d %d\n", customer, events.NewStatus, events.OldStatus)

		//find client details in db
		user, err := DbGetUser(me.context, customer)
		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("Can't get user addr=", customer)
		} else {
			if _, ok := me.ClientMap[customerAddr]; ok {
				//reload client
				log.GetLogger(log.Name.Root).Infoln("Reload user ", customer)
				me.reloadUserFromDB(customerAddr, user)
			} else {
				//create client
				log.GetLogger(log.Name.Root).Infoln("Created new user ", customer)
				me.createNewClient(user)
			}
		}
	}
}

func (me *DecatsProcessor) createNewClient(client *asset.TDecatsCustomers) {
	decatsClient := new(DecatsClient)
	decatsClient.Id = client.Id
	decatsClient.AgentId = client.AgentId
	decatsClient.Address = common.HexToAddress(client.Address)
	decatsClient.CreditMode = client.CreditMode
	fmt.Printf("creditMode %s %d\n", client.Address, decatsClient.CreditMode)
	if decatsClient.CreditMode != 0 {
		decatsClient.Credit = client.MaxFunding.BigInt()
	} else {
		decatsClient.Credit = big.NewInt(0)
	}
	decatsClient.CreditInReal = new(big.Float).Quo(new(big.Float).SetInt(decatsClient.Credit), me.TokenDecimal["USDM"])

	decatsClient.RiskLevel = new(big.Float).Quo(new(big.Float).SetInt(client.RiskLevel.BigInt()), big.NewFloat(1000000))
	decatsClient.Leverage = new(big.Float).Quo(client.Leverage.BigFloat(), big.NewFloat(1000))
	decatsClient.Balance = make(map[string]*big.Int)
	decatsClient.Interest = make(map[string]*big.Int)
	decatsClient.BalanceInReal = make(map[string]*big.Float)
	decatsClient.InterestInReal = make(map[string]*big.Float)
	for _, token := range tokenList {
		decatsClient.Balance[token] = big.NewInt(0)
		decatsClient.Interest[token] = big.NewInt(0)
		decatsClient.BalanceInReal[token] = big.NewFloat(0)
		decatsClient.InterestInReal[token] = big.NewFloat(0)
	}

	me.ClientMap[decatsClient.Address] = decatsClient
}

func (me *DecatsProcessor) reloadUserFromDB(address common.Address, client *asset.TDecatsCustomers) {
	me.ClientMap[address].AgentId = client.AgentId
	me.ClientMap[address].CreditMode = client.CreditMode
	if me.ClientMap[address].CreditMode != 0 {
		me.ClientMap[address].Credit = client.MaxFunding.BigInt()
	} else {
		me.ClientMap[address].Credit = big.NewInt(0)
	}
	me.ClientMap[address].CreditInReal = new(big.Float).Quo(new(big.Float).SetInt(me.ClientMap[address].Credit), me.TokenDecimal["USDM"])

	me.ClientMap[address].RiskLevel = new(big.Float).Quo(new(big.Float).SetInt(client.RiskLevel.BigInt()), big.NewFloat(1000000))
	me.ClientMap[address].Leverage = new(big.Float).Quo(client.Leverage.BigFloat(), big.NewFloat(1000))

}

func (me *DecatsProcessor) RunPoolContractEventProcessAsync(eventChan chan types.Log, sub geth.Subscription) {
	go func(eventChannel chan types.Log, subscriber geth.Subscription) {

		for {
			select {
			case err := <-subscriber.Err():
				log.GetLogger(log.Name.Root).Fatal(err)
			case vLog := <-eventChannel:
				me.proccessDecatsLog(vLog)
			}
		}
	}(eventChan, sub)
}

func (me *DecatsProcessor) RunSideChainBlockSubscriberAsync(subscriber *ethereum.BlockSubscriber) {
	go func(subscriber *ethereum.BlockSubscriber) {
		for {
			block, serverErr := subscriber.GetLatestBlock()
			if serverErr != nil {
				if serverErr.GetReturnCode() != foundation.NetworkError {
					log.GetLogger(me.context.LoggerName).Error("Unable to get block by block number: ", serverErr.Error())
				}
				time.Sleep(1 * time.Second)
				continue
			}
			if BlockHasTransaction(block) {
				me.processSideChainTransaction(block)
			}

			fmt.Printf("Block number %d\n", block.Number())
			me.updateLatestPrice(block.Number(), block.Time())
			//update interest if interval reached
			thisblockTime := block.Time() / (uint64(interestInterval) / 1000000000)
			timeDiff := thisblockTime - me.LastInterestBlockTime
			fmt.Printf("time diff in interest interval %d %d %d\n", timeDiff, thisblockTime, me.LastInterestBlockTime)
			if timeDiff > 0 {
				now := time.Unix(int64(block.Time()), 0)
				toTime := now.Truncate(interestInterval)
				fromTime := toTime.Add(time.Duration(-1) * interestInterval)
				fmt.Println("interests")
				for _, client := range me.ClientMap {
					if client.CreditMode == 0 {
						me.CalInterest(client, fromTime, toTime, true, false)
					}
				}
				me.LastInterestBlockTime = thisblockTime
			}
			thisK0Time := block.Time() / (uint64(k0Interval) / 1000000000)
			timeK0Diff := thisK0Time - me.LastK0BlockTime
			fmt.Printf("time diff in K0 interval %d %d %d\n", timeK0Diff, thisK0Time, me.LastK0BlockTime)
			if timeK0Diff > 0 {
				var priceToken = [...]string{"ETHM", "BTCM"}
				for _, token := range priceToken {
					dbPriceTrans := new(asset.TDecatsPriceHistory)
					dbPriceTrans.PairName = me.PriceList[token].PairName
					lastPrice, _ := me.PriceList[token].Price.Float64()
					highPrice, _ := me.PriceList[token].High.Float64()
					lowPrice, _ := me.PriceList[token].Low.Float64()
					openPrice, _ := me.PriceList[token].Open.Float64()
					dbPriceTrans.Close = decimal.NewFromFloat(lastPrice)
					dbPriceTrans.High = decimal.NewFromFloat(highPrice)
					dbPriceTrans.Low = decimal.NewFromFloat(lowPrice)
					dbPriceTrans.Open = decimal.NewFromFloat(openPrice)
					dbPriceTrans.Volume = decimal.NewFromBigInt(me.PriceList[token].Volume, 0)
					dbPriceTrans.Interval = k0IntervalSeconds

					dbPriceTrans.Reserve0 = decimal.NewFromBigInt(me.PriceList[token].Reserve0, 0)
					dbPriceTrans.Reserve1 = decimal.NewFromBigInt(me.PriceList[token].Reserve1, 0)
					dbPriceTrans.CreatedDate = time.Unix(int64(block.Time()), 0)

					me.PriceList[token].Open.Set(me.PriceList[token].Price)
					me.PriceList[token].High.Set(me.PriceList[token].Price)
					me.PriceList[token].Low.Set(me.PriceList[token].Price)
					me.PriceList[token].Volume.Set(big.NewInt(0))

					dbOP := new(DecatsTxOp)
					dbOP.DecatsOpType = DecatsOpPriceHistory
					dbOP.DecatsPriceHistory = dbPriceTrans
					me.context.TransactionOp <- dbOP
				}

				me.LastK0BlockTime = thisK0Time
			}

			thisK1Time := block.Time() / (uint64(k1Interval) / 1000000000)
			timeK1Diff := thisK1Time - me.LastK1BlockTime
			fmt.Printf("time diff in K1 interval %d %d %d\n", timeK1Diff, thisK1Time, me.LastK1BlockTime)
			if timeK1Diff > 0 {
				now := time.Unix(int64(block.Time()), 0)
				toTime := now.Truncate(k1Interval)
				fromTime := toTime.Add(time.Duration(-1) * k1Interval)
				fmt.Println("K1")
				DbInsertKLine(me.context, fromTime, toTime, k1IntervalSeconds)

				me.LastK1BlockTime = thisK1Time
			}
			thisK2Time := block.Time() / (uint64(k2Interval) / 1000000000)
			timeK2Diff := thisK2Time - me.Lastk2BlockTime
			fmt.Printf("time diff in K2 interval %d %d %d\n", timeK2Diff, thisK2Time, me.Lastk2BlockTime)
			if timeK2Diff > 0 {
				now := time.Unix(int64(block.Time()), 0)
				toTime := now.Truncate(k2Interval)
				fromTime := toTime.Add(time.Duration(-1) * k2Interval)
				fmt.Println("K2")
				DbInsertKLine(me.context, fromTime, toTime, k2IntervalSeconds)
				me.Lastk2BlockTime = thisK2Time
			}

			thisK3Time := block.Time() / (uint64(k3Interval) / 1000000000)
			timeK3Diff := thisK3Time - me.Lastk3BlockTime
			fmt.Printf("time diff in K3 interval %d %d %d\n", timeK3Diff, thisK3Time, me.Lastk3BlockTime)
			if timeK3Diff > 0 {
				now := time.Unix(int64(block.Time()), 0)
				toTime := now.Truncate(k3Interval)
				fromTime := toTime.Add(time.Duration(-1) * k3Interval)
				fmt.Println("K3")
				DbInsertKLine(me.context, fromTime, toTime, k3IntervalSeconds)
				me.Lastk3BlockTime = thisK3Time
			}

			me.updateClientRiskLevelPhase2()
			err := me.progressCounter.UpdateScannedBlock(block.Number())
			if err != nil {
				log.GetLogger(me.context.LoggerName).Errorln("Unable to update chain latest block number: ", block.Number().String(), " error: ", err.Error())
			}

			dbOP := new(DecatsTxOp)
			dbOP.DecatsOpType = DecatsOpComit
			me.context.TransactionOp <- dbOP
		}
	}(subscriber)
}

func (me *DecatsProcessor) processSideChainTransaction(block *types.Block) {

	for _, trans := range block.Transactions() {

		receipt, err := me.scProcessor.QuerySideChainEthReceiptWithSetting(trans, 1, -1)
		if err != nil {
			log.GetLogger(me.context.LoggerName).Errorln("Unable to query receipt for trans hash: ", trans.Hash(), " Error: ", err.Error())
			continue
		}

		for _, logMessage := range receipt.Logs {
			fmt.Printf("log address %s pool address %s \n", logMessage.Address.Hex(), me.poolContractAddress.Hex())
			if bytes.Equal(logMessage.Address.Bytes(), me.poolContractAddress.Bytes()) {
				fmt.Printf("log message signature %s\n", logMessage.Topics[0].Hex())
				me.proccessDecatsLog(*logMessage)
			}
		}

		//

	}
	fmt.Printf("New Block %d Finished\n", block.Number())
}

func (me *DecatsProcessor) updateLatestPrice(block_number *big.Int, block_time uint64) {
	rev1, err := me.ethPairContract.GetReserves(&bind.CallOpts{})
	if err == nil {
		var p1, p2 *big.Float
		if me.ethPairRev0 {
			p1 = new(big.Float).SetInt(rev1.Reserve0)
			p2 = new(big.Float).SetInt(rev1.Reserve1)
		} else {
			p1 = new(big.Float).SetInt(rev1.Reserve1)
			p2 = new(big.Float).SetInt(rev1.Reserve0)
		}
		p11 := new(big.Float).Quo(p1, me.TokenDecimal["ETHM"])
		p21 := new(big.Float).Quo(p2, me.TokenDecimal["USDM"])
		price1 := new(big.Float).Quo(p21, p11)

		me.PriceList["ETHM"].Price = price1
		if me.PriceList["ETHM"].Open.Cmp(big.NewFloat(0)) <= 0 {
			me.PriceList["ETHM"].Open = price1
		}
		me.PriceList["ETHM"].Reserve0 = rev1.Reserve0
		me.PriceList["ETHM"].Reserve1 = rev1.Reserve1
		if me.PriceList["ETHM"].High.Cmp(price1) < 0 {
			me.PriceList["ETHM"].High.Set(price1)
		}
		if me.PriceList["ETHM"].Low.Cmp(price1) > 0 {
			me.PriceList["ETHM"].Low.Set(price1)
		}

		dbPriceTrans := new(asset.TDecatsPrice)
		dbPriceTrans.PairName = "ETHM/USDM"
		dbPriceTrans.Reserve0 = decimal.NewFromBigInt(rev1.Reserve0, 0)
		dbPriceTrans.Reserve1 = decimal.NewFromBigInt(rev1.Reserve1, 0)
		dbPriceTrans.CreatedDate = time.Unix(int64(block_time), 0)

		dbOP := new(DecatsTxOp)
		dbOP.DecatsOpType = DecatsOpPrice
		dbOP.DecatsPrice = dbPriceTrans
		me.context.TransactionOp <- dbOP

		dbBlockPrice := new(asset.TDecatsBlockPrice)
		dbBlockPrice.PairName = "ETHM/USDM"
		dbBlockPrice.Reserve0 = decimal.NewFromBigInt(rev1.Reserve0, 0)
		dbBlockPrice.Reserve1 = decimal.NewFromBigInt(rev1.Reserve1, 0)
		dbBlockPrice.BlockNo = decimal.NewFromBigInt(block_number, 0)
		dbBlockPrice.CreatedDate = dbPriceTrans.CreatedDate

		dbOP2 := new(DecatsTxOp)
		dbOP2.DecatsOpType = DecatsOpBlockPrice
		dbOP2.DecatsBlockPrice = dbBlockPrice
		me.context.TransactionOp <- dbOP2
	}

	rev2, err := me.btcPairContract.GetReserves(&bind.CallOpts{})
	if err == nil {
		var p3, p4 *big.Float
		if me.btcPairRev0 {
			p3 = new(big.Float).SetInt(rev2.Reserve0)
			p4 = new(big.Float).SetInt(rev2.Reserve1)
		} else {
			p3 = new(big.Float).SetInt(rev2.Reserve1)
			p4 = new(big.Float).SetInt(rev2.Reserve0)
		}
		p31 := new(big.Float).Quo(p3, me.TokenDecimal["BTCM"])
		p41 := new(big.Float).Quo(p4, me.TokenDecimal["USDM"])
		price2 := new(big.Float).Quo(p41, p31)

		me.PriceList["BTCM"].Price = price2
		if me.PriceList["BTCM"].Open.Cmp(big.NewFloat(0)) <= 0 {
			me.PriceList["BTCM"].Open = price2
		}
		me.PriceList["BTCM"].Reserve0 = rev2.Reserve0
		me.PriceList["BTCM"].Reserve1 = rev2.Reserve1
		if me.PriceList["BTCM"].High.Cmp(price2) < 0 {
			me.PriceList["BTCM"].High.Set(price2)
		}
		if me.PriceList["BTCM"].Low.Cmp(price2) > 0 {
			me.PriceList["BTCM"].Low.Set(price2)
		}

		dbPriceTrans := new(asset.TDecatsPrice)
		dbPriceTrans.PairName = "BTCM/USDM"
		dbPriceTrans.Reserve0 = decimal.NewFromBigInt(rev2.Reserve0, 0)
		dbPriceTrans.Reserve1 = decimal.NewFromBigInt(rev2.Reserve1, 0)
		dbPriceTrans.CreatedDate = time.Unix(int64(block_time), 0)

		dbOP := new(DecatsTxOp)
		dbOP.DecatsOpType = DecatsOpPrice
		dbOP.DecatsPrice = dbPriceTrans
		me.context.TransactionOp <- dbOP

		dbBlockPrice := new(asset.TDecatsBlockPrice)
		dbBlockPrice.PairName = "BTCM/USDM"
		dbBlockPrice.Reserve0 = decimal.NewFromBigInt(rev2.Reserve0, 0)
		dbBlockPrice.Reserve1 = decimal.NewFromBigInt(rev2.Reserve1, 0)
		dbBlockPrice.BlockNo = decimal.NewFromBigInt(block_number, 0)
		dbBlockPrice.CreatedDate = dbPriceTrans.CreatedDate

		dbOP2 := new(DecatsTxOp)
		dbOP2.DecatsOpType = DecatsOpBlockPrice
		dbOP2.DecatsBlockPrice = dbBlockPrice
		me.context.TransactionOp <- dbOP2
	}

}

func (me *DecatsProcessor) updateClientRiskLevel() {
	//var priceToken = [...]string {"ETHM", "BTCM", ""}
	now := time.Now()
	for _, client := range me.ClientMap {
		if client.LastStopoutTime != nil {
			fmt.Printf("last stopout time %s  %d %d\n", client.Address.Hex(), client.LastStopoutTime.Unix(), now.Unix()-client.LastStopoutTime.Unix())
		}

		if client.LastStopoutTime == nil || now.Unix()-client.LastStopoutTime.Unix() > int64(me.config.StopoutInterval) {

			totalEquity := big.NewFloat(0)
			USDLOnly := true
			for _, token := range tokenList {
				tokenBal := new(big.Float).Sub(client.BalanceInReal[token], client.InterestInReal[token])
				//bal := new(big.Float).Quo(new(big.Float).SetInt(tokenBal), me.TokenDecimal[token])
				balPri := new(big.Float).Mul(tokenBal, me.PriceList[token].Price)
				fmt.Printf("equity for %s %f\n", token, balPri)
				if tokenBal.Cmp(big.NewFloat(0)) != 0 && token != "USDM" {
					USDLOnly = false
				}
				totalEquity = new(big.Float).Add(totalEquity, balPri)
			}

			fmt.Printf("total equity %f\n", totalEquity)
			fmt.Printf("credit %f\n", client.CreditInReal)

			if client.CreditInReal.Cmp(big.NewFloat(0)) > 0 {
				equityNcredit := new(big.Float).Add(totalEquity, client.CreditInReal)

				client.RiskLevelCurrent = new(big.Float).Quo(equityNcredit, client.CreditInReal)

				fmt.Printf("Risk level %s %f %f\n", client.Address.Hex(), client.RiskLevelCurrent, client.RiskLevel)

				if client.RiskLevelCurrent.Cmp(client.RiskLevel) < 0 && !USDLOnly {
					stopoutTx, err := me.scProcessor.CallStopout(client.Address.Hex())
					if err != nil {
						//error sending out stopout
					} else {
						now := time.Now()
						client.LastStopoutTime = &now
						client.LastStopoutTx = stopoutTx
					}
				}
			} else {
				if totalEquity.Cmp(big.NewFloat(0)) < 0 && !USDLOnly {
					// total equity is negative while no credit
					stopoutTx, err := me.scProcessor.CallStopout(client.Address.Hex())
					if err != nil {
						//error sending out stopout
					} else {
						now := time.Now()
						client.LastStopoutTime = &now
						client.LastStopoutTx = stopoutTx
					}
				} else {
					fmt.Printf("Zero credit user %s %f %f\n", client.Address.Hex(), client.CreditInReal, totalEquity)
				}
			}
		}

	}

}

func (me *DecatsProcessor) updateClientRiskLevelPhase2() {
	now := time.Now()
	for _, client := range me.ClientMap {

		if client.CreditMode == 1 {
			continue
		}

		if client.LastStopoutTime != nil {
			fmt.Printf("last stopout time %s  %d %d\n", client.Address.Hex(), client.LastStopoutTime.Unix(), now.Unix()-client.LastStopoutTime.Unix())
		}

		if client.LastStopoutTime == nil || now.Unix()-client.LastStopoutTime.Unix() > int64(me.config.StopoutInterval) {

			totalEquity := big.NewFloat(0)
			totalUsedFund := big.NewFloat(0)

			USDLOnly := true
			for _, token := range tokenList {
				tokenBal := new(big.Float).Sub(client.BalanceInReal[token], client.InterestInReal[token])
				//bal := new(big.Float).Quo(new(big.Float).SetInt(tokenBal), me.TokenDecimal[token])
				balPri := new(big.Float).Mul(tokenBal, me.PriceList[token].Price)
				fmt.Printf("equity for %s %f\n", token, balPri)
				if tokenBal.Cmp(big.NewFloat(0)) != 0 && token != "USDM" {
					USDLOnly = false
				}
				totalEquity = new(big.Float).Add(totalEquity, balPri)
				if tokenBal.Cmp(big.NewFloat(0)) < 0 {
					fmt.Printf("token balance is neg %f\n", tokenBal)
					totalUsedFund = new(big.Float).Add(totalUsedFund, balPri)
				}
			}

			totalUsedFund = new(big.Float).Abs(totalUsedFund)

			fmt.Printf("total equity %f\n", totalEquity)
			fmt.Printf("total used fund %f\n", totalUsedFund)
			fmt.Printf("credit %f\n", client.CreditInReal)

			if totalUsedFund.Cmp(big.NewFloat(0)) > 0 {
				x, y, z, rl := big.NewFloat(0), big.NewFloat(0), big.NewFloat(0), big.NewFloat(0)
				x.Mul(totalEquity, client.Leverage)
				y.Add(x, client.CreditInReal)
				z.Quo(y, totalUsedFund)
				rl.Sub(big.NewFloat(1), z)
				fmt.Printf("Risk level is %f %f %f %f\n", rl, x, y, z)
				if rl.Cmp(big.NewFloat(0)) < 0 {
					client.RiskLevelCurrent = big.NewFloat(0)
				} else {
					client.RiskLevelCurrent = rl
				}
			} else {
				fmt.Printf("No credit Used, risk level is 0\n")
				client.RiskLevelCurrent = big.NewFloat(0)
			}

			fmt.Printf("Risk level %s %f %f\n", client.Address.Hex(), client.RiskLevelCurrent, client.RiskLevel)
			if client.RiskLevelCurrent.Cmp(client.RiskLevel) > 0 && !USDLOnly {
				fmt.Printf("Stopout Sent %s\n", client.Address.Hex())
				stopoutTx, err := me.scProcessor.CallStopout(client.Address.Hex())
				if err != nil {
					//error sending out stopout

				} else {
					now := time.Now()
					client.LastStopoutTime = &now
					client.LastStopoutTx = stopoutTx

					dbStopout := new(asset.TDecatsStopout)
					dbStopout.Address = strings.ToLower(client.Address.Hex())
					dbStopout.AgentId = client.AgentId
					dbStopout.CustomerId = client.Id
					credit, _ := client.CreditInReal.Float64()
					dbStopout.Credit = decimal.NewFromFloat(credit)
					equity, _ := totalEquity.Float64()
					dbStopout.Equity = decimal.NewFromFloat(equity)
					dbStopout.RequestTime = &now
					leverage, _ := client.Leverage.Float64()
					dbStopout.Leverage = decimal.NewFromFloat(leverage)
					fundingUsed, _ := totalUsedFund.Float64()
					dbStopout.FundingUsed = decimal.NewFromFloat(fundingUsed)
					risklevel, _ := client.RiskLevel.Float64()
					dbStopout.RiskLevel = decimal.NewFromFloat(risklevel)
					dbStopout.TxHash = stopoutTx.Hash().Hex()
					dbStopout.TxStatus = 0

					dbOp := new(DecatsTxOp)
					dbOp.DecatsOpType = DecatsOpStopout
					dbOp.DecatsStopout = dbStopout

					me.context.TransactionOp <- dbOp

				}
			}
		}
	}
}

func (me *DecatsProcessor) RunUpdatePriceHistoryDbAsync() {
	var priceToken = [...]string{"ETHM", "BTCM"}
	go func(context *DecatsProcessorContext) {
		jt := NewJobTicker(time.Minute)
		for {
			<-jt.t.C
			fmt.Println(time.Now(), "- just ticked")
			for _, token := range priceToken {
				dbPriceTrans := new(asset.TDecatsPriceHistory)
				dbPriceTrans.PairName = me.PriceList[token].PairName
				lastPrice, _ := me.PriceList[token].Price.Float64()
				highPrice, _ := me.PriceList[token].High.Float64()
				lowPrice, _ := me.PriceList[token].Low.Float64()
				openPrice, _ := me.PriceList[token].Open.Float64()
				dbPriceTrans.Close = decimal.NewFromFloat(lastPrice)
				dbPriceTrans.High = decimal.NewFromFloat(highPrice)
				dbPriceTrans.Low = decimal.NewFromFloat(lowPrice)
				dbPriceTrans.Open = decimal.NewFromFloat(openPrice)
				dbPriceTrans.Volume = decimal.NewFromBigInt(me.PriceList[token].Volume, 0)
				dbPriceTrans.Interval = 60

				dbPriceTrans.Reserve0 = decimal.NewFromBigInt(me.PriceList[token].Reserve0, 0)
				dbPriceTrans.Reserve1 = decimal.NewFromBigInt(me.PriceList[token].Reserve1, 0)
				dbPriceTrans.CreatedDate = time.Now()

				me.PriceList[token].Open.Set(me.PriceList[token].Price)
				me.PriceList[token].High.Set(me.PriceList[token].Price)
				me.PriceList[token].Low.Set(me.PriceList[token].Price)
				me.PriceList[token].Volume.Set(big.NewInt(0))

				dbOP := new(DecatsTxOp)
				dbOP.DecatsOpType = DecatsOpPriceHistory
				dbOP.DecatsPriceHistory = dbPriceTrans
				me.context.TransactionOp <- dbOP
			}
			jt.updateJobTicker()
		}
	}(me.context)
}

func (me *DecatsProcessor) RunUpdateInterestAsync() {
	go func(context *DecatsProcessorContext) {
		interval := interestInterval //15 * time.Minute //time.Hour
		jt := NewJobTicker(interval)

		now := time.Now()
		expectedTime := now.Truncate(interval).Add(interval)
		for {
			<-jt.t.C
			jt.updateJobTicker()
			now = time.Now()
			if now.Before(expectedTime) {
				continue
			}
			expectedTime = now.Truncate(interval).Add(interval)

			toTime := now.Truncate(interval)
			fromTime := toTime.Add(time.Duration(-1) * interval)
			fmt.Println("interests")
			for _, client := range me.ClientMap {
				if client.CreditMode == 0 {
					me.CalInterest(client, fromTime, toTime, true, false)
				}
			}

		}
	}(me.context)
}

func (me *DecatsProcessor) CalInterest(client *DecatsClient, fromTime time.Time, toTime time.Time, insertDb bool, usePastRate bool) {
	USDLOnly := true
	for _, t := range tokenList {
		if client.BalanceInReal[t].Cmp(big.NewFloat(0)) != 0 && t != "USDM" {
			USDLOnly = false
		}
	}

	if USDLOnly {
		// no other position, skip calculating interest
		return
	}

	for _, token := range tokenList {
		if _, ok := client.Balance[token]; ok {
			if big.NewInt(0).Cmp(client.Balance[token]) > 0 {
				//Negative, need to cal interest
				m, n, d := big.NewInt(0), big.NewInt(0), big.NewInt(-1000000000)
				if usePastRate {
					for _, interestRate := range me.InterestRateHistory[token] {
						if toTime.Unix() >= interestRate.EffectiveTime.Int64() {
							m.Mul(client.Balance[token], interestRate.Rate)
							break
						}

					}
				} else {
					m.Mul(client.Balance[token], me.InterestRateMap[token])
				}
				n.Quo(m, d)
				fmt.Printf("interest ::: %s %d %d %d\n", token, m, n, d)

				factor := new(big.Int).Quo(me.TokenDecimalInt[token], big.NewInt(1000000))
				if n.Cmp(factor) >= 0 {
					x, y, z := big.NewInt(0), big.NewInt(0), big.NewInt(0)
					x.Add(n, big.NewInt(factor.Int64()/2))
					y.Quo(x, factor)
					z.Mul(y, factor)
					client.Interest[token].Add(client.Interest[token], z)
					client.InterestInReal[token] = new(big.Float).Quo(new(big.Float).SetInt(client.Interest[token]), me.TokenDecimal[token])

					if insertDb {
						dbTrans := new(asset.TDecatsInterestHistory)
						dbTrans.Address = strings.ToLower(client.Address.Hex())
						dbTrans.CustomerId = client.Id
						dbTrans.AgentId = client.AgentId
						dbTrans.FromTime = &fromTime
						dbTrans.ToTime = &toTime
						dbTrans.TotalInterest = decimal.NewFromBigInt(client.Interest[token], 0)
						dbTrans.Interest = decimal.NewFromBigInt(z, 0)
						dbTrans.Amount = decimal.NewFromBigInt(client.Balance[token], 0)
						dbTrans.Token = token
						dbTrans.Rate = decimal.NewFromBigInt(me.InterestRateMap[token], 0)
						dbTrans.Status = 1
						//DbInsertInterestHistory(me.context, dbTrans)
						dbOP := new(DecatsTxOp)
						dbOP.DecatsOpType = DecatsOpInterest
						dbOP.DecatsInterest = dbTrans
						me.context.TransactionOp <- dbOP

						dbUB := new(asset.TDecatsBalance)
						dbUB.Address = strings.ToLower(client.Address.Hex())
						dbUB.CustomerId = client.Id
						dbUB.AgentId = client.AgentId
						dbUB.Token = token
						dbUB.Balance = decimal.NewFromBigInt(client.Balance[token], 0)
						dbUB.Interest = decimal.NewFromBigInt(client.Interest[token], 0)
						dbUB.Status = 1
						txTime := time.Now()
						dbUB.UpdateTime = &txTime
						//DbUpdateUserBalance(me.context, dbUB)
						dbOP = new(DecatsTxOp)
						dbOP.DecatsOpType = DecatsOpBalance
						dbOP.DecatsBalance = dbUB
						me.context.TransactionOp <- dbOP
					}
				}
			}
		}

	}
}

func BlockHasTransaction(block *types.Block) bool {
	return block.Transactions().Len() > 0
}

func findTradePair(tradePair string, onPair string) string {
	s := strings.Split(tradePair, "/")

	if len(s) != 2 {
		return ""
	}

	if onPair == s[0] {
		return s[1]
	}

	return s[0]
}
