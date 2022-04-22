package main

import (
	"eurus-backend/asset_service/decats_observer/decats"
	"eurus-backend/foundation/log"
	"eurus-backend/foundation/server"
	"eurus-backend/secret"
	"fmt"
)

func main() {
	loadFromCMD()
}

func loadFromCMD() {
	fmt.Println("Starting decatsObserver", secret.Tag)
	observer := decats.NewDecatsObserver()
	var commandLineArgs = server.CommandLineArguments{}
	server.ParseCommonCommandLineArgument(&commandLineArgs)

	var err error
	err = observer.LoadConfig(commandLineArgs.ConfigFilePath)
	if err != nil {
		log.GetLogger(log.Name.Root).Error("Unable to load config: ", err.Error())
		panic(err)
	}

	observer.InitLog(observer.ServerConfig.LogFilePath)
	log.GetLogger(log.Name.Root).Infoln("Starting decats observer server ID: ", observer.Config.ServiceId)
	observer.InitAll()
}
