package service_server

import (
	"encoding/base64"
	"io/ioutil"
	"os"

	"eurus-backend/auth_service/auth"
	"eurus-backend/config_service/conf_api"
	"eurus-backend/env"
	"eurus-backend/foundation"
	"eurus-backend/foundation/api"
	"eurus-backend/foundation/crypto"
	"eurus-backend/foundation/log"
	"eurus-backend/foundation/network"
	"eurus-backend/foundation/server"
	"eurus-backend/secret"
	"fmt"
	"strconv"
	"strings"

	"github.com/pkg/errors"
	"github.com/streadway/amqp"
	"golang.org/x/crypto/ssh/terminal"
)

type ServiceServer struct {
	server.ServerBase
	loginHandler           func(network.IAuth)
	configEventHandler     func(message *amqp.Delivery, topic string, contentType string, content []byte)
	mqConfigServerConsumer *network.MQConsumer
	isLoggedIn             bool
}

func (me *ServiceServer) InitAuth(loginHandler func(network.IAuth), configEventHandler func(message *amqp.Delivery, topic string, contentType string, content []byte)) {
	authClient := auth.NewAuthClient()
	me.loginHandler = loginHandler
	me.configEventHandler = configEventHandler
	me.ServerBase.InitAuth(authClient, me.ServerConfig, me.processPostLogin)
}

func (me *ServiceServer) processPostLogin(authClient network.IAuth) {
	if !me.isLoggedIn {
		if me.loginHandler != nil {
			me.loginHandler(authClient)
		}
		if me.configEventHandler != nil {
			err := me.SubscribeConfigServerEvent(me.ServerConfig, me.configEventHandler)
			if err != nil {
				log.GetLogger(log.Name.Root).Errorln("Unable to subscribe config server MQ: ", err)
				panic(err)
			}
		}
		me.isLoggedIn = true

		if me.ServerConfig.HdWalletAddress != "" {
			setServerWalletAddrReq := conf_api.NewSetServerWalletAddressRequest()
			setServerWalletAddrReq.WalletAddress = me.ServerConfig.HdWalletAddress
			setServerWalletAddrRes := new(conf_api.SetServerWalletAddressFullResponse)
			reqRes := api.NewRequestResponse(setServerWalletAddrReq, setServerWalletAddrRes)
			_, err := me.SendConfigApiRequest(reqRes)
			if err != nil {
				log.GetLogger(log.Name.Root).Warn("Unable to set wallet address to config server: ", err)
			} else if setServerWalletAddrRes.ReturnCode != int64(foundation.Success) {
				log.GetLogger(log.Name.Root).Warn("Unable to set wallet address to config server, server return code: ", setServerWalletAddrRes.ReturnCode, " message: ", setServerWalletAddrRes.Message)
			}
		}
	}
}

// QueryAuthServerInfo will send a request and assign to ServerConfig properties : AuthServerIp, AuthServerPort, AuthPath
func (me *ServiceServer) QueryAuthServerInfo() error {
	queryReq := conf_api.NewQueryServerSettingRequest()

	resp := new(conf_api.QueryServerSettingResponse)
	reqRes := api.NewRequestResponse(queryReq, resp)

	_, err := me.SendConfigApiRequest(reqRes)
	if err != nil {
		return err
	}

	if resp.GetReturnCode() < int64(foundation.Success) {
		return errors.New(resp.GetMessage())
	}

	me.ServerConfig.AuthServerIp = resp.Data.IP
	me.ServerConfig.AuthServerPort = uint(resp.Data.Port)
	me.ServerConfig.AuthPath = resp.Data.Path
	return nil
}

//After QueryConfigServer,
func (me *ServiceServer) QueryConfigServer(config server.IServerConfig) (*[]conf_api.ConfigMap, error) {

	queryReq := conf_api.NewQueryConfigRequest()
	queryReq.Id = me.ServerConfig.ServiceId

	resp := new(conf_api.QueryConfigResponse)
	reqRes := api.NewRequestResponse(queryReq, resp)

	_, err := me.SendConfigApiRequest(reqRes)
	if err != nil {
		return nil, err
	}

	if resp.GetReturnCode() < int64(foundation.Success) {
		return nil, errors.New(resp.GetMessage())
	}

	var parseConfig interface{} = config

	for parseConfig != nil {
		err = conf_api.ConfigMapListToServerConfig(resp.Data.ConfigData, parseConfig.(server.IServerConfig))
		if err != nil {
			log.GetLogger(log.Name.Root).Errorln("Unable to deserialize server config: ", err.Error())
			return nil, err
		}
		parseConfig = parseConfig.(server.IServerConfig).GetParent()
	}

	config.GetServerConfigBase().HdWalletAddress = strings.ToLower(config.GetServerConfigBase().HdWalletAddress)

	serviceIdReq := conf_api.NewGetServiceGroupIdRequest()
	serviceIdRes := new(conf_api.GetServiceGroupIdFullResponse)
	servicerIdreqRes := api.NewRequestResponse(serviceIdReq, serviceIdRes)

	_, err = me.SendConfigApiRequest(servicerIdreqRes)
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Unable to query service group Id: ", err.Error())
		return nil, err
	}
	if serviceIdRes.ReturnCode != int64(foundation.Success) {
		log.GetLogger(log.Name.Root).Errorln("Query service group Id response error code: ", serviceIdRes.ReturnCode, " message: ", serviceIdRes.Message)
		return nil, errors.New(serviceIdRes.Message)
	}
	me.ServerConfig.GroupId = serviceIdRes.Data

	log.GetLogger(log.Name.Root).Infoln("Config loaded from server successfully")
	return &resp.Data.ConfigData, nil
}

func (me *ServiceServer) LoadConfig(configFilePath string, config server.IServerConfig) error {
	return me.LoadConfigWithSetting(configFilePath, config, env.IsConfigEncrypted, env.IsDeleteConfigAfterUsed)
}

func (me *ServiceServer) LoadConfigWithSetting(configFilePath string, config server.IServerConfig, isEncrypted bool, isDeleteAfterUsed bool) error {

	err := me.ServerBase.LoadConfig(configFilePath, config, func(configPath string) ([]byte, error) {

		configByte, loadErr := ioutil.ReadFile(configFilePath)
		if loadErr != nil {
			logger := log.GetLogger(log.Name.Root)
			logger.Error(loadErr.Error())
			return nil, loadErr
		}
		if isEncrypted {
			var pw []byte
			var err error
			for {
				fmt.Print("Input password to decrypt config file (screen is hidden): ")
				pw, err = terminal.ReadPassword(0)
				if err != nil {
					panic(err)
				}
				if len(pw) > 0 {
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

		if isDeleteAfterUsed {
			os.Remove(configFilePath)
		}

		return configByte, nil
	})
	if err != nil {
		return err
	}

	return secret.DecryptSensitiveConfig(config.GetServerConfigBase())
}

func (me *ServiceServer) QuerySystemConfig(configName string) (string, error) {
	req := conf_api.NewGetSystemConfigRequest(configName)
	res := new(conf_api.GetSystemConfigFullResponse)
	reqRes := api.NewRequestResponse(req, res)
	_, err := me.SendConfigApiRequest(reqRes)
	if err != nil {
		return "", err
	}

	if res.ReturnCode != int64(foundation.Success) {
		return "", errors.New("Server code: " + strconv.FormatInt(res.ReturnCode, 10) + res.Message)
	}

	return res.Data.Value, nil

}

func (me *ServiceServer) QueryAssets() ([]*conf_api.Asset, error) {
	req := conf_api.NewGetAssetRequest()
	res := new(conf_api.GetAssetFullResponse)
	reqRes := api.NewRequestResponse(req, res)
	_, err := me.SendConfigApiRequest(reqRes)
	if err != nil {
		return nil, err
	}

	if res.ReturnCode != int64(foundation.Success) {
		return nil, errors.New("Server code: " + strconv.FormatInt(res.ReturnCode, 10) + res.Message)
	}

	return res.Data, nil
}

func (me *ServiceServer) QueryAssetSettings() ([]conf_api.AssetSetting, error) {
	req := conf_api.NewGetAssetSettingsRequest()
	res := new(conf_api.GetAssetSettingsFullResponse)
	reqRes := api.NewRequestResponse(req, res)
	_, err := me.SendConfigApiRequest(reqRes)
	if err != nil {
		return nil, err
	}

	if res.ReturnCode != int64(foundation.Success) {
		return nil, errors.New("Server code: " + strconv.FormatInt(res.ReturnCode, 10) + res.Message)
	}

	return res.Data, nil
}

func (me *ServiceServer) GetServiceIdFromServerLoginToken(loginToken network.ILoginToken) (int64, error) {
	return me.AuthClient.(*auth.AuthClient).GetServiceIdFromServerLoginToken(loginToken)
}

func (me *ServiceServer) SubscribeConfigServerEvent(config *server.ServerConfigBase, configEventHandler func(message *amqp.Delivery, topic string, contentType string, content []byte)) error {
	me.mqConfigServerConsumer = new(network.MQConsumer)

	metaData := new(network.MQTaskQueueMetaData)
	metaData.IsAutoAck = true
	metaData.IsExclusive = false
	metaData.IsAutoDelete = conf_api.ConfigExchangeMetaData.IsAutoDelete
	if config.GroupId == 0 {
		metaData.QueueName = "general_queue_" + strconv.Itoa(int(config.ServiceId))
	} else {
		metaData.QueueName = "general_queue_group_" + strconv.Itoa(int(config.GroupId))
	}

	return me.mqConfigServerConsumer.SubscribeTopic(me.ServerConfig.GetMqUrl(), "config.*", &conf_api.ConfigExchangeMetaData,
		metaData, me.configEventHandler)
}
