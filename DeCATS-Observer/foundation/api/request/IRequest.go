package request

import "eurus-backend/foundation/network"

type IRequest interface {
	SetLoginToken(token network.ILoginToken)
	SetMethod(method string)
	GetMethod() string
	SetRequestPath(path string)
	GetRequestPath() string
	SetNonce(nonce string)
	GetNonce() string
	GetLoginToken() network.ILoginToken
}
