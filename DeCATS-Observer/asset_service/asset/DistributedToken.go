package asset

import (
	"eurus-backend/foundation/database"

	"github.com/shopspring/decimal"
)

type TokenDistributedType int

const (
	DistributedUnknown TokenDistributedType = iota
	DistributedRegistration
)

type DistributedToken struct {
	database.DbModel
	Id              *uint64
	AssetName       string
	Amount          decimal.Decimal `gorm:"type:numeric"`
	Chain           *uint64
	DistributedType TokenDistributedType
	UserId          uint64
	TxHash          string
	FromAddress     string
	ToAddress       string
	GasPrice        *decimal.Decimal `gorm:"type:numeric"`
	GasUsed         uint64
	GasFee          *decimal.Decimal `gorm:"type:numeric"`
}
