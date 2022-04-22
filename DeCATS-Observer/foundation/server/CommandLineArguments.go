package server

import "flag"

type CommandLineArguments struct {
	ConfigFilePath string
}

func ParseCommonCommandLineArgument(argumentPlaceHolder *CommandLineArguments) {
	flag.StringVar(&argumentPlaceHolder.ConfigFilePath, "config", "", "Config file path")
	flag.Parse()
}
