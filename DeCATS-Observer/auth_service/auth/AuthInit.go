package auth

import (
	"eurus-backend/foundation/ws"
)

func init() {
	//Register request data field corresponding class type
	ws.RequestDataFieldFactoryMap[ApiAuth] = func(string) interface{} {
		return &AuthenticateRequest{}
	}

	ws.RequestDataFieldFactoryMap[ApiRequestPaymentLoginToken] = func(string) interface{} {
		return &NonRefreshableLoginTokenRequest{}
	}

	ws.RequestDataFieldFactoryMap[ApiRequestLoginToken] = func(string) interface{} {
		return &RequestLoginTokenRequest{}
	}

	ws.RequestDataFieldFactoryMap[ApiVerifyLoginToken] = func(string) interface{} {
		return &VerifyLoginTokenRequest{}
	}

	ws.RequestDataFieldFactoryMap[ApiRefreshLoginToken] = func(string) interface{} {
		return &RefreshLoginTokenRequest{}
	}

	ws.RequestDataFieldFactoryMap[ApiRevokeLoginToken] = func(string) interface{} {
		return &RevokeLoginTokenRequest{}
	}

	ws.RequestDataFieldFactoryMap[ApiVerifySign] = func(string) interface{} {
		return &VerifySignRequest{}
	}

	////////////////////RESPONSE///////////////////////////
	ws.ResponseDataFieldFactoryMap[ApiAuth] = func(string) interface{} {
		return &AuthenticateResponse{}
	}

	ws.ResponseDataFieldFactoryMap[ApiRequestLoginToken] = func(string) interface{} {
		return &RequestLoginTokenResponse{}
	}

	ws.ResponseDataFieldFactoryMap[ApiVerifyLoginToken] = func(string) interface{} {
		return &VerifyLoginTokenResponse{}
	}

	ws.ResponseDataFieldFactoryMap[ApiRefreshLoginToken] = func(string) interface{} {
		return &RefreshLoginTokenResponse{}
	}

	ws.ResponseDataFieldFactoryMap[ApiRevokeLoginToken] = func(string) interface{} {
		return &RevokeLoginTokenResponse{}
	}

	ws.ResponseDataFieldFactoryMap[ApiRequestPaymentLoginToken] = func(string) interface{} {
		return &NonRefreshableLoginTokenResponse{}
	}

	ws.ResponseDataFieldFactoryMap[ApiVerifySign] = func(string) interface{} {
		return &VerifySignResponse{}
	}
	SetupJwt([]byte("Dummy"), 3600)
}
