package network

type IAuthBaseConfig interface {
	GetAuthIp() string
	GetAuthPort() uint
	GetServiceId() int64
	GetPrivateKey() string
	GetAuthPath() string
}
