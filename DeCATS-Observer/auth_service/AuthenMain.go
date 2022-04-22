package main

import (
	"eurus-backend/auth_service/auth"
	"eurus-backend/foundation/log"
	"eurus-backend/foundation/server"
	"eurus-backend/secret"
	"fmt"
)

func main() {
	fmt.Println("Starting AuthServer", secret.Tag)
	var authServer *auth.AuthServer = auth.NewAuthServer()
	var commandLineArgs = server.CommandLineArguments{}

	server.ParseCommonCommandLineArgument(&commandLineArgs)

	var err error
	err = authServer.LoadConfig(commandLineArgs.ConfigFilePath, authServer.ServerConfig)
	if err != nil {
		log.GetLogger(log.Name.Root).Error("Unable to load config: ", err.Error())
		panic(err)
	}

	authServer.InitLog(authServer.ServerConfig.LogFilePath)
	log.GetLogger(log.Name.Root).Info("Starting AuthServer")

	authServer.QueryConfigServer()
	_, err = authServer.InitDBFromConfig(authServer.ServerConfig)
	if err != nil {
		log.GetLogger(log.Name.Root).Error("Unable to load DB: ", err.Error())
		panic(err)
	}
	authServer.InitWebSocketServer(authServer.ServerConfig, "/ws")
	authServer.InitHttpServer(nil)

	go authServer.HttpServerListen()

	authServer.InitTerminal(nil)

}
