package asset

import (
	"time"

	"github.com/shopspring/decimal"
)

type TDecatsPrice struct {
	Id          uint64
	PairName    string
	Reserve0    decimal.Decimal `gorm:"type:numeric"`
	Reserve1    decimal.Decimal `gorm:"type:numeric"`
	CreatedDate time.Time
}
