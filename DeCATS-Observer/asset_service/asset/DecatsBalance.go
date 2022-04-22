package asset

import (
	"time"

	"github.com/shopspring/decimal"
)

type TDecatsBalance struct {
	Id         uint64
	Address    string
	CustomerId uint64
	AgentId    uint64
	Token      string
	Balance    decimal.Decimal `gorm:"type:numeric"`
	Interest   decimal.Decimal `gorm:"type:numeric"`
	UpdateTime *time.Time
	Status     int
}
