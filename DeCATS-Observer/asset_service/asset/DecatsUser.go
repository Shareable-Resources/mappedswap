package asset

import "github.com/shopspring/decimal"

type TDecatsCustomers struct {
	Id         uint64
	AgentId    uint64
	Address    string
	CreditMode uint8
	//Credit     decimal.Decimal `gorm:"type:numeric"`
	MaxFunding decimal.Decimal `gorm:"type:numeric"`
	RiskLevel  decimal.Decimal `gorm:"type:numeric"`
	Leverage   decimal.Decimal `gorm:"type:numeric"`
}
