package decats

import (
	"context"
	"eurus-backend/foundation/ethereum"
	"eurus-backend/smartcontract/build/golang/contract"
	"fmt"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/crypto"

	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"

	"github.com/pkg/errors"
)

type AssetAddressMap map[common.Address]string

type AssetNameMap map[string]common.Address

type DecatsSCProcessor struct {
	sideChainEthClient *ethereum.EthClient

	SidechainPlatformWalletAddr *common.Address
	config                      *DecatsObserverConfig
	context                     *DecatsProcessorContext //context has replaced db

	PoolContractAddress string
}

func NewDecatsSCProcessor(config *DecatsObserverConfig, context *DecatsProcessorContext, poolAddr string) *DecatsSCProcessor {
	processor := new(DecatsSCProcessor)
	processor.config = config
	processor.context = context
	processor.PoolContractAddress = poolAddr
	return processor
}

func (me *DecatsSCProcessor) Init() error {
	var err error
	//Connect sidechain
	me.sideChainEthClient = &ethereum.EthClient{
		Protocol: me.config.EthClientProtocol,
		IP:       me.config.EthClientIP,
		Port:     me.config.EthClientPort,
		ChainID:  big.NewInt(int64(me.config.EthClientChainID)),
	}
	_, err = me.sideChainEthClient.Connect()
	if err != nil {
		return errors.WithMessage(err, "Connect sidechain failed")
	}

	return nil
}

func (me *DecatsSCProcessor) QuerySideChainEthReceiptWithSetting(tx *types.Transaction, waitSecond int, retryCount int) (*ethereum.BesuReceipt, error) {
	return me.sideChainEthClient.QueryEthReceiptWithSetting(tx, waitSecond, retryCount)
}

func (me *DecatsSCProcessor) GetInterestRateHistory(token string) []contract.PoolStructInterestRate {
	poolAddress := common.HexToAddress(me.PoolContractAddress)
	pool, err := contract.NewIPool(poolAddress, me.sideChainEthClient.Client)
	if err != nil {
		return nil
	}

	result, err := pool.GetTokenInterestHistory(&bind.CallOpts{}, token, big.NewInt(0))
	if err != nil {
		return nil
	}

	return result

}

func (me *DecatsSCProcessor) CallStopout(targetAddress string) (*types.Transaction, error) {

	privateKey, err := crypto.HexToECDSA(me.config.OperationPrivateKey)
	if err != nil {
		return nil, err
	}
	opAddress := common.HexToAddress(me.config.OperationAccount)
	nonce, err := me.sideChainEthClient.Client.PendingNonceAt(context.Background(), opAddress)
	if err != nil {
		return nil, err
	}

	gasPrice, err := me.sideChainEthClient.Client.SuggestGasPrice(context.Background())
	if err != nil {
		return nil, err
	}

	auth := bind.NewKeyedTransactor(privateKey)
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)      // in wei
	auth.GasLimit = uint64(1000000) // in units
	auth.GasPrice = gasPrice

	poolAddress := common.HexToAddress(me.PoolContractAddress)
	target := common.HexToAddress(targetAddress)
	pool, err := contract.NewIPool(poolAddress, me.sideChainEthClient.Client)

	if err != nil {
		return nil, err
	}

	tx, err := pool.Stopout(auth, target)
	if err != nil {
		return nil, err
	}

	fmt.Printf("stopout sent: %s\n", tx.Hash().Hex())

	return tx, nil

}
