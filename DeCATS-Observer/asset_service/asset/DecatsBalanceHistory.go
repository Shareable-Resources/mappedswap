package asset

import (
	"eurus-backend/foundation/database"
	"time"

	"github.com/shopspring/decimal"
)

type DecatsTxType int8

const (
	DecatsTxTypeBuy      DecatsTxType = 1
	DecatsTxTypeSell     DecatsTxType = 2
	DecatsTxTypeDeposit  DecatsTxType = 3
	DecatsTxTypeWithdraw DecatsTxType = 4
	DecatsTxTypeInterest DecatsTxType = 5
)

type TDecatsBalancesHistory struct {
	database.DbModel
	Id         uint64
	Address    string
	CustomerId uint64
	AgentId    uint64
	Token      string
	Type       DecatsTxType
	Amount     decimal.Decimal `gorm:"type:numeric"`
	Balance    decimal.Decimal `gorm:"type:numeric"`
	UpdateTime *time.Time
	TxHash     string
	Status     DecatsTxStatus
}
