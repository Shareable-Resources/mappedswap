package decats

import (
	"bufio"
	"context"
	"os"
	"strings"

	"eurus-backend/foundation/ethereum"
	"eurus-backend/foundation/log"
	"eurus-backend/secret"

	"eurus-backend/service_server"
	"fmt"

	geth "github.com/ethereum/go-ethereum"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"

	"github.com/shopspring/decimal"
)

type DecatsObserver struct {
	service_server.ServiceServer
	Config         *DecatsObserverConfig
	scProcessor    *DecatsSCProcessor
	transProcessor *DecatsProcessor
}

//var ClientMap map[common.Address]DecatsClient

func NewDecatsObserver() *DecatsObserver {
	observer := new(DecatsObserver)
	observer.Config = NewDecatsObserverConfig()
	observer.ServerConfig = &observer.Config.ServerConfigBase
	return observer
}

func (me *DecatsObserver) LoadConfig(configPath string) error {
	err := me.ServiceServer.LoadConfig(configPath, me.Config)
	if err != nil {
		return err
	}
	return nil
}

func (me *DecatsObserver) InitAll() {
	me.processInit()
}

func (me *DecatsObserver) processInit() {
	var processorLoggerName string = log.Name.Root

	_, err := me.InitDBFromConfig(me.ServerConfig)
	if err != nil {
		log.GetLogger(log.Name.Root).Error("Unable to connect to DB: ", err)
		panic(err)
	} else {
		log.GetLogger(log.Name.Root).Infoln("Init DB successfully")
	}

	me.EthClient, err = me.InitEthereumWebSocketClientFromConfig(me.ServerConfig)

	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Unable to Init EthWebSocketClient for side chain: ", err.Error())
		panic(err)
	} else {
		log.GetLogger(log.Name.Root).Infoln("EthWebSocketClient connected")
	}

	processorContext := NewDecatsProcessorContext(me.DefaultDatabase, me.Config, processorLoggerName)
	me.scProcessor = NewDecatsSCProcessor(me.Config, processorContext, secret.PoolContractAddress)
	err = me.scProcessor.Init()
	if err != nil {
		log.GetLogger(log.Name.Root).Fatalln("Unable to init DepositSCProcessor: ", err.Error())
		panic(err)
	}

	progressCounter, err := NewProgressCounter(me.EthClient.ChainID.Uint64(), me.Config.LastScanDBPath, log.Name.Root)

	me.transProcessor = NewDecatsProcessor(me.Config, me.scProcessor, processorContext, me.EthClient, progressCounter)
	err = me.transProcessor.Init()
	if err != nil {
		log.GetLogger(log.Name.Root).Error("Unable to Init DepositProcessor: ", err.Error())
		panic(err)
	}

	err = me.EthClient.SubscribeBlockHeader()
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Unable to subscribe side chain block head: ", err.Error())
		panic(err.Error())
	}

	fmt.Println("Deposit Observer start")

	//=====================

	me.transProcessor.InitClientList(me.transProcessor.context)
	me.transProcessor.InitEventList(me.Config.PoolAbiPath)
	me.transProcessor.ReloadClientBalanceFromDB(me.transProcessor.context)
	DbProcessUpdateThread(me.transProcessor.context)
	me.transProcessor.RunRescanFromLastBlock()
	me.transProcessor.RunSideChainBlockSubscriberAsync(me.EthClient.Subscriber)

	reader := bufio.NewReader(os.Stdin)
	fmt.Println("Simple Shell")
	fmt.Println("---------------------")

	for {
		fmt.Print("-> ")
		text, _ := reader.ReadString('\n')
		// convert CRLF to LF
		text = strings.Replace(text, "\n", "", -1)

		splitText := strings.Fields(text)
		if len(splitText) == 0 {
			continue
		}
	}

}

func (me *DecatsObserver) sideChainRescanHandler(sender *ethereum.ScanBlockCounter, eventId decimal.Decimal, chainId uint64, from decimal.Decimal, to decimal.Decimal) {

}

func (me *DecatsObserver) SubscribeToPoolContractEvents() (chan types.Log, geth.Subscription) {
	contractAddr := common.HexToAddress(secret.PoolContractAddress)

	query := geth.FilterQuery{
		Addresses: []common.Address{contractAddr},
	}

	poolLog := make(chan types.Log)

	sub, err := me.EthClient.SubscribeFilterLogs(context.Background(), query, poolLog)
	if err != nil {
		log.GetLogger(log.Name.Root).Fatal(err)
	}

	return poolLog, sub
	// for {
	// 	select {
	// 	case err := <-sub.Err():
	// 		log.GetLogger(log.Name.Root).Fatal(err)
	// 	case vLog := <-poolLog:
	// 		fmt.Println(vLog)
	// 	}
	// }

}
