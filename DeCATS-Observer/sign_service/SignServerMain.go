package main

import (
	"eurus-backend/foundation/log"
	"eurus-backend/foundation/server"
	"eurus-backend/secret"
	"eurus-backend/sign_service/sign"
	"fmt"
)

func loadServerFromCMD() {
	fmt.Println("Starting SignServer", secret.Tag)
	var signServer *sign.SignServer = sign.NewSignServer()
	var commandLineArgs = server.CommandLineArguments{}
	server.ParseCommonCommandLineArgument(&commandLineArgs)

	var err error
	err = signServer.LoadConfig(commandLineArgs.ConfigFilePath)
	if err != nil {
		log.GetLogger(log.Name.Root).Error("Unable to load config: ", err.Error())
		panic(err)
	}

	signServer.InitLog(signServer.ServerConfig.LogFilePath)

	err = signServer.QueryAuthServerInfo()
	if err != nil {
		log.GetLogger(log.Name.Root).Fatal("Unable to get auth server IP and port")
	}
	signServer.InitAll()
	signServer.InitTerminal(signServer.Calibrate)
}

func main() {
	loadServerFromCMD()
}
