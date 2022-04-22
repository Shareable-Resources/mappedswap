package ws

import (
	"encoding/json"
	"eurus-backend/foundation/api/response"
)

type ResponseMessage struct {
	response.ResponseBase
	MethodName string `json:"methodName"`
	Timestamp  int64  `json:"timestamp"`
}

var ResponseDataFieldFactoryMap map[string]func(string) interface{} = make(map[string]func(string) interface{})

func (me *ResponseMessage) UnmarshalJSON(data []byte) error {
	type cloneType ResponseMessage
	rawMsg := json.RawMessage{}
	me.Data = &rawMsg

	err := json.Unmarshal(data, (*cloneType)(me))
	if err != nil {
		return err
	}

	factoryFunc, ok := ResponseDataFieldFactoryMap[me.MethodName]

	if !ok {
		return nil
	} else {
		var intf interface{} = factoryFunc(me.MethodName)
		if len(rawMsg) > 0 {
			err := json.Unmarshal(rawMsg, intf)
			if err != nil {
				return err
			}
		}
		me.Data = intf //The debugger shows intf is nil, however it is not!

	}
	return nil

}
