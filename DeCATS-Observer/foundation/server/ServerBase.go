package server

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"math/big"
	"net/url"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/sirupsen/logrus"

	"eurus-backend/foundation/api"
	"eurus-backend/foundation/database"
	"eurus-backend/foundation/ethereum"
	"eurus-backend/foundation/log"
	"eurus-backend/foundation/network"
)

type ServerBase struct {
	DefaultDatabase        *database.Database
	UserDatabase           database.Database
	EthClient              *ethereum.EthClient
	EthWebSocketClient     *ethereum.EthClient
	MainNetEthClient       *ethereum.EthClient
	MainNetWebSocketClient *ethereum.EthClient
	ServerConfig           *ServerConfigBase
	HttpServer             *network.HttpServer
	AuthClient             network.IAuth
	ActualServer           interface{} ///Store the child class pointer
}

// The InitLog create a log with name from constant log.Name.Root. The filePath should be in UserObserverConfig.json (logFilePath)
func (me *ServerBase) InitLog(filePath string) {
	_, err := log.NewLogger(log.Name.Root, filePath, logrus.DebugLevel)
	if err != nil {
		log.GetDefaultLogger().Error("Unable to create ROOT log ", err.Error())
	}
}

func (me *ServerBase) InitDBFromConfig(config *ServerConfigBase) (*database.Database, error) {
	return me.InitDB(config.DBUserName, config.DBPassword, config.DBServerIP, config.DBServerPort,
		config.DBDatabaseName, config.DBSchemaName, config.DBAESKey, config.DBIdleConns, config.DBMaxOpenConns)
}

//func (me *ServerBase) InitUserDBFromConfig(config *ServerConfigBase) (*database.Database, error) {
//	return me.InitUserDB(config.UserDBUserName, config.UserDBPassword, config.UserDBServerIP, config.UserDBServerPort,
//		config.UserDBDatabaseName, config.UserDBSchemaName, config.DBAESKey, config.UserDBIdleConns, config.UserDBMaxOpenConns)
//}

func (me *ServerBase) InitDB(userName string, password string, ip string, port int, dbName string, schemaName string,
	key string, idleConnCount int, maxConnCount int) (*database.Database, error) {
	defaultDatabase := &database.Database{IP: ip, Port: port, UserName: userName, Password: password, DBName: dbName, SchemaName: schemaName, IdleConns: idleConnCount, MaxOpenConns: maxConnCount}
	defaultDatabase.Validate()
	defaultDatabase.SetAESKey(key)

	//Try connect DB
	_, err := defaultDatabase.GetConn()
	if err != nil {
		return nil, err
	}
	me.DefaultDatabase = defaultDatabase
	return defaultDatabase, nil
}

func (me *ServerBase) LoadConfig(configFilePath string, config IServerConfig, fileLoader func(configFilePath string) ([]byte, error)) error {
	configBase := config.GetServerConfigBase()
	if configBase == nil {
		log.GetLogger(log.Name.Root).Errorln("IServerConfig returns null ServerConfigBase")
		return errors.New("IServerConfig returns null ServerConfigBase")
	}

	pathByte := []byte(configFilePath)
	if configFilePath == "" || (len(pathByte) == 2 && pathByte[0] == 34 && pathByte[1] == 34) {
		currExecPath, err := os.Getwd()
		if err != nil {
			logger := log.GetLogger(log.Name.Root)
			logger.Error(err.Error())
			return err
		}
		configFilePath = path.Join(currExecPath, "config", "ServerConfig.json")
	}

	fmt.Println("Waiting for config file at path: ", configFilePath)
	for {
		if _, err := os.Stat(configFilePath); err == nil {
			fmt.Println("Config file found, loading...")
			break
		} else {
			time.Sleep(time.Second)
		}
	}
	var configByte []byte
	var loadErr error
	if fileLoader == nil {
		configByte, loadErr = ioutil.ReadFile(configFilePath)
		if loadErr != nil {
			logger := log.GetLogger(log.Name.Root)
			logger.Error(loadErr.Error())
			return loadErr
		}
	} else {
		configByte, loadErr = fileLoader(configFilePath)
		if loadErr != nil {
			logger := log.GetLogger(log.Name.Root)
			logger.Error(loadErr.Error())
			return loadErr
		}
	}

	err := json.Unmarshal(configByte, config)
	if err != nil {

		logger := log.GetLogger(log.Name.Root)
		logger.Error("Log config error: ", err.Error())
		return err
	}
	config.ValidateField()
	if configBase.RetryCount <= 0 {
		configBase.RetryCount = 5
	}

	if configBase.RetryInterval <= 0 {
		configBase.RetryInterval = 1
	}

	configBase.HdWalletAddress = strings.ToLower(configBase.HdWalletAddress)

	config.SetHttpErrorLogger(log.GetLogger(log.Name.Root))
	return nil
}

func (me *ServerBase) WriteConfig(configFilePath string, newServerConfig *ServerConfigBase) error {
	pathByte := []byte(configFilePath)
	if configFilePath == "" || (len(pathByte) == 2 && pathByte[0] == 34 && pathByte[1] == 34) {
		currExecPath, err := os.Getwd()
		if err != nil {
			logger := log.GetLogger(log.Name.Root)
			logger.Error(err.Error())
			return err
		}
		configFilePath = path.Join(currExecPath, "config", "ServerConfig.json")
	}
	file, _ := json.MarshalIndent(newServerConfig, "", " ")
	_ = ioutil.WriteFile(configFilePath, file, 0644)
	return nil
}

func (me *ServerBase) InitHttpServer(httpConfig network.IHttpConfig) error {
	if httpConfig == nil {
		httpConfig = me.ServerConfig
	}
	var err error
	me.HttpServer, err = network.NewServer(httpConfig)
	return err
}

func (me *ServerBase) InitAuth(authClient network.IAuth, config network.IAuthBaseConfig, loginHandler func(network.IAuth)) {
	me.AuthClient = authClient
	me.AuthClient.SetLoginHandler(loginHandler)
	me.AuthClient.LoginAuthServer(config)
}

func (me *ServerBase) InitEthereumClient(protocol string, ip string, port int, chainID int64) (*ethereum.EthClient, error) {
	ethClient := ethereum.EthClient{Protocol: protocol, IP: ip, Port: port, ChainID: big.NewInt(chainID)}
	_, err := ethClient.Connect()
	if err != nil {
		return nil, err
	}
	me.EthClient = &ethClient
	return me.EthClient, nil
}

func (me *ServerBase) InitEthereumWebSocketClient(protocol string, ip string, port int, chainID int64) (*ethereum.EthClient, error) {
	ethClient := ethereum.EthClient{Protocol: protocol, IP: ip, Port: port, ChainID: big.NewInt(chainID)}
	_, err := ethClient.Connect()
	if err != nil {
		return nil, err
	}
	me.EthWebSocketClient = &ethClient
	return me.EthClient, nil
}

func (me *ServerBase) InitEthereumClientFromConfig(config *ServerConfigBase) (*ethereum.EthClient, error) {
	err := config.ValidateEthClientField()
	if err != nil {
		return nil, err
	}
	chainID := big.NewInt(int64(config.EthClientChainID))
	ethClient := ethereum.EthClient{Protocol: config.EthClientProtocol, IP: config.EthClientIP, Port: config.EthClientPort, ChainID: chainID}
	_, err = ethClient.Connect()
	if err != nil {
		return nil, err
	}
	me.EthClient = &ethClient
	return me.EthClient, nil
}

func (me *ServerBase) InitMainNetEthereumClientFromConfig(config *ServerConfigBase) (*ethereum.EthClient, error) {
	err := config.ValidateEthClientField()
	if err != nil {
		return nil, err
	}
	chainID := big.NewInt(int64(config.EthClientChainID))
	ethClient := ethereum.EthClient{Protocol: config.EthClientProtocol, IP: config.EthClientIP, Port: config.EthClientPort, ChainID: chainID}
	_, err = ethClient.Connect()
	if err != nil {
		return nil, err
	}
	me.MainNetEthClient = &ethClient
	me.MainNetEthClient.Logger = log.GetLogger(log.Name.Root)
	return me.MainNetEthClient, nil
}

func (me *ServerBase) InitEthereumWebSocketClientFromConfig(config *ServerConfigBase) (*ethereum.EthClient, error) {
	err := config.ValidateEthClientWebSocketField()
	if err != nil {
		return nil, err
	}
	chainID := big.NewInt(int64(config.EthClientChainID))
	ethClient := ethereum.EthClient{Protocol: config.EthClientWebSocketProtocol, IP: config.EthClientWebSocketIP, Port: config.EthClientWebSocketPort, ChainID: chainID}
	_, err = ethClient.Connect()
	if err != nil {
		return nil, err
	}
	me.EthWebSocketClient = &ethClient
	me.EthWebSocketClient.Logger = log.GetLogger(log.Name.Root)
	return me.EthWebSocketClient, nil
}

func (me *ServerBase) InitMainNetEthereumWebSocketClientFromConfig(config *ServerConfigBase) (*ethereum.EthClient, error) {
	err := config.ValidateEthClientWebSocketField()
	if err != nil {
		return nil, err
	}
	chainID := big.NewInt(int64(config.EthClientChainID))
	ethClient := ethereum.EthClient{Protocol: config.EthClientWebSocketProtocol, IP: config.EthClientWebSocketIP, Port: config.EthClientWebSocketPort, ChainID: chainID}
	_, err = ethClient.Connect()
	if err != nil {
		return nil, err
	}
	me.MainNetWebSocketClient = &ethClient
	return me.MainNetWebSocketClient, nil
}

func (me *ServerBase) PostRequest(req api.RequestResponse) {}

func (me *ServerBase) Shutdown() {}

func (me *ServerBase) InitTerminal(handler func([]string) (bool, error)) {
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
		var isHandle = false
		if handler != nil {
			isHandle, _ = handler(splitText)
		}

		if !isHandle {
			me.TerminalFunction(splitText)
		}
	}
}

func (me *ServerBase) TerminalFunction(splitText []string) (bool, error) {
	switch strings.ToLower(splitText[0]) {
	case "date":
		if len(splitText)-1 != 0 {
			fmt.Println("parameter quantity not correct")
			return true, errors.New("parameter quantity not correct")
		}
		temp := time.Now()
		fmt.Println("RFC3339: ", temp.Format(time.RFC3339))
		fmt.Println("UnixTimeStamp: ", temp.Unix())
	case "help":
		fmt.Println("date - Display the server time")
		fmt.Println("enableaccesslog - enable writing to access log file")
		fmt.Println("disableaccesslog - disable writing to access log file")
	case "enableaccesslog":
		if me.HttpServer != nil {
			me.HttpServer.EnableAccessLog()
		} else {
			fmt.Println("no HttpServer")
		}
	case "disableaccesslog":
		if me.HttpServer != nil {
			me.HttpServer.DisableAccessLog()
		} else {
			fmt.Println("no HttpServer")
		}
	default:
		fmt.Println("No this function")
	}
	return false, nil
}

func (me *ServerBase) SendConfigApiRequest(reqRes *api.RequestResponse) (*api.RequestResponse, error) {

	configUrl := url.URL{
		Scheme: "http",
		Host:   me.ServerConfig.ConfigServerIP + ":" + strconv.Itoa(me.ServerConfig.ConfigServerPort),
		Path:   reqRes.Req.GetRequestPath(),
	}
	if reqRes.RetrySetting == nil {
		reqRes.RetrySetting = me.ServerConfig
	}
	return api.SendApiRequest(configUrl, reqRes, me.AuthClient)
}

func (me *ServerBase) SendApiRequest(urlStr string, reqRes *api.RequestResponse) (*api.RequestResponse, error) {
	urlObj, err := url.Parse(urlStr)
	if err != nil {
		return nil, err
	}

	return api.SendApiRequest(*urlObj, reqRes, me.AuthClient)
}

// func (me *ServerBase) handleHttpResponse(resp *http.Response, reqRes *api.RequestResponse) (*api.RequestResponse, error) {

// 	if resp.StatusCode != http.StatusOK {
// 		var returnCode int64 = int64(foundation.HttpStatusCodeBegin) - int64(resp.StatusCode)
// 		log.GetLogger(log.Name.Root).Errorln("Config service response error status: ", resp.StatusCode, resp.Status)
// 		return nil, foundation.NewErrorWithMessage(foundation.ServerReturnCode(returnCode), resp.Status)
// 	} else {

// 		defer resp.Body.Close()
// 		content, err := ioutil.ReadAll(resp.Body)
// 		if err != nil {
// 			return nil, err
// 		}

// 		err = reqRes.ResponseJsonToModel(content)
// 		if err != nil {
// 			return nil, err
// 		}

// 		return reqRes, nil
// 	}
// }

// for initTerminal() to use in command line
func (me *ServerBase) LoadConfigCmd(configFilePath string) error {
	serverConfig := new(ServerConfigBase)
	err := me.LoadConfig(configFilePath, serverConfig, nil)
	if err != nil {
		return err
	}
	me.ServerConfig = serverConfig
	return nil
}

func (me *ServerBase) HttpServerListen() error {
	//do something
	return me.HttpServer.Listen()
}
