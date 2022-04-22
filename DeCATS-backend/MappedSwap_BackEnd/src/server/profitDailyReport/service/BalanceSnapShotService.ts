import seq from '../sequelize';
import { Op, QueryTypes, Transaction } from 'sequelize';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import globalVar from '../const/globalVar';
import JSONBig from 'json-bigint';
import moment from 'moment';
import ProfitReportDatesRange from '../model/ProfitReportDatesRange';

import {
  BalanceHistory,
  BalanceSnapshot,
} from '../../../general/model/dbModel/0_index';
import { TokenReserve } from '../model/TokenReserve';
import logger from '../util/ServiceLogger';
import { EthClient } from '../../../foundation/utils/ethereum/EthClient';
import Big from 'big.js';
import {
  ResponseBase,
  responseBySuccess,
} from '../../../foundation/server/ApiMessage';
const foundationConfig = globalVar.foundationConfig;
const modelModule = seq.sequelize.models;
export default class Service {
  sideChainClient?: EthClient; // mainnet/testnet/dev
  defaultReserve: TokenReserve[];
  constructor() {
    this.defaultReserve = [
      {
        token: 'BTCM',
        address:
          globalVar.foundationConfig.smartcontract.MappedSwap[
            'OwnedBeaconProxy<BTCM>'
          ].address,
        reserve: '0',
        toUSDMExchangeRate: '0',
      },
      {
        token: 'ETHM',
        address:
          globalVar.foundationConfig.smartcontract.MappedSwap[
            'OwnedBeaconProxy<ETHM>'
          ].address,
        reserve: '0',
        toUSDMExchangeRate: '0',
      },
      {
        token: 'USDM',
        address:
          globalVar.foundationConfig.smartcontract.MappedSwap[
            'OwnedBeaconProxy<USDM>'
          ].address,
        reserve: '0',
        toUSDMExchangeRate: '0',
      },
    ];
  }

  private async assignUnrealizedInterest(
    dateRange: ProfitReportDatesRange,
    reports: BalanceSnapshot[],
    t: Transaction,
  ) {
    const dateFrom = moment
      .utc(dateRange.createdDate)
      .subtract(1, 'hour')
      .toDate();
    const sql = `select
                      customer_id as "customerId",
                      "token",
                      total_interest as "unrealizedInterest",
                      "created_date" as "createdDate",
                      :dateTo as "dateTo"
                  from
                      t_decats_interest_histories as t1
                  where
                      id in (
                    select
                        max(id)
                    from
                        t_decats_interest_histories
                    where
                        created_date >= :dateFrom
                      and created_date <= :dateTo
                    group by
                        customer_id,
                        "token"
                                    )`;

    let interestResults: BalanceSnapshot[] = (await seq.sequelize.query(sql, {
      replacements: {
        dateFrom: dateFrom,
        dateTo: dateRange.dateTo,
      },
      type: QueryTypes.SELECT,
      transaction: t,
    })) as any;
    interestResults = JSONBig.parse(JSON.stringify(interestResults));
    for (const interestResult of interestResults) {
      const report = reports.find(
        (x) =>
          x.customerId == interestResult.customerId &&
          x.token == interestResult.token,
      );
      if (report) {
        report.unrealizedInterest = interestResult.unrealizedInterest;
      }
    }

    for (const report of reports) {
      report.unrealizedInterest = report.unrealizedInterest
        ? report.unrealizedInterest
        : new Big(0).toString();
    }
  }

  /**
   * If there is not data in BalanceSnapshot, it will generate all balanceSnapshot before dateRange.dateTo
   * If there are data in BalanceSnapshot, it will fetch yesterday balanceSnapshots, compare to current balance history
   * If a new balance history is present, replace the old data in yesterday balanceSnapshot as curent day balanceSnapShot
   * Otherwise, use yesterday balanceSnapshot
   * @param dateRange － dates range
   * @param t － transaction
   */
  private async createBalanceDailySnapShot(
    dateRange: ProfitReportDatesRange,
    t: Transaction,
  ) {
    logger.info(`[BalanceSnapShotService][Balance] createBalanceDailySnapShot`);
    let dataToBeInserted: BalanceSnapshot[] = [];
    //const firstBalanceReport: BalanceSnapshot[] = [];
    let dataInDb: BalanceSnapshot[] = (await modelModule[
      SeqModel.name.BalanceSnapshot
    ].findOne({
      transaction: t,
    })) as any;
    dataInDb = JSONBig.parse(JSONBig.stringify(dataInDb));
    // If no data exists in db, get the last balance from t_decats_balances_histories
    if (!dataInDb) {
      const sql = `select
                      customer_id as "customerId",
                      "token",
                      balance,
                      "update_time" as "updateTime"
                    from
                      t_decats_balances_histories
                    where
                      id in (
                      select
                        max(id)
                      from
                        t_decats_balances_histories
                      where
                        update_time < :dateTo
                      group by
                        customer_id, "token")
                    order by customer_id ,"token"
                  `;
      const allBalanceHistories: BalanceHistory[] = await seq.sequelize.query(
        sql,
        {
          replacements: {
            dateTo: dateRange.dateTo,
          },
          type: QueryTypes.SELECT,
          transaction: t,
        },
      );
      //dateRange.dateFrom = null;
      const balReportsFromBalanceHistory: BalanceSnapshot[] = [];
      for (let i = 0; i < allBalanceHistories.length; i++) {
        balReportsFromBalanceHistory.push(
          this.convertBalHistoryToBalReport(allBalanceHistories[i], dateRange),
        );
      }

      dataToBeInserted = dataToBeInserted.concat(balReportsFromBalanceHistory);
    } else {
      let yesterdayDataInDb: BalanceSnapshot[] = (await modelModule[
        SeqModel.name.BalanceSnapshot
      ].findAll({
        transaction: t,
        where: {
          dateTo: dateRange.yesterdayTo,
        },
      })) as any;
      yesterdayDataInDb = JSONBig.parse(JSONBig.stringify(yesterdayDataInDb));
      // If data exists in db, get the last balance from t_decats_balances_histories
      const sql = `select
                      customer_id as "customerId",
                      "token",
                      balance,
                      "update_time" as "updateTime"
                    from
                      t_decats_balances_histories
                    where
                      id in (
                      select
                        max(id)
                      from
                        t_decats_balances_histories
                      where
                        update_time >= :dateFrom and update_time <= :dateTo
                      group by
                        customer_id, "token")
                    order by customer_id ,"token"
                  `;
      let balanceHistoriesAfterLastReport: BalanceHistory[] =
        (await seq.sequelize.query(sql, {
          replacements: {
            dateFrom: dateRange.dateFrom,
            dateTo: dateRange.dateTo,
          },
          type: QueryTypes.SELECT,
          transaction: t,
        })) as any;
      balanceHistoriesAfterLastReport = JSONBig.parse(
        JSONBig.stringify(balanceHistoriesAfterLastReport),
      );
      let todayBal: BalanceHistory;
      for (let i = 0; i < yesterdayDataInDb.length; i++) {
        yesterdayDataInDb[i].id = null;
        yesterdayDataInDb[i].dateFrom = dateRange.dateFrom;
        yesterdayDataInDb[i].dateTo = dateRange.dateTo;
        yesterdayDataInDb[i].unrealizedInterest = new Big(0).toString();
        yesterdayDataInDb[i].createdDate = dateRange.createdDate;
        yesterdayDataInDb[i].lastModifiedDate = dateRange.lastModifiedDate;
      }
      for (let i = 0; i < balanceHistoriesAfterLastReport.length; i++) {
        todayBal = balanceHistoriesAfterLastReport[i];
        const yesterdayData = yesterdayDataInDb.find(
          (x) =>
            x.customerId == todayBal.customerId && x.token == todayBal.token,
        );
        if (yesterdayData) {
          yesterdayData.balance = todayBal.balance;
          yesterdayData.updateTime = todayBal.updateTime;
        } else {
          yesterdayDataInDb.push(
            this.convertBalHistoryToBalReport(todayBal, dateRange),
          );
        }
      }

      dataToBeInserted = yesterdayDataInDb;
    }
    dataToBeInserted = this.fillInDefaultTokenIfNotExists(dataToBeInserted);
    return dataToBeInserted;
  }
  /**
   * Data massage from BalanceHistory to BalanceSnapshot
   * @param history － history to be converted
   * @param dateRange － dates range
   */
  private convertBalHistoryToBalReport(
    history: BalanceHistory,
    dateRange: ProfitReportDatesRange,
  ) {
    // logger.info(
    //   '[BalanceSnapShotService][Balance] convertBalHistoryToBalReport',
    // );
    const snapshot = new BalanceSnapshot();
    snapshot.token = history.token;
    snapshot.balance = history.balance;
    snapshot.updateTime = history.updateTime;
    snapshot.customerId = history.customerId;
    snapshot.dateFrom = dateRange.dateFrom;
    snapshot.dateTo = dateRange.dateTo;
    snapshot.createdDate = dateRange.createdDate;
    return snapshot;
  }
  /**
   * Fill in missing token if other tokens is not present (i.e., if only BTCM, fill in ETHM and USDM)
   * @param reports － reports to be inserted
   */
  private fillInDefaultTokenIfNotExists(
    reports: BalanceSnapshot[],
  ): BalanceSnapshot[] {
    logger.info(
      '[BalanceSnapShotService][Balance][fillInDefaultTokenIfNotExists]',
    );
    let reportsBelongToThisCustomer: BalanceSnapshot[] = [];
    let reportsToBeInserted: BalanceSnapshot[] = [];
    const allCustomerId = Array.from(new Set(reports.map((x) => x.customerId)));
    for (let i = 0; i < allCustomerId.length; i++) {
      reportsBelongToThisCustomer = reports.filter(
        (x) => x.customerId == allCustomerId[i],
      );
      if (reportsBelongToThisCustomer.length != this.defaultReserve.length) {
        for (let y = 0; y < this.defaultReserve.length; y++) {
          // If the customer doesn' t have a specific token report
          if (
            !reportsBelongToThisCustomer.find(
              (x) => x.token == this.defaultReserve[y].token,
            )
          ) {
            const newReport = new BalanceSnapshot();
            newReport.token = this.defaultReserve[y].token;
            newReport.customerId = reportsBelongToThisCustomer[0].customerId;
            newReport.updateTime = reportsBelongToThisCustomer[0].updateTime;
            newReport.createdDate = reportsBelongToThisCustomer[0].createdDate;
            newReport.dateFrom = reportsBelongToThisCustomer[0].dateFrom;
            newReport.dateTo = reportsBelongToThisCustomer[0].dateTo;
            reportsBelongToThisCustomer.push(newReport);
          }
        }
      }
      reportsToBeInserted = reportsToBeInserted.concat(
        reportsBelongToThisCustomer,
      );
    }
    return reportsToBeInserted;
  }

  /**
   * Create balance snap shot
   * @param dateRange － ProfitReportDatesRange
   */
  async create(dateRange: ProfitReportDatesRange) {
    logger.info(
      `[BalanceSnapShotService] create, Creating BalanceSnapShot on ${dateRange.createdDate}  (Range: ${dateRange.dateFrom}-${dateRange.dateTo})`,
    );
    const resp = new ResponseBase();
    const t = await seq.sequelize.transaction();
    try {
      await this.checkBalanceReportAlreadyExists(dateRange, t);
      const balanceSnapShot = await this.createBalanceDailySnapShot(
        dateRange,
        t,
      );
      await this.assignUnrealizedInterest(dateRange, balanceSnapShot, t);
      await this.insertBalanceSnapshots(balanceSnapShot, t);
      await t.commit();
      resp.success = true;
    } catch (e) {
      resp.success = false;
      resp.msg = `[BalanceSnapShotService] cannot create on ${dateRange.createdDate}`;
      logger.error(resp.msg);
      logger.error(e);
      await t.rollback();
    }

    return resp;
  }

  /**
   * Insert data to t_decats_balances_snapshots
   * @param dataToBeInsert － balanceSnapShot to be inserted
   * @param t - Transaction
   */
  private async insertBalanceSnapshots(
    dataToBeInsert: BalanceSnapshot[],
    t: Transaction,
  ) {
    logger.info(`[BalanceSnapShotService][Balance] insertBalanceSnapshots`);
    const insert: any = await modelModule[
      SeqModel.name.BalanceSnapshot
    ].bulkCreate(dataToBeInsert, { transaction: t });
  }

  /**
   * Check if balance report is existed, if exists, throw error
   * @param dateRange - all used dateRange
   * @param t - Transaction
   */
  private async checkBalanceReportAlreadyExists(
    dateRange: ProfitReportDatesRange,
    t: Transaction,
  ) {
    logger.info(
      `[BalanceSnapShotService][Balance] checkBalanceReportAlreadyExists`,
    );
    const balanceReportInDb: any = await modelModule[
      SeqModel.name.BalanceSnapshot
    ].findOne({
      where: {
        createdDate: dateRange.createdDate,
      },
      limit: 1,
      transaction: t,
    });
    const dbRecord: BalanceSnapshot | undefined = JSONBig.parse(
      JSONBig.stringify(balanceReportInDb),
    );
    if (dbRecord) {
      throw new Error(
        `BalanceSnapshot already generated (${dateRange.dateTo})`,
      );
    }
  }
}
