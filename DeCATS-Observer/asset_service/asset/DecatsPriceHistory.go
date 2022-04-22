package asset

import (
	"time"

	"github.com/shopspring/decimal"
)

type TDecatsPriceHistory struct {
	Id          uint64
	PairName    string
	Reserve0    decimal.Decimal `gorm:"type:numeric"`
	Reserve1    decimal.Decimal `gorm:"type:numeric"`
	High        decimal.Decimal `gorm:"type:numeric"`
	Low         decimal.Decimal `gorm:"type:numeric"`
	Open        decimal.Decimal `gorm:"type:numeric"`
	Close       decimal.Decimal `gorm:"type:numeric"`
	Volume      decimal.Decimal `gorm:"type:numeric"`
	Interval    int
	CreatedDate time.Time
}
