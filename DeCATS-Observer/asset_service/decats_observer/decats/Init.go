package decats

import (
	"eurus-backend/foundation/ethereum"
	"eurus-backend/smartcontract/build/golang/contract"
	"fmt"
	"log"
)

func init() {
	err := ethereum.DefaultABIDecoder.ImportABIJson("ERC20", contract.ERC20ABI)
	if err != nil {
		fmt.Println("Unable to import ERC20 ABI: ", err, " program exit")
		log.Fatalln("Unable to import ERC20 ABI: ", err)
	}
}
