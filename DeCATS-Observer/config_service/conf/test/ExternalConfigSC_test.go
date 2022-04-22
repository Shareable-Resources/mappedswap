package test

import (
	"eurus-backend/config_service/conf"
	"eurus-backend/foundation/server"
	"testing"
)

func TestAddAssetAndGetter(t *testing.T) {
	configServer := conf.NewConfigServer()
	configServer.InitLog("ConfigServer.log")
	serverConfig := new(server.ServerConfigBase)
	err := configServer.LoadConfig("", serverConfig)
	if err != nil {
		t.Error(err.Error())
	}
	configServer.ServerConfig = serverConfig
	configServer.InitDBFromConfig(configServer.ServerConfig)
	configServer.InitSC()

	_, err = configServer.InitEthereumClientFromConfig(configServer.ServerConfig)
	if err != nil {
		t.Error(err.Error())
	}

	txHash, err := conf.DelCurrencyInfoFromSC(configServer, "USDT")
	if err != nil {
		t.Error(err.Error())
	} else {
		t.Logf("txHash: %v", txHash)
	}

	txHash, err = conf.AddCurrencyInfoFromSC(configServer, "0x84DfaaBF9fD8E72764E4997Fbc775758E00a82f7", "USDT")
	if err != nil {
		t.Error(err.Error())
	} else {
		t.Logf("txHash: %v", txHash)
	}
	addr, err := conf.GetCurrencySCAddrFromSC(configServer, "USDT")
	if err != nil {
		t.Error(err.Error())
	} else {
		t.Logf("addr: %v", addr)
	}
	asset, err := conf.GetCurrencyNameByAddrFromSC(configServer, "0x84DfaaBF9fD8E72764E4997Fbc775758E00a82f7")
	if err != nil {
		t.Error(err.Error())
	} else {
		t.Logf("asset: %v", asset)
	}
}
