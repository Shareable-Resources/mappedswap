package decats

import (
	"eurus-backend/foundation/server"
)

type DecatsObserverConfig struct { //implements IRetrySetting
	server.ServerConfigBase
	MainnetEthClientChainID           int    `json:"mainnetEthClientChainId"`
	MainnetEthClientProtocol          string `json:"mainnetEthClientProtocol"`
	MainnetEthClientIP                string `json:"mainnetEthClientIP"`
	MainnetEthClientPort              int    `json:"mainnetEthClientPort"`
	MainnetEthClientWebSocketProtocol string `json:"mainnetEthClientWebSocketProtocol"`
	MainnetEthClientWebSocketPort     int    `json:"mainnetEthClientWebSocketPort"`
	MainnetEthClientWebSocketIP       string `json:"mainnetEthClientWebSocketIP"`
	LocalDbFileName                   string `json:"localDbFileName"`
	SideChainGasLimit                 uint64 `json:"sideChainGasLimit"`
	PoolAbiPath                       string `json:"poolAbiPath"`
	OperationPrivateKey               string `json:"operationPrivateKey"`
	OperationAccount                  string `json:"operationAccount"`
	StopoutInterval                   int    `json:"stopoutInterval"`
	LastScanDBPath                    string `json:"lastScanDBPath"`
	RootAgentId                       uint64 `json:"rootAgentId"`
}

func NewDecatsObserverConfig() *DecatsObserverConfig {
	config := new(DecatsObserverConfig)
	return config
}
