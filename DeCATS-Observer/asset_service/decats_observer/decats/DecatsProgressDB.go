package decats

import (
	"eurus-backend/foundation/database"
	"eurus-backend/foundation/log"
	"math/big"
	"sync"

	"github.com/shopspring/decimal"
)

type ScannedBlock struct {
	ChainId    uint64 `gorm:"primaryKey"`
	CurrentNum *decimal.Decimal
}

type DecatsProgressCounter struct {
	db         *database.Database
	cri        *sync.Mutex
	chainId    uint64
	LoggerName string
}

func NewProgressCounter(chainId uint64, dbFileName string, LoggerName string) (*DecatsProgressCounter, error) {
	if len(dbFileName) == 0 {
		dbFileName = "progress.db"
	}

	counter := new(DecatsProgressCounter)
	counter.cri = new(sync.Mutex)
	counter.db = new(database.Database)
	counter.db.DBName = dbFileName
	counter.db.DbType = database.DatabaseSqlite
	counter.db.Logger = log.GetLogger(log.Name.Root)
	counter.chainId = chainId

	err := counter.initSqlite()

	return counter, err
}

func (me *DecatsProgressCounter) initSqlite() error {
	conn, err := me.db.GetConn()
	if err != nil {
		return err
	}
	tx := conn.Exec("CREATE TABLE IF NOT EXISTS scanned_blocks (chain_id INTEGER PRIMARY KEY, current_num INTEGER);")
	if tx.Error != nil {
		return tx.Error
	}

	conn.Exec("VACUUM")
	return nil
}

func (me *DecatsProgressCounter) GetScannedBlock() (*ScannedBlock, error) {
	me.cri.Lock()
	defer me.cri.Unlock()

	conn, err := me.db.GetConn()
	if err != nil {
		return nil, err
	}
	progress := new(ScannedBlock)

	dbTx := conn.Where("chain_id = ?", me.chainId).First(&progress)
	if dbTx.Error != nil {
		return nil, dbTx.Error
	}

	return progress, nil
}

func (me *DecatsProgressCounter) UpdateScannedBlock(curNum *big.Int) error {
	me.cri.Lock()
	defer me.cri.Unlock()

	conn, err := me.db.GetConn()
	if err != nil {
		return err
	}

	progress := new(ScannedBlock)
	progress.ChainId = me.chainId
	newNum := decimal.NewFromBigInt(curNum, 0)
	progress.CurrentNum = &newNum

	dbTx := conn.Model(&progress).Updates(&progress)

	if dbTx.Error != nil {
		return dbTx.Error
	}

	return nil
}
