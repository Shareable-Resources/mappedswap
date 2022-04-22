package asset

import (
	"time"

	"github.com/shopspring/decimal"
)

type TDecatsBlockPrice struct {
	Id          uint64
	PairName    string
	Reserve0    decimal.Decimal `gorm:"type:numeric"`
	Reserve1    decimal.Decimal `gorm:"type:numeric"`
	BlockNo     decimal.Decimal `gorm:"type:numeric"`
	CreatedDate time.Time
}
