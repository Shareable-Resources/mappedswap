package auth

import (
	"encoding/base64"
	"eurus-backend/config_service/conf_api"
	"eurus-backend/env"
	"eurus-backend/foundation"
	"eurus-backend/foundation/api"
	"eurus-backend/foundation/api/response"
	"eurus-backend/foundation/crypto"
	"eurus-backend/foundation/database"
	"eurus-backend/foundation/log"
	"eurus-backend/foundation/network"
	"eurus-backend/foundation/server"
	"eurus-backend/foundation/ws"
	"eurus-backend/secret"
	"fmt"
	"io/ioutil"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
	"golang.org/x/crypto/ssh/terminal"
)

type AuthServer struct {
	ws.WebSocketServer
	dispatcher *ws.WebSocketMessageDispatcher
	DataSource *AuthDataSource
}

type pendingConnection struct {
	Conn        *websocket.Conn
	SessionId   int64
	ConnectTime time.Time
}

const (
	ApiAuth                     = "authenticate"
	ApiRequestLoginToken        = "requestLoginToken"
	ApiRequestPaymentLoginToken = "requestPaymentLoginToken"
	ApiVerifyLoginToken         = "verifyLoginToken"
	ApiRefreshLoginToken        = "refreshLoginToken"
	ApiRevokeLoginToken         = "revokeLoginToken"
	ApiVerifySign               = "verifySign"
)

func NewAuthServer() *AuthServer {
	authServer := new(AuthServer)
	authServer.dispatcher = ws.NewWebSocketMessageDispatcher(ApiAuth)
	authServer.WebSocketServer = *ws.NewWebSocketServer(authServer.dispatcher)
	authServer.registerRequestHandler()
	authServer.ActualServer = authServer
	authServer.DataSource = &AuthDataSource{DB: nil, ServiceInfo: make(map[int64]conf_api.AuthService)}

	//debug
	// authServer.DataSource.ServiceInfo[0] = new(ServiceInfo)
	// authServer.DataSource.ServiceInfo[0].PublicKey = "MIGJAoGBAOR0tmvxWuG8PntMAUjZFEhvmbh0w8+kjOoHKrNk5Tz53YLr2Hvda/lreozY0vOZKfOnoCVWi+EEPzj2NPagpSbJxSrx8XeH71kVzG9bZ9VGKGvRBBi7SWIMeCNH8n/UHRj71sUuY5+yk5V4jzWWIhdxUkqH8wQrPbB3ZVzyvWK9AgMBAAE="

	// authServer.DataSource.ServiceInfo[1] = &ServiceInfo{PublicKey: "MIGJAoGBALJJy2p4lwXtRk7zS4qUeWoxUtgRzdNHMwOUQ78PRbMAO/O3phvF2ptGgeDmMCtvVpYejAfso9EgBmbNZdT1Q2CfMxi0UG2uDWLCfq8BxWLgwvd7liIMJT7eR8L/OWmimmY8kr79yG9zFf/wGfZNYun9YXHCvZB0Fp9Z3TSO1c6/AgMBAAE="}
	return authServer
}

func (me *AuthServer) registerRequestHandler() {
	me.dispatcher.AddMessageHandler(ApiAuth, &ws.RequestHandlerInfo{Handler: AuthenticateHandler})
	me.dispatcher.AddMessageHandler(ApiRequestLoginToken, &ws.RequestHandlerInfo{Handler: RequestLoginTokenHandler})
	me.dispatcher.AddMessageHandler(ApiVerifyLoginToken, &ws.RequestHandlerInfo{Handler: VerifyLoginTokenHandler})
	me.dispatcher.AddMessageHandler(ApiRefreshLoginToken, &ws.RequestHandlerInfo{Handler: RefreshLoginTokenHandler})
	me.dispatcher.AddMessageHandler(ApiRevokeLoginToken, &ws.RequestHandlerInfo{Handler: RevokeLoginTokenHandler})
	me.dispatcher.AddMessageHandler(ApiRequestPaymentLoginToken, &ws.RequestHandlerInfo{Handler: RequestNonRefreshableLoginTokenHandler})
	me.dispatcher.AddMessageHandler(ApiVerifySign, &ws.RequestHandlerInfo{Handler: VerifySignHandler})
}

func (me *AuthServer) InitHttpServer(httpConfig network.IHttpConfig) {
	if httpConfig == nil {
		httpConfig = me.ServerConfig
	}
	//var err error
	//me.HttpServer, err = network.NewServer(httpConfig)

	//me.setupRouter()
	//err = me.HttpServer.Listen()

}

type QueryConfigAuthInfoResponse struct {
	response.ResponseBase
	Data *conf_api.ConfigAuthInfo `json:"data"`
}

func (me *AuthServer) QueryConfigServer() {
	for {
		authServiceInfoReq := conf_api.NewQueryConfigAuthInfoRequest()
		authServiceInfoReq.ServiceId = me.ServerConfig.ServiceId

		resp := new(QueryConfigAuthInfoResponse)
		reqRes := api.NewRequestResponse(authServiceInfoReq, resp)

		_, err := me.SendConfigApiRequest(reqRes)
		if err != nil {
			time.Sleep(5 * time.Second)
			continue
		}

		if resp.GetReturnCode() < int64(foundation.Success) {
			log.GetLogger(log.Name.Root).Errorln(resp.GetMessage())
			time.Sleep(5 * time.Second)
			continue
		}

		err = conf_api.ConfigMapListToServerConfig(resp.Data.ConfigData, me.ServerConfig)
		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("Unable to deserialize server config: ", err.Error())
			time.Sleep(5 * time.Second)
			continue
		}

		for _, authInfo := range resp.Data.AuthData {
			me.DataSource.ServiceInfo[int64(authInfo.Id)] = authInfo
		}

		log.GetLogger(log.Name.Root).Infoln("Service info count: ", len(resp.Data.AuthData), " loaded")
		break
	}
}

func (me *AuthServer) InitDBFromConfig(config *server.ServerConfigBase) (*database.Database, error) {
	return me.InitDB(config.DBUserName, config.DBPassword, config.DBServerIP, config.DBServerPort,
		config.DBDatabaseName, config.DBSchemaName, config.DBAESKey, config.DBIdleConns, config.DBMaxOpenConns)
}

func (me *AuthServer) InitDB(userName string, password string, ip string, port int, dbName string, schemaName string,
	key string, idleConnCount int, maxConnCount int) (*database.Database, error) {
	db, err := me.WebSocketServer.InitDB(userName, password, ip, port, dbName, schemaName, key, idleConnCount, maxConnCount)
	if err != nil {
		return db, err
	}
	me.DataSource.DB = db
	return db, err
}

func (me *AuthServer) LoadConfig(configFilePath string, config server.IServerConfig) error {

	err := me.ServerBase.LoadConfig(configFilePath, config, func(configPath string) ([]byte, error) {

		configByte, loadErr := ioutil.ReadFile(configFilePath)
		if loadErr != nil {
			logger := log.GetLogger(log.Name.Root)
			logger.Error(loadErr.Error())
			return nil, loadErr
		}
		if env.IsConfigEncrypted {
			var pw []byte
			var err error
			for {
				fmt.Print("Input password to decrypt config file (screen is hidden): ")
				pw, err = terminal.ReadPassword(0)
				if err != nil {
					panic(err)
				}
				if pw != nil {
					break
				}
			}

			fmt.Println("\nDecrypting config file")
			decrypted, err := crypto.DecryptByPassword(string(pw), string(configByte))
			if err != nil {
				log.GetLogger(log.Name.Root).Error("Unable to decrypt config file: ", err)
				return nil, errors.Wrap(err, "Unable to decrypt config file")
			}
			configByte, err = base64.StdEncoding.DecodeString(decrypted)
			if err != nil {
				return nil, err
			}

		}
		if env.IsDeleteConfigAfterUsed {
			err := os.Remove(configFilePath)
			if err != nil {
				log.GetLogger(log.Name.Root).Error("Unable to delete config file at path: ", configFilePath, " error: ", err)
			} else {
				log.GetLogger(log.Name.Root).Info("Config file delete successfully at path: ", configFilePath)
			}
		}
		return configByte, nil
	})
	if err != nil {
		return err
	}

	return secret.DecryptSensitiveConfig(config.GetServerConfigBase())
}
