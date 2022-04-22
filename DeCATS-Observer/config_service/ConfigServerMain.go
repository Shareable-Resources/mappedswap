package main

import (
	"eurus-backend/config_service/conf"
	"eurus-backend/foundation/log"
	"eurus-backend/foundation/server"
	"eurus-backend/secret"
	"fmt"
)

func loadServerFromCMD() {
	fmt.Println("Starting ConfigServer ", secret.Tag)
	var configServer *conf.ConfigServer = conf.NewConfigServer()
	var commandLineArgs = server.CommandLineArguments{}
	server.ParseCommonCommandLineArgument(&commandLineArgs)
	var err error
	err = configServer.LoadConfig(commandLineArgs.ConfigFilePath, configServer.ServerConfig)
	if err != nil {
		log.GetLogger(log.Name.Root).Error("Unable to load config: ", err.Error())
		panic(err)
	}

	configServer.InitLog(configServer.ServerConfig.LogFilePath)
	log.GetLogger(log.Name.Root).Info("Starting Config Server")

	_, err = configServer.InitDBFromConfig(configServer.ServerConfig)
	if err != nil {
		log.GetLogger(log.Name.Root).Error("Unable to load DB: ", err.Error())
		panic(err)
	}

	err = configServer.LoadConfigFromDB()
	if err != nil {
		log.GetLogger(log.Name.Root).Error("Unable to load config from DB: ", err.Error())
		panic(err)
	}

	configServer.InitHDWallet()
	fmt.Println("Wallet address: ", configServer.ServerConfig.HdWalletAddress)
	log.GetLogger(log.Name.Root).Infoln("Wallet address: ", configServer.ServerConfig.HdWalletAddress)

	configServer.InitAuth(nil, nil)

	_, err = configServer.InitEthereumClientFromConfig(configServer.ServerConfig)
	if err != nil {
		log.GetLogger(log.Name.Root).Error("Unable to Init EthClient: ", err.Error())
		panic(err)
	}

	err = configServer.InitConfigMQ()
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Unable to init MQ: ", err)
		panic(err)
	}
	go func() {
		err = configServer.InitHttpServer(nil)
		if err != nil {
			panic(err)
		}
	}()
	configServer.InitTerminal(nil)

}

func main() {
	loadServerFromCMD()
}
