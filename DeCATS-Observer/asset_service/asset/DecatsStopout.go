package asset

import (
	"time"

	"github.com/shopspring/decimal"
)

type TDecatsStopout struct {
	Id          uint64
	Address     string
	CustomerId  uint64
	AgentId     uint64
	Equity      decimal.Decimal `gorm:"type:numeric"`
	Credit      decimal.Decimal `gorm:"type:numeric"`
	TxHash      string
	TxTime      *time.Time
	TxStatus    int
	GasFee      decimal.Decimal `gorm:"type:numeric"`
	RequestTime *time.Time
	Leverage    decimal.Decimal `gorm:"type:numeric"`
	FundingUsed decimal.Decimal `gorm:"type:numeric"`
	RiskLevel   decimal.Decimal `gorm:"type:numeric"`
}
