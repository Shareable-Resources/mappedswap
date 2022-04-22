package decats

import (
	"eurus-backend/foundation"
	"eurus-backend/foundation/database"
)

type DecatsProcessorContext struct {
	db           *database.Database
	retrySetting foundation.IRetrySetting
	LoggerName   string

	TransactionOp chan *DecatsTxOp
}

func NewDecatsProcessorContext(db *database.Database, retrySetting foundation.IRetrySetting, loggerName string) *DecatsProcessorContext {
	processorContext := new(DecatsProcessorContext)
	processorContext.db = db
	processorContext.retrySetting = retrySetting
	processorContext.LoggerName = loggerName

	processorContext.TransactionOp = make(chan *DecatsTxOp)
	return processorContext
}
