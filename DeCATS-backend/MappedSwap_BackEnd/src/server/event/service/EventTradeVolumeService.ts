import { crytoDecimalNumber } from './../../../general/model/dbModel/Prices';
import seq from '../sequelize';
import { Op, QueryTypes } from 'sequelize';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import globalVar from '../const/globalVar';
import moment from 'moment';

import {
  Customer,
  EventTradeVolume,
  Transaction,
  LeaderBoardRanking,
  LeaderBoardRule,
} from '../../../general/model/dbModel/0_index';
import logger from '../util/ServiceLogger';
import { ResponseBase } from '../../../foundation/server/ApiMessage';
import ProfitAndLossReport from '../../../general/model/dbModel/ProfitAndLossReport';
import { on } from 'winston-daily-rotate-file';
import Big from 'big.js';
import TransactionWithTrade from '../model/TransactionWithTradeVolume';
const foundationConfig = globalVar.foundationConfig;
const modelModule = seq.sequelize.models;
export default class Service {
  /**
   * Write top 20 into t_decats_leaderboard_rankings
   */
  isRunning: boolean;
  constructor() {
    this.isRunning = false;
  }
  async writeTradeVolume() {
    this.isRunning = true;
    logger.info(`[EventTradeVolumeService] writeTradeVolume`);
    logger.info(`writeTradeVolume at ${moment().utc().toDate()}`);
    const resp = new ResponseBase();
    const fixedTradeVolumeOfUSDM =
      globalVar.eventConfig.eventTradeVolume.fixedTradeVolumeOfUSDM;
    const fixedUSDMInDb = new Big(fixedTradeVolumeOfUSDM).mul(
      crytoDecimalNumber.USDM,
    );
    let scannedFromId = '0';
    let scanning = true;
    try {
      const modelModule = seq.sequelize.models;
      let botCustomer: Customer = (await modelModule[
        SeqModel.name.Customer
      ].findOne({
        where: {
          address: {
            [Op.iLike]: `%${globalVar.foundationConfig.smartcontract.MappedSwap['OwnedUpgradeableProxy<PriceAdjust>'].address}%`,
          },
        },
      })) as any;
      if (!botCustomer) {
        throw new Error('Bot customer does not exists');
      }
      botCustomer = JSON.parse(JSON.stringify(botCustomer));
      const botId = botCustomer.id;

      let currentDbTradeVoliumes: EventTradeVolume[] = (await modelModule[
        SeqModel.name.EventTradeVolume
      ].findAll({})) as any;
      currentDbTradeVoliumes = JSON.parse(
        JSON.stringify(currentDbTradeVoliumes),
      );
      if (currentDbTradeVoliumes.length == 0) {
        //First scan
        const createdFrom = moment
          .utc(
            globalVar.eventConfig.eventTradeVolume.dateFrom,
            'YYYY-MM-DD hh:mm:ss',
          )
          .toDate();

        let startTransactions: Transaction = (await modelModule[
          SeqModel.name.Transaction
        ].findOne({
          where: {
            txTime: {
              [Op.gte]: createdFrom,
            },
          },
          order: [['id', 'asc']],
          limit: 1,
        })) as any;
        startTransactions = JSON.parse(JSON.stringify(startTransactions));
        if (startTransactions) {
          //Scanned first id
          scannedFromId = startTransactions.id as string;
          logger.info(
            `Scanned transactions table from ${scannedFromId} at date ${createdFrom}`,
          );
        } else {
          throw new Error('No transactions records');
        }
      } else {
        const allScannedId = currentDbTradeVoliumes
          .map((x) => x.lastScannedId as string)
          .sort();
        scannedFromId = allScannedId[allScannedId.length - 1];
        scannedFromId = new Big(scannedFromId).plus(1).toString();
      }
      //Start scan and update
      currentDbTradeVoliumes = currentDbTradeVoliumes
        ? currentDbTradeVoliumes
        : [];
      //Scan an transaction record

      while (scanning) {
        logger.debug(`Scanning ${scannedFromId}`);
        let transactionRecord: TransactionWithTrade = (await modelModule[
          SeqModel.name.Transaction
        ].findOne({
          where: {
            id: scannedFromId,
          },
        })) as any;
        transactionRecord = JSON.parse(JSON.stringify(transactionRecord));

        if (transactionRecord) {
          //logger.info(`Tx record found`);
          transactionRecord.tradeVolume =
            transactionRecord.buyToken == 'USDM'
              ? transactionRecord.buyAmount
              : transactionRecord.sellAmount;
          //Check if trade volume contains this users
          let existedTradeVolumeRecord: any = null;
          existedTradeVolumeRecord = (await modelModule[
            SeqModel.name.EventTradeVolume
          ].findOne({
            where: {
              customerId: transactionRecord.customerId as string,
            },
          })) as any;

          //If exists, update lastScannedId, amt, acheivedDate(if exceeds [fixedTradeVolumeOfUSDM])
          if (existedTradeVolumeRecord) {
            existedTradeVolumeRecord = JSON.parse(
              JSON.stringify(existedTradeVolumeRecord),
            );
            existedTradeVolumeRecord.amt = new Big(existedTradeVolumeRecord.amt)
              .plus(transactionRecord.tradeVolume)
              .toString();
            if (
              !existedTradeVolumeRecord.acheivedDate &&
              new Big(existedTradeVolumeRecord.amt).gte(fixedUSDMInDb)
            ) {
              existedTradeVolumeRecord.acheivedDate = transactionRecord.txTime;
            }
            existedTradeVolumeRecord.lastScannedId = transactionRecord.id!;
            existedTradeVolumeRecord.lastTxDate = transactionRecord.txTime!;

            const updateTradeVolume = (await modelModule[
              SeqModel.name.EventTradeVolume
            ].update(existedTradeVolumeRecord, {
              fields: ['lastScannedId', 'acheivedDate', 'lastTxDate', 'amt'],
              where: {
                id: existedTradeVolumeRecord.id as string,
              },
            })) as any;
            //logger.info(`Update success ${JSON.stringify(updateTradeVolume)}`);
            scannedFromId = new Big(scannedFromId).plus(1).toString();
          } else {
            //If not exists, insert
            existedTradeVolumeRecord = new EventTradeVolume();
            existedTradeVolumeRecord.amt = transactionRecord.tradeVolume;
            if (
              !existedTradeVolumeRecord.acheivedDate &&
              new Big(existedTradeVolumeRecord.amt).gte(fixedUSDMInDb)
            ) {
              existedTradeVolumeRecord.acheivedDate = transactionRecord.txTime;
            }
            existedTradeVolumeRecord.lastScannedId = transactionRecord.id!;
            existedTradeVolumeRecord.lastTxDate = transactionRecord.txTime!;
            existedTradeVolumeRecord.customerId = transactionRecord.customerId;
            existedTradeVolumeRecord.address = transactionRecord.address;
            existedTradeVolumeRecord.firstTxDate = transactionRecord.txTime!;
            existedTradeVolumeRecord.lastScannedId = transactionRecord.id!;
            const insertTradeVolume = (await modelModule[
              SeqModel.name.EventTradeVolume
            ].create(existedTradeVolumeRecord, {})) as any;
            logger.info(`Insert success ${JSON.stringify(insertTradeVolume)}`);
            scannedFromId = new Big(scannedFromId).plus(1).toString();
          }
        } else {
          this.isRunning = false;
          scanning = false;
          logger.info(`No record is found, stopped at ${scannedFromId}`);
        }
      }

      this.isRunning = false;
      resp.success = true;
    } catch (e) {
      resp.success = false;
      resp.msg = `[EventTradeVolumeService] writeTradeVolume cannot create on ${moment()
        .utc()
        .toDate()}`;
      logger.error(resp.msg);
      logger.error(e);
    }
    return resp;
  }
}
