package decats

import (
	"eurus-backend/asset_service/asset"
	"eurus-backend/foundation/log"
	"fmt"
	"strconv"
	"strings"
	"time"
)

type DecatsDBOperation int

const (
	DecatsOpComit          DecatsDBOperation = 0
	DecatsOpTrans          DecatsDBOperation = 1
	DecatsOpCus            DecatsDBOperation = 2
	DecatsOpPrice          DecatsDBOperation = 3
	DecatsOpInterest       DecatsDBOperation = 4
	DecatsOpBalanceHistory DecatsDBOperation = 5
	DecatsOpBalance        DecatsDBOperation = 6
	DecatsOpStopout        DecatsDBOperation = 7
	DecatsOpPriceHistory   DecatsDBOperation = 8
	DecatsOpBlockPrice     DecatsDBOperation = 9
)

type DecatsTxOp struct {
	DecatsOpType       DecatsDBOperation
	DecatsTrans        *asset.TDecatsTransaction
	DecatsUser         *asset.TDecatsCustomers
	DecatsPriceHistory *asset.TDecatsPriceHistory
	DecatsInterest     *asset.TDecatsInterestHistory
	DecatsBalanceHis   *asset.TDecatsBalancesHistory
	DecatsBalance      *asset.TDecatsBalance
	DecatsStopout      *asset.TDecatsStopout
	DecatsPrice        *asset.TDecatsPrice
	DecatsBlockPrice   *asset.TDecatsBlockPrice
}

func dbInsertDecatsTransaction(context *DecatsProcessorContext, trans *asset.TDecatsTransaction) (*asset.TDecatsTransaction, int, error) {
	var err error
	var rowAffected int

	//trans := new(asset.DecatsTrasaction)
	for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
		conn, err := context.db.GetConn()
		if err != nil {
			time.Sleep(time.Duration(context.retrySetting.GetRetryInterval()) * time.Second)
			continue
		}

		trans.InitDate()

		dbConn := conn.Create(trans)
		if dbConn.Error != nil {
			if strings.Contains(dbConn.Error.Error(), "duplicate key") {
				return nil, 0, nil
			}
			log.GetLogger(context.LoggerName).Errorln("Unable to insert into DB for trans: ", trans.TxHash, " error: ", dbConn.Error.Error())
		} else {
			rowAffected = int(dbConn.RowsAffected)
			break
		}
	}

	if err != nil {
		return nil, 0, err
	}
	return trans, rowAffected, nil
}

func DbGetUserTransaction(context *DecatsProcessorContext, address string) ([]asset.TDecatsTransaction, error) {
	var transactions []asset.TDecatsTransaction

	dbConn, err := context.db.GetConn()
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Fail to connect db.", err)
		return nil, err
	}

	dbTx := dbConn.Where("address = ? ", address).Find(&transactions)
	err = dbTx.Error
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Fail to get user list ")
		return nil, err
	}

	return transactions, nil
}

func DbGetUserBalance(context *DecatsProcessorContext, address string, tokenName string) (*asset.TDecatsBalance, error) {
	var balance asset.TDecatsBalance

	dbConn, err := context.db.GetConn()
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Fail to get balance list ")
		return nil, err
	}

	dbTx := dbConn.Where("address = ? AND token =?", address, tokenName).Find(&balance)
	err = dbTx.Error
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Fail to get balance list ")
		return nil, err
	}

	return &balance, nil
}

func DbGetUserList(context *DecatsProcessorContext) ([]asset.TDecatsCustomers, error) {
	var clients []asset.TDecatsCustomers
	dbConn, err := context.db.GetConn()
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Fail to connect db.", err)
		return nil, err
	}

	dbTx := dbConn.Find(&clients)
	err = dbTx.Error
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Fail to get user list ")
		return nil, err
	}

	return clients, nil
}

func DbGetUser(context *DecatsProcessorContext, userAddr string) (*asset.TDecatsCustomers, error) {
	var client *asset.TDecatsCustomers
	dbConn, err := context.db.GetConn()
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Fail to connect db.", err)
		return nil, err
	}

	client = new(asset.TDecatsCustomers)
	dbTx := dbConn.Where("address = ?", userAddr).First(client)
	err = dbTx.Error
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Fail to get user list ")
		return nil, err
	}

	return client, nil
}

func dbUpdateUserBalance(context *DecatsProcessorContext, trans *asset.TDecatsBalance) (*asset.TDecatsBalance, int, error) {
	var err error
	var rowAffected int
	var oldBalance asset.TDecatsBalance
	for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {

		conn, err := context.db.GetConn()
		if err != nil {
			time.Sleep(time.Duration(context.retrySetting.GetRetryInterval()) * time.Second)
			continue
		}

		dbConn := conn.Where("address = ? AND token = ?", trans.Address, trans.Token).Find(&oldBalance)

		if dbConn.Error != nil {
			log.GetLogger(context.LoggerName).Errorln("Unable to update DB for user balance, error: ", dbConn.Error.Error())
		} else {
			if dbConn.RowsAffected == 0 {
				conn.Create(trans)
			} else {
				conn.Where("address = ? AND token = ?", trans.Address, trans.Token).Updates(trans)
			}
			if dbConn.Error != nil {
				log.GetLogger(context.LoggerName).Errorln("Unable to update DB for user balance, error: ", dbConn.Error.Error())
			} else {
				rowAffected = int(dbConn.RowsAffected)
				break
			}
		}

		//dbConn := conn.Where("address = ? AND token = ?", trans.Address, trans.Token).Updates(trans)

	}

	if err != nil {
		return nil, 0, err
	}
	return trans, rowAffected, nil
}

func dbInsertUserBalanceHistory(context *DecatsProcessorContext, trans *asset.TDecatsBalancesHistory) (*asset.TDecatsBalancesHistory, int, error) {
	var err error
	var rowAffected int
	for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
		conn, err := context.db.GetConn()
		if err != nil {
			time.Sleep(time.Duration(context.retrySetting.GetRetryInterval()) * time.Second)
			continue
		}

		trans.InitDate()

		dbConn := conn.Create(trans)
		if dbConn.Error != nil {
			log.GetLogger(context.LoggerName).Errorln("Unable to insert DB for user balance history, error: ", dbConn.Error.Error())
		} else {
			rowAffected = int(dbConn.RowsAffected)
			break
		}
	}

	if err != nil {
		return nil, 0, err
	}
	return trans, rowAffected, nil
}

func dbInsertPriceHistory(context *DecatsProcessorContext, trans *asset.TDecatsPriceHistory) (*asset.TDecatsPriceHistory, int, error) {
	var err error
	var rowAffected int

	//trans := new(asset.DecatsTrasaction)
	for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
		conn, err := context.db.GetConn()
		if err != nil {
			time.Sleep(time.Duration(context.retrySetting.GetRetryInterval()) * time.Second)
			continue
		}
		dbConn := conn.Create(trans)
		if dbConn.Error != nil {
			log.GetLogger(context.LoggerName).Errorln("Unable to insert into DB for price, error: ", dbConn.Error.Error())
		} else {
			rowAffected = int(dbConn.RowsAffected)
			break
		}
	}

	if err != nil {
		return nil, 0, err
	}
	return trans, rowAffected, nil
}

func dbInsertInterestHistory(context *DecatsProcessorContext, trans *asset.TDecatsInterestHistory) (*asset.TDecatsInterestHistory, int, error) {
	var err error
	var rowAffected int

	//trans := new(asset.DecatsTrasaction)
	for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
		conn, err := context.db.GetConn()
		if err != nil {
			time.Sleep(time.Duration(context.retrySetting.GetRetryInterval()) * time.Second)
			continue
		}
		dbConn := conn.Create(trans)
		if dbConn.Error != nil {
			log.GetLogger(context.LoggerName).Errorln("Unable to insert into DB for price, error: ", dbConn.Error.Error())
		} else {
			rowAffected = int(dbConn.RowsAffected)
			break
		}
	}

	if err != nil {
		return nil, 0, err
	}
	return trans, rowAffected, nil
}

func DbInsertKLine(context *DecatsProcessorContext, fromTime time.Time, toTime time.Time, interval int) (int, error) {
	var err error
	var rowAffected int
	for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
		conn, err := context.db.GetConn()
		if err != nil {
			time.Sleep(time.Duration(context.retrySetting.GetRetryInterval()) * time.Second)
			continue
		}
		fromTimeStr := fromTime.Format("2006-01-02 15:04:05") + "+08"
		toTimeStr := toTime.Format("2006-01-02 15:04:05") + "+08"
		//dbConn := conn.Exec(`insert into t_decats_price_histories (pair_name, reserve0, reserve1, created_date, status, open, close, low, high, volume, interval) select pair_name, 0, 0, to_timestamp((EXTRACT(EPOCH FROM created_date)/?)::INTEGER * ?) as created_date, 0, first("open") "open", last("close") "close", max("high") "high", min("low") "low", sum("volume") "volume", 300 "interval" from t_decats_price_histories where created_date >= ? and created_date < ? group by pair_name, (EXTRACT(EPOCH FROM created_date)/?)::INTEGER order by created_date desc, pair_name;`, interval, interval, fromTimeStr, toTimeStr, interval)
		sqlStr := "insert into t_decats_price_histories (pair_name, reserve0, reserve1, created_date, status, open, close, high, low, volume, interval) select pair_name, last(\"reserve0\") \"reserve0\", last(\"reserve1\") \"reserve1\", '" + fromTimeStr + "' as created_date, 0, first(\"open\") \"open\", last(\"close\") \"close\", max(\"high\") \"high\", min(\"low\") \"low\", sum(\"volume\") \"volume\", " + strconv.Itoa(interval) + " \"interval\" from ( select  * from t_decats_price_histories where created_date >= '" + fromTimeStr + "' and created_date < '" + toTimeStr + "' and interval = 60 order by pair_name,created_date ) t2 group by pair_name;"
		fmt.Println(sqlStr)
		dbConn := conn.Exec(sqlStr)
		if dbConn.Error != nil {
			log.GetLogger(context.LoggerName).Errorln("Unable to insert into DB for kline, error: ", dbConn.Error.Error())
		} else {
			rowAffected = int(dbConn.RowsAffected)
			break
		}
	}

	if err != nil {
		return 0, err
	}

	return rowAffected, nil

}

func DbGetStopoutByTxHash(context *DecatsProcessorContext, txHash string) (*asset.TDecatsStopout, error) {
	var stopoutTx *asset.TDecatsStopout
	dbConn, err := context.db.GetConn()
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Fail to connect db.", err)
		return nil, err
	}

	stopoutTx = new(asset.TDecatsStopout)
	dbTx := dbConn.Where("tx_hash = ?", txHash).First(stopoutTx)
	err = dbTx.Error
	if err != nil {
		log.GetLogger(log.Name.Root).Errorln("Fail to get stopout tx")
		return nil, err
	}

	return stopoutTx, nil
}

func DbProcessUpdateThread(context *DecatsProcessorContext) {
	go func(cont *DecatsProcessorContext) {
		conn, _ := context.db.GetConn()

		for {
			select {
			case operation := <-cont.TransactionOp:
				switch operation.DecatsOpType {
				case DecatsOpComit:
					log.GetLogger(context.LoggerName).Infoln("DB commited")
					conn.Commit()
				case DecatsOpStopout:
					var oldStopout asset.TDecatsStopout
					for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
						dbConn := conn.Where("tx_hash = ?", operation.DecatsStopout.TxHash).Find(&oldStopout)
						if dbConn.Error != nil {
							conn, _ = context.db.GetConn()
							log.GetLogger(context.LoggerName).Errorln("Unable to update DB for stopout, error: ", dbConn.Error.Error())
						} else {
							if dbConn.RowsAffected == 0 {
								conn.Create(operation.DecatsStopout)
							} else {
								conn.Where("tx_hash = ?", operation.DecatsStopout.TxHash).Updates(operation.DecatsStopout)
							}
							if dbConn.Error != nil {
								log.GetLogger(context.LoggerName).Errorln("Unable to update DB for stopout, error: ", dbConn.Error.Error())
							} else {
								log.GetLogger(context.LoggerName).Infoln("Inserted to DB Stopout ", operation.DecatsStopout.Address)
								break
							}
						}
					}
				case DecatsOpBalance:
					var oldBalance asset.TDecatsBalance
					for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
						dbConn := conn.Where("address = ? AND token = ?", operation.DecatsBalance.Address, operation.DecatsBalance.Token).Find(&oldBalance)
						if dbConn.Error != nil {
							conn, _ = context.db.GetConn()
							log.GetLogger(context.LoggerName).Errorln("Unable to update DB for user balance, error: ", dbConn.Error.Error())
						} else {
							if dbConn.RowsAffected == 0 {
								conn.Create(operation.DecatsBalance)
							} else {
								conn.Where("address = ? AND token = ?", operation.DecatsBalance.Address, operation.DecatsBalance.Token).Updates(operation.DecatsBalance)
							}
							if dbConn.Error != nil {
								log.GetLogger(context.LoggerName).Errorln("Unable to update DB for user balance, error: ", dbConn.Error.Error())
							} else {
								log.GetLogger(context.LoggerName).Infoln("Inserted to DB user balance ", operation.DecatsBalance.Address)
								break
							}
						}
					}
				case DecatsOpBalanceHistory:
					operation.DecatsBalanceHis.InitDate()
					for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {

						dbConn := conn.Create(operation.DecatsBalanceHis)
						if dbConn.Error != nil {
							conn, _ = context.db.GetConn()
							log.GetLogger(context.LoggerName).Errorln("Unable to insert into DB for BalanceHistory, error: ", dbConn.Error.Error())
						} else {
							log.GetLogger(context.LoggerName).Infoln("Inserted to DB balance history ", operation.DecatsBalanceHis.TxHash)
							break
						}
					}

				case DecatsOpPrice:
					var oldPrice asset.TDecatsPrice
					for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
						dbConn := conn.Where("pair_name = ?", operation.DecatsPrice.PairName).Find(&oldPrice)
						if dbConn.Error != nil {
							conn, _ = context.db.GetConn()
							log.GetLogger(context.LoggerName).Errorln("Unable to update DB for price, error: ", dbConn.Error.Error())
						} else {
							if dbConn.RowsAffected == 0 {
								conn.Create(operation.DecatsPrice)
							} else {
								conn.Where("pair_name = ?", operation.DecatsPrice.PairName).Updates(operation.DecatsPrice)
							}
							if dbConn.Error != nil {
								log.GetLogger(context.LoggerName).Errorln("Unable to update DB for price, error: ", dbConn.Error.Error())
							} else {
								log.GetLogger(context.LoggerName).Infoln("Inserted to DB price ", operation.DecatsPrice.PairName)
								break
							}
						}
					}

				case DecatsOpPriceHistory:
					for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
						dbConn := conn.Create(operation.DecatsPriceHistory)
						if dbConn.Error != nil {
							conn, _ = context.db.GetConn()
							log.GetLogger(context.LoggerName).Errorln("Unable to insert into DB for price history, error: ", dbConn.Error.Error())
						} else {
							log.GetLogger(context.LoggerName).Infoln("Inserted to DB Price history", operation.DecatsPriceHistory.PairName)
							break
						}
					}
				case DecatsOpInterest:
					for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
						dbConn := conn.Create(operation.DecatsInterest)
						if dbConn.Error != nil {
							conn, _ = context.db.GetConn()
							log.GetLogger(context.LoggerName).Errorln("Unable to insert into DB for interest , error: ", dbConn.Error.Error())
						} else {
							log.GetLogger(context.LoggerName).Infoln("Inserted to DB interest ", operation.DecatsInterest.Address)
							break
						}
					}
				case DecatsOpTrans:
					operation.DecatsTrans.InitDate()
					for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
						dbConn := conn.Create(operation.DecatsTrans)
						if dbConn.Error != nil {
							conn, _ = context.db.GetConn()
							log.GetLogger(context.LoggerName).Errorln("Unable to insert into DB for trans: ", operation.DecatsTrans.TxHash, " error: ", dbConn.Error.Error())
						} else {
							log.GetLogger(context.LoggerName).Infoln("Inserted to DB transaction ", operation.DecatsTrans.TxHash)
							break
						}
					}
				case DecatsOpBlockPrice:
					for i := 0; i < context.retrySetting.GetRetryCount() || i == 0; i++ {
						dbConn := conn.Create(operation.DecatsBlockPrice)
						if dbConn.Error != nil {
							conn, _ = context.db.GetConn()
							log.GetLogger(context.LoggerName).Errorln("Unable to insert into DB for block price, error: ", dbConn.Error.Error())
						} else {
							log.GetLogger(context.LoggerName).Infoln("Inserted to DB Price history", operation.DecatsBlockPrice.PairName)
							break
						}
					}
				}
			}
		}
	}(context)

}
