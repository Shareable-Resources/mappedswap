package elastic

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"
)

type LoginData struct{
	UserId  uint64
	Ip 		string
	AppVersion string
	Os		string
	Timestamp time.Time
	RegistrationSource  string
}


const loginDataPath string = "login"
const loginDataIndex string = "logindata"




func InsertLoginLog(path string, data *LoginData) error{
	url := path+"/"+loginDataPath+"/"+loginDataIndex
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{}
	_, err = client.Do(req)
	if err != nil {
		return err
	}
	return nil
}