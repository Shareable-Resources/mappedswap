package asset

import (
	"eurus-backend/foundation/database"
	"time"

	"github.com/shopspring/decimal"
)

type DecatsTxStatus int8

const (
	DecatsTxAccepted  DecatsTxStatus = 1
	DecatsTxConfirmed DecatsTxStatus = 2
	DecatsTxRejected  DecatsTxStatus = -1
)

type TDecatsTransaction struct {
	database.DbModel
	Id          uint64
	Address     string
	CustomerId  uint64
	AgentId     uint64
	SellToken   string
	SellAmount  decimal.Decimal `gorm:"type:numeric"`
	BuyToken    string
	BuyAmount   decimal.Decimal `gorm:"type:numeric"`
	TxHash      string
	TxStatus    DecatsTxStatus
	GasFee      decimal.Decimal `gorm:"type:numeric"`
	TxTime      *time.Time
	BlockHeight int
	BlockHash   string
	Stopout     bool
}
