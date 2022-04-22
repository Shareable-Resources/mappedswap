package auth

type NonRefreshableLoginTokenResponse struct { //implements network.ILoginToken
	ExpiredTime      int64  `json:"expiredTime"`
	CreatedDate      int64  `json:"createdDate"`
	LastModifiedDate int64  `json:"lastModifiedDate"`
	userId           string
	Type 		int16 `json:"type"`
	Token            string `json:"token"`
}

func (me *NonRefreshableLoginTokenResponse) GetToken() string {
	return me.Token
}

func (me *NonRefreshableLoginTokenResponse) GetExpiredTime() int64 {
	return me.ExpiredTime
}

func (me *NonRefreshableLoginTokenResponse) GetCreatedDate() int64 {
	return me.CreatedDate
}

func (me *NonRefreshableLoginTokenResponse) GetLastModifiedDate() int64 {
	return me.LastModifiedDate
}

func (me *NonRefreshableLoginTokenResponse) GetUserId() string {
	return me.userId
}

func (me *NonRefreshableLoginTokenResponse) SetUserId(userId string) {
	me.userId = userId
}

func (me *NonRefreshableLoginTokenResponse) SetToken(token string) {
	me.Token = token
}

func (me *NonRefreshableLoginTokenResponse) GetTokenType() int16 {
	return me.Type
}