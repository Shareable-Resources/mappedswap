// +build testnet

package env

import (
	"math/big"

	"github.com/ethereum/go-ethereum/params"
)

const Tag = "testnet"

const IsConfigEncrypted bool = true
const IsDeleteConfigAfterUsed bool = false
const DefaultEurusChainId int64 = 1984

func CreateEurusChainConfig() *params.ChainConfig {
	return &params.ChainConfig{
		ChainID:             big.NewInt(DefaultEurusChainId),
		HomesteadBlock:      nil,
		DAOForkBlock:        nil,
		DAOForkSupport:      true,
		EIP150Block:         nil,
		EIP155Block:         big.NewInt(0),
		EIP158Block:         nil,
		ByzantiumBlock:      nil,
		ConstantinopleBlock: nil,
		PetersburgBlock:     nil,
		IstanbulBlock:       nil,
		MuirGlacierBlock:    nil,
		BerlinBlock:         nil,
		LondonBlock:         nil,
		Clique: &params.CliqueConfig{
			Period: 30,
			Epoch:  30000,
		},
	}
}
