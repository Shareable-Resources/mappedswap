package asset

import (
	"eurus-backend/foundation/database"
	"time"

	"github.com/shopspring/decimal"
)

type TDecatsInterestHistory struct {
	database.DbModel
	Id            uint64
	Address       string
	CustomerId    uint64
	AgentId       uint64
	FromTime      *time.Time
	ToTime        *time.Time
	Token         string
	Rate          decimal.Decimal `gorm:"type:numeric"`
	Amount        decimal.Decimal `gorm:"type:numeric"`
	Interest      decimal.Decimal `gorm:"type:numeric"`
	TotalInterest decimal.Decimal `gorm:"type:numeric"`
	Status        int
}
