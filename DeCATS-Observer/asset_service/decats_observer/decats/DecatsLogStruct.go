package decats

import (
	"math/big"

	"github.com/ethereum/go-ethereum/common"
)

type LogTransfer struct {
	From  common.Address
	To    common.Address
	Value *big.Int
}

type LogWithdraw struct {
	TokenName  string
	Amount     *big.Int
	NewBalance *big.Int
}

type LogDeposit struct {
	From       common.Address
	ToCustomer common.Address
	TokenName  string
	Amount     *big.Int
	NewBalance *big.Int
}

type LogInterest struct {
	BeginTime        *big.Int
	EndTime          *big.Int
	TokenNames       []string
	RealizedBalances []*big.Int
	Interests        []*big.Int
}

type LogSell struct {
	PairName       string
	TokenNameSell  string
	AmountSell     *big.Int
	NewBalanceSell *big.Int
	AmountBuy      *big.Int
	NewBalanceBuy  *big.Int
	IsStopout      bool
}

type LogBuy struct {
	PairName       string
	TokenNameBuy   string
	AmountBuy      *big.Int
	NewBalanceBuy  *big.Int
	AmountSell     *big.Int
	NewBalanceSell *big.Int
	IsStopout      bool
}

type LogStopOut struct {
	StopoutEquity  *big.Int
	StopoutFunding *big.Int
	FinalBalance   *big.Int
}

type LogUpdateCredit struct {
	OldCredit *big.Int
	NewCredit *big.Int
}

type LogIncreaseBalance struct {
	TokenName  string
	Amount     *big.Int
	NewBalance *big.Int
}

type LogUpdateRiskLevel struct {
	OldRiskLevel *big.Int
	NewRiskLevel *big.Int
}

type LogUpdateTokenInterestRate struct {
	TokenName        string
	OldInterestRate  *big.Int
	OldEffectiveTime *big.Int
	NewInterestRate  *big.Int
	NewEffectiveTime *big.Int
}

type LogUpdateStatus struct {
	OldStatus *big.Int
	NewStatus *big.Int
}
