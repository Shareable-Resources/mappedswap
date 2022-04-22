package ethereum

import (
	"context"
	"errors"
	"eurus-backend/foundation"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/sirupsen/logrus"
)

type BlockSubscriber struct {
	Client         *EthClient
	Subscription   ethereum.Subscription
	Header         chan *types.Header
	isReConnecting bool
	Logger         *logrus.Logger
}

func NewBlockSubscriber(client *EthClient) (*BlockSubscriber, error) {
	if !client.isWebSocketClient() {
		return nil, errors.New("EthClient of the Block Subscriber should be using WebSocket Protocol")
	}
	me := new(BlockSubscriber)
	headers := make(chan *types.Header)
	me.Header = headers
	me.Client = client
	sub, err := me.Client.Client.SubscribeNewHead(context.Background(), headers)
	if err != nil {
		return nil, err
	} else {
		me.Subscription = sub
		return me, nil
	}
}

func (me *BlockSubscriber) GetLatestBlock() (*types.Block, *foundation.ServerError) {
	var err error
	if me.isReConnecting {
		return nil, foundation.NewErrorWithMessage(foundation.NetworkError, "Reconnecting")
	}

	select {
	case err = <-me.Subscription.Err():
		if !me.isReConnecting {
			me.isReConnecting = true
			go me.reSubscribeHead()
		}
		if err == nil {
			return nil, foundation.NewErrorWithMessage(foundation.NetworkError, "Reconnecting to ethereum")
		}
		return nil, foundation.NewErrorWithMessage(foundation.NetworkError, err.Error())
	case header := <-me.Header:
		block, err := me.Client.GetBlockByNumber(header.Number)
		if err != nil {
			return block, foundation.NewErrorWithMessage(foundation.EthereumError, err.Error())
		}
		return block, nil
	}
}

func (me *BlockSubscriber) reSubscribeHead() {
	if me.Logger != nil {
		me.Logger.Infoln("Going to resubscribe block head at IP: ", me.Client.IP, " Port: ", me.Client.Port)
	}

	for {
		sub, err := me.Client.Client.SubscribeNewHead(context.Background(), me.Header)
		if err == nil {
			me.Subscription = sub
			break
		}
		time.Sleep(time.Second)
	}
	me.isReConnecting = false

	if me.Logger != nil {
		me.Logger.Infoln("Resubscribe block head successful at IP: ", me.Client.IP, " Port: ", me.Client.Port)
	}
}

func (me *BlockSubscriber) RunSubscriber(blockHandler func(*types.Block)) {
	for {
		block, err := me.GetLatestBlock()
		if err != nil {
			if me.Logger != nil {
				me.Logger.Error("Unable to get block by block number: ", err.Error())
			}
		}
		go blockHandler(block)
	}
}
