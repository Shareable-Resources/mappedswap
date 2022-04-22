import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import SubAgentWeeklyReport from '../model/SubAgentWeeklyReport';
import { Model, Op, QueryTypes, Sequelize, Transaction } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import ProfitReportDatesRange from '../model/ProfitReportDatesRange';
import JSONBig from 'json-bigint';
import {
  ErrorResponseBase,
  ResponseBase,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import logger from '../util/ServiceLogger';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import CommissionDistribution, {
  CommissionDistributionStatus,
} from '../../../general/model/dbModel/CommissionDistribution';
import moment from 'moment';
import CronJob, {
  CronJobStatus,
  CronJobType,
} from '../../../general/model/dbModel/CronJob';
import MSTDistRule from '../../../general/model/dbModel/MSTDistRule';
import Big from 'big.js';
import { AgentDailyReportType } from '../../../general/model/dbModel/AgentDailyReport';
import e from 'express';
import globalVar from '../const/globalVar';
import { crytoDecimalNumber } from '../../../general/model/dbModel/Prices';
import {
  Balance,
  BalanceHistory,
  BalanceSnapshot,
  BlockPrices,
} from '../../../general/model/dbModel/0_index';
import { TokenReserve } from '../model/TokenReserve';
import ProfitAndLossReport from '../../../general/model/dbModel/ProfitAndLossReport';
const modelModule = seq.sequelize.models;

export default class Service {
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
  /**
   * Generate all related dates for generation
   * @param today － today start datetime
   */
  private getAllRelatedDate(): ProfitReportDatesRange {
    logger.info('[ProfitDailyReportService] getAllRelatedDate');
    const nowUTC = moment().utc();
    // const nowUTC = moment.utc(
    //   '2022-03-16 18:45:48.730 +08:00',
    //   'YYYY-MM-DD HH:mm:ss.SSS Z',
    // );
    const now = nowUTC.toDate();
    const todayStart = nowUTC.startOf('day').toDate();
    const allDates = {
      dateFrom: todayStart,
      dateTo: now,
      yesterdayFrom: moment
        .utc(todayStart)
        .subtract(1, 'day')
        .startOf('day')
        .toDate(),
      yesterdayTo: moment
        .utc(todayStart)
        .subtract(1, 'day')
        .endOf('day')
        .toDate(),
      lastModifiedDate: now,
      createdDate: now,
      yesterdayCreatedDate: todayStart,
    };
    return allDates;
  }

  // private async getBalanceFromBalanceHistores(
  //   dateRange: ProfitReportDatesRange,
  //   t: Transaction,
  //   customerId: string,
  // ): Promise<BalanceSnapshot[]> {
  //   logger.info(`[BalanceSnapShotService][Balance] createBalanceDailySnapShot`);
  //   let dataToBeInserted: BalanceSnapshot[] = [];
  //   //const firstBalanceReport: BalanceSnapshot[] = [];
  //   let dataInDb: BalanceSnapshot[] = (await modelModule[
  //     SeqModel.name.BalanceSnapshot
  //   ].findOne({
  //     transaction: t,
  //   })) as any;
  //   dataInDb = JSONBig.parse(JSONBig.stringify(dataInDb));
  //   // If no data exists in db, get the last balance from t_decats_balances_histories
  //   if (!dataInDb) {
  //     const sql = `select
  //                     customer_id as "customerId",
  //                     "token",
  //                     balance,
  //                     "update_time" as "updateTime"
  //                   from
  //                     t_decats_balances_histories
  //                   where
  //                     id in (
  //                     select
  //                       max(id)
  //                     from
  //                       t_decats_balances_histories
  //                     where
  //                       update_time < :dateTo and customer_id :customerId
  //                     group by
  //                       customer_id, "token")
  //                   order by customer_id ,"token"
  //                 `;
  //     const allBalanceHistories: BalanceHistory[] = await seq.sequelize.query(
  //       sql,
  //       {
  //         replacements: {
  //           dateTo: dateRange.dateTo,
  //           customerId: customerId,
  //         },
  //         type: QueryTypes.SELECT,
  //         transaction: t,
  //       },
  //     );
  //     //dateRange.dateFrom = null;
  //     const balReportsFromBalanceHistory: BalanceSnapshot[] = [];
  //     for (let i = 0; i < allBalanceHistories.length; i++) {
  //       balReportsFromBalanceHistory.push(
  //         this.convertBalHistoryToBalReport(allBalanceHistories[i], dateRange),
  //       );
  //     }

  //     dataToBeInserted = dataToBeInserted.concat(balReportsFromBalanceHistory);
  //   } else {
  //     let yesterdayDataInDb: BalanceSnapshot[] = (await modelModule[
  //       SeqModel.name.BalanceSnapshot
  //     ].findAll({
  //       transaction: t,
  //       where: {
  //         dateTo: dateRange.yesterdayTo,
  //         customerId: customerId,
  //       },
  //     })) as any;
  //     yesterdayDataInDb = JSONBig.parse(JSONBig.stringify(yesterdayDataInDb));
  //     // If data exists in db, get the last balance from t_decats_balances_histories
  //     const sql = `select
  //                   customer_id as "customerId",
  //                   "token",
  //                   balance,
  //                   "update_time" as "updateTime"
  //                 from
  //                   t_decats_balances_histories
  //                 where
  //                   id in (
  //                   select
  //                     max(id)
  //                   from
  //                     t_decats_balances_histories
  //                   where
  //                     update_time >= :dateFrom and update_time <= :dateTo and customer_id = :customerId
  //                   group by
  //                     customer_id, "token")
  //                 order by customer_id ,"token"
  //               `;
  //     let balanceHistoriesAfterLastReport: BalanceHistory[] =
  //       (await seq.sequelize.query(sql, {
  //         replacements: {
  //           dateFrom: dateRange.dateFrom,
  //           dateTo: dateRange.dateTo,
  //           customerId: customerId,
  //         },
  //         type: QueryTypes.SELECT,
  //         transaction: t,
  //       })) as any;
  //     balanceHistoriesAfterLastReport = JSONBig.parse(
  //       JSONBig.stringify(balanceHistoriesAfterLastReport),
  //     );
  //     let todayBal: BalanceHistory;
  //     for (let i = 0; i < yesterdayDataInDb.length; i++) {
  //       yesterdayDataInDb[i].id = null;
  //       yesterdayDataInDb[i].dateFrom = dateRange.dateFrom;
  //       yesterdayDataInDb[i].dateTo = dateRange.dateTo;
  //       yesterdayDataInDb[i].createdDate = dateRange.createdDate;
  //       yesterdayDataInDb[i].unrealizedInterest = new Big(0).toString();
  //       yesterdayDataInDb[i].lastModifiedDate = dateRange.lastModifiedDate;
  //     }
  //     for (let i = 0; i < balanceHistoriesAfterLastReport.length; i++) {
  //       todayBal = balanceHistoriesAfterLastReport[i];
  //       const yesterdayData = yesterdayDataInDb.find(
  //         (x) =>
  //           x.customerId == todayBal.customerId && x.token == todayBal.token,
  //       );
  //       if (yesterdayData) {
  //         yesterdayData.balance = todayBal.balance;
  //         yesterdayData.updateTime = todayBal.updateTime;
  //       } else {
  //         yesterdayDataInDb.push(
  //           this.convertBalHistoryToBalReport(todayBal, dateRange),
  //         );
  //       }
  //     }
  //     dataToBeInserted = yesterdayDataInDb;
  //   }

  //   if (dataToBeInserted.length == 0) {
  //     const dummyUSDM = new BalanceSnapshot();
  //     dummyUSDM.customerId = customerId;
  //     dummyUSDM.token = 'USDM';
  //     dummyUSDM.updateTime = dateRange.createdDate;
  //     dummyUSDM.createdDate = dateRange.createdDate;
  //     dummyUSDM.dateFrom = dateRange.dateFrom;
  //     dummyUSDM.dateTo = dateRange.dateTo;
  //     dataToBeInserted.push(dummyUSDM);
  //   }
  //   dataToBeInserted = this.fillInDefaultTokenIfNotExists(dataToBeInserted);
  //   return dataToBeInserted;
  // }
  private async getBalanceFromBalance(
    dateRange: ProfitReportDatesRange,
    t: Transaction,
    customerId: string,
  ): Promise<BalanceSnapshot[]> {
    logger.info(`[BalanceSnapShotService][Balance] createBalanceDailySnapShot`);
    let dataToBeInserted: BalanceSnapshot[] = [];
    // If no data exists in db, get the last balance from t_decats_balances_histories
    const balanceDataInDb: Balance[] = JSONBig.parse(
      JSON.stringify(
        await modelModule[SeqModel.name.Balance].findAll({
          attributes: [
            'balance',
            'interest',
            'updateTime',
            'customerId',
            'token',
          ],
          transaction: t,
          where: {
            customerId: customerId,
          },
        }),
      ) as any,
    );
    if (balanceDataInDb.length > 0) {
      dataToBeInserted = balanceDataInDb.map((x: Balance) => {
        return {
          id: null,
          token: x.token,
          customerId: x.customerId,
          balance: x.balance,
          unrealizedInterest: x.interest,
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
          updateTime: x.updateTime,
          createdDate: dateRange.createdDate,
          lastModifiedDate: dateRange.createdDate,
        };
      });
    } else {
      const emptyDataToBeInserted = new BalanceSnapshot();
      emptyDataToBeInserted.id = null;
      emptyDataToBeInserted.token = 'USDM';
      emptyDataToBeInserted.customerId = customerId;
      emptyDataToBeInserted.balance = new Big(0).toString();
      emptyDataToBeInserted.unrealizedInterest = new Big(0).toString();
      emptyDataToBeInserted.dateFrom = dateRange.dateFrom;
      emptyDataToBeInserted.dateTo = dateRange.dateTo;
      emptyDataToBeInserted.updateTime = dateRange.createdDate;
      emptyDataToBeInserted.createdDate = dateRange.createdDate;
      emptyDataToBeInserted.lastModifiedDate = dateRange.createdDate;
    }

    dataToBeInserted = this.fillInDefaultTokenIfNotExists(dataToBeInserted);
    return dataToBeInserted;
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

  private async createProfitAndLossReport(
    dateRange: ProfitReportDatesRange,
    t: Transaction,
    reports: BalanceSnapshot[],
    customerId: string,
  ): Promise<ProfitAndLossReport[]> {
    const ethmPrice = new Big(
      this.defaultReserve.find((t) => t.token == 'ETHM')!.toUSDMExchangeRate,
    )
      .div(crytoDecimalNumber.MST)
      .toString();
    const btcmPrice = new Big(
      this.defaultReserve.find((t) => t.token == 'BTCM')!.toUSDMExchangeRate,
    )
      .div(crytoDecimalNumber.MST)
      .toString();
    const usdmPrice = new Big(
      this.defaultReserve.find((t) => t.token == 'USDM')!.toUSDMExchangeRate,
    )
      .div(crytoDecimalNumber.MST)
      .toString();
    const profitAndLossReports: ProfitAndLossReport[] = [];
    let equityEnd = new Big(0).toString();
    for (let i = 0; i < reports.length; i++) {
      const balance = reports[i].balance;
      const unrealizedInterest = reports[i].unrealizedInterest;
      let equityOfAnToken = new Big(0).toString();
      switch (reports[i].token) {
        case 'BTCM':
          equityOfAnToken = new Big(balance)
            .minus(unrealizedInterest)
            .div(crytoDecimalNumber.BTCM)
            .mul(btcmPrice)
            .toString();
          break;
        case 'ETHM':
          equityOfAnToken = new Big(balance)
            .minus(unrealizedInterest)
            .div(crytoDecimalNumber.ETHM)
            .mul(ethmPrice)
            .toString();
          break;
        case 'USDM':
          equityOfAnToken = new Big(balance)
            .minus(unrealizedInterest)
            .div(crytoDecimalNumber.USDM)
            .mul(usdmPrice)
            .toString();
          break;
      }
      equityEnd = new Big(equityEnd).plus(equityOfAnToken).toString();
    }
    const profitAndLossReport = new ProfitAndLossReport();
    profitAndLossReport.createdDate = dateRange.createdDate;
    profitAndLossReport.dateFrom = dateRange.dateFrom!;
    profitAndLossReport.dateTo = dateRange.dateTo;
    profitAndLossReport.customerId = customerId;
    profitAndLossReport.equityStart = null!;
    profitAndLossReport.equityEnd = new Big(equityEnd)
      .mul(crytoDecimalNumber.USDM)
      .toFixed(0);
    profitAndLossReports.push(profitAndLossReport);
    return profitAndLossReports;
  }
  private async assignNetCashInInUSDM(
    reports: ProfitAndLossReport[],
    dateRange: ProfitReportDatesRange,
    t: Transaction,
    customerId: string,
  ) {
    const sql = `select
                  "customer_id" as "customerId",
                  coalesce ("depositAmtInUSDM",0) "depositAmtInUSDM",
                  coalesce ("withdrawAmtInUSDM",0) "withdrawAmtInUSDM",
                  (coalesce ("depositAmtInUSDM",0) - coalesce ("withdrawAmtInUSDM",0)) as "netCashInUSDM"
                from
                  (
                  select
                    "customer_id",
                      cast( sum(case when "type" in (3) then (case 
                        when "token" = 'USDM' then amount /(${crytoDecimalNumber.USDM}) * price
                        when "token" = 'ETHM' then amount /(${crytoDecimalNumber.ETHM}) * price
                        when "token" = 'BTCM' then amount /(${crytoDecimalNumber.BTCM}) * price
                      else 0 end
                    ) else 0 end) * (${crytoDecimalNumber.USDM}) as decimal(78, 0)) "depositAmtInUSDM",
                      cast( sum(case when "type" in (4) then (case 
                        when "token" = 'USDM' then amount /(${crytoDecimalNumber.USDM}) * price
                        when "token" = 'ETHM' then amount /(${crytoDecimalNumber.ETHM}) * price
                        when "token" = 'BTCM' then amount /(${crytoDecimalNumber.BTCM}) * price
                            else 0 end
                    ) else 0 end) * (${crytoDecimalNumber.USDM}) as decimal(78, 0)) "withdrawAmtInUSDM"
                  from
                    t_decats_balances_histories
                  where
                    created_date >= :dateFrom
                    and created_date <= :dateTo
                    and customer_id = :customerId
                  group by
                    "customer_id"
                                ) as t1
                `;
    let withdrawDeposits: ProfitAndLossReport[] = (await seq.sequelize.query(
      sql,
      {
        replacements: {
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
          customerId: customerId,
        },
        transaction: t,
        type: QueryTypes.SELECT,
      },
    )) as any;
    withdrawDeposits = JSONBig.parse(JSONBig.stringify(withdrawDeposits));
    for (let i = 0; i < reports.length; i++) {
      const foundDbRecord = withdrawDeposits.find(
        (x) => x.customerId == reports[i].customerId,
      );
      if (foundDbRecord) {
        reports[i].netCashInUSDM = foundDbRecord.netCashInUSDM;
      }
    }
  }
  async getCurrentPNL(query: any, t?: Transaction) {
    const funcMsg = `[ProfitAndLossReportService][getCurrentPNL](query.customerId : ${query.customerId})`;
    logger.info(funcMsg);
    const resp = new ResponseBase();

    const customerId = query.customerId;
    // const customerId = '166';
    const dateRange = this.getAllRelatedDate();
    let profitAndLossReports: ProfitAndLossReport[] = [];
    const roolBackInParent = t ? true : false;
    t = t ? t : await seq.sequelize.transaction();
    // 1. get current last block prices
    try {
      await this.assignPricesFromBlockPrices(dateRange, t);
      const balanceReports = await this.getBalanceFromBalance(
        dateRange,
        t,
        customerId,
      );
      //No need for current PNL
      //await this.assignUnrealizedInterest(dateRange, balanceReports, t);
      profitAndLossReports = await this.createProfitAndLossReport(
        dateRange,
        t,
        balanceReports,
        customerId,
      );
      await this.assignNetCashInInUSDM(
        profitAndLossReports,
        dateRange,
        t,
        customerId,
      );
      await this.assignLastProfitAndLossReports(
        profitAndLossReports,
        dateRange,
        t,
        customerId,
      );
      await this.calProfitAndLoss(profitAndLossReports);
    } catch (ex) {
      if (roolBackInParent) {
        throw ex;
      } else {
        logger.error(ex);
        await t.rollback();
        return new ErrorResponseBase(
          ServerReturnCode.DatabaseError,
          'Cannot get current PNL',
        );
      }
    }
    if (profitAndLossReports.length > 0) {
      profitAndLossReports[0].dateFrom = moment(
        profitAndLossReports[0].dateFrom,
        'YYYY-MM-DDTHH:mm:ss.SSS',
      )
        .utc()
        .format();
      profitAndLossReports[0].dateTo = moment(
        profitAndLossReports[0].dateTo,
        'YYYY-MM-DDTHH:mm:ss.SSS',
      )
        .utc()
        .format();
      profitAndLossReports[0].createdDate = moment(
        profitAndLossReports[0].createdDate,
        'YYYY-MM-DDTHH:mm:ss.SSS',
      )
        .utc()
        .format();
    }
    if (!roolBackInParent) {
      await t.commit();
    }
    resp.data = profitAndLossReports[0];
    resp.success = true;
    resp.respType = 'success';
    resp.returnCode = ServerReturnCode.Success;
    resp.msg = 'Success';
    return resp;
  }

  async getCurrentPNLTest(query: any, t?: Transaction) {
    const funcMsg = `[ProfitAndLossReportService][getCurrentPNL](query.customerId : ${query.customerId})`;
    logger.info(funcMsg);
    const resp = new ResponseBase();

    const customerId = query.customerId;
    const dateRange = this.getAllRelatedDate();
    let profitAndLossReports: ProfitAndLossReport[] = [];
    const roolBackInParent = t ? true : false;
    t = t ? t : await seq.sequelize.transaction();
    // 1. get current last block prices
    try {
      await this.assignPricesFromBlockPrices(dateRange, t);
      const balanceReports = await this.getBalanceFromBalance(
        dateRange,
        t,
        customerId,
      );
      //No need for current PNL
      //await this.assignUnrealizedInterest(dateRange, balanceReports, t);
      profitAndLossReports = await this.createProfitAndLossReport(
        dateRange,
        t,
        balanceReports,
        customerId,
      );
      await this.assignNetCashInInUSDM(
        profitAndLossReports,
        dateRange,
        t,
        customerId,
      );
      await this.assignLastProfitAndLossReports(
        profitAndLossReports,
        dateRange,
        t,
        customerId,
      );
      await this.calProfitAndLoss(profitAndLossReports);
    } catch (ex) {
      if (roolBackInParent) {
        throw ex;
      } else {
        logger.error(ex);
        await t.rollback();
        return new ErrorResponseBase(
          ServerReturnCode.DatabaseError,
          'Cannot get current PNL',
        );
      }
    }
    if (profitAndLossReports.length > 0) {
      profitAndLossReports[0].dateFrom = moment(
        profitAndLossReports[0].dateFrom,
        'YYYY-MM-DDTHH:mm:ss.SSS',
      )
        .utc()
        .format();
      profitAndLossReports[0].dateTo = moment(
        profitAndLossReports[0].dateTo,
        'YYYY-MM-DDTHH:mm:ss.SSS',
      )
        .utc()
        .format();
      profitAndLossReports[0].createdDate = moment(
        profitAndLossReports[0].createdDate,
        'YYYY-MM-DDTHH:mm:ss.SSS',
      )
        .utc()
        .format();
    }
    if (!roolBackInParent) {
      await t.commit();
    }
    resp.data = profitAndLossReports[0];
    resp.success = true;
    resp.respType = 'success';
    resp.returnCode = ServerReturnCode.Success;
    resp.msg = 'Success';
    return resp;
  }
  private async calProfitAndLoss(profitAndLossReports: ProfitAndLossReport[]) {
    for (const report of profitAndLossReports) {
      report.profitAndLoss = new Big(report.equityEnd)
        .minus(report.equityStart ? report.equityStart : 0)
        .minus(report.netCashInUSDM)
        .toString();
    }
  }
  private async assignLastProfitAndLossReports(
    reports: ProfitAndLossReport[],
    dateRange: ProfitReportDatesRange,
    t: Transaction,
    customerId: string,
  ) {
    logger.info(
      `[ProfitDailyReportService][ProfitAndLossReport] assignLastProfitAndLossReports`,
    );
    logger.info(`[ProfitDailyReportService][Profit] assignLastProfitReport`);

    let dbReports: ProfitAndLossReport[] = (await modelModule[
      SeqModel.name.ProfitAndLossReport
    ].findAll({
      where: {
        createdDate: dateRange.yesterdayCreatedDate,
        customerId: customerId,
      },
      transaction: t,
    })) as any;
    dbReports = JSONBig.parse(JSONBig.stringify(dbReports));
    for (let i = 0; i < reports.length; i++) {
      const foundDbRecord = dbReports.find(
        (x) => x.customerId == reports[i].customerId,
      );
      if (foundDbRecord) {
        reports[i].equityStart = foundDbRecord.equityEnd;
      }
    }
  }

  async assignPricesFromBlockPrices(
    dateRange: ProfitReportDatesRange,
    t: Transaction,
  ) {
    const sql = `select
                      pair_name as "pairName",
                      reserve1,
                      reserve0
                  from
                      t_decats_block_prices 
                  where
                      id in (
                      select
                        max(id)
                      from
                        t_decats_block_prices
                      where
                        created_date >= :dateFrom
                        and created_date <=  :dateTo
                      group by
                        pair_name)`;
    const pricesResult: BlockPrices[] = (await seq.sequelize.query(sql, {
      replacements: {
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
      },
      type: QueryTypes.SELECT,
      transaction: t,
    })) as any;
    const prices = JSONBig.parse(JSONBig.stringify(pricesResult));

    const usdm =
      globalVar.foundationConfig.smartcontract.MappedSwap[
        `OwnedBeaconProxy<USDM>`
      ];
    const ethm =
      globalVar.foundationConfig.smartcontract.MappedSwap[
        `OwnedBeaconProxy<ETHM>`
      ];
    const btcm =
      globalVar.foundationConfig.smartcontract.MappedSwap[
        `OwnedBeaconProxy<BTCM>`
      ];
    const btcmPair = {
      usdmIndex: 0,
      otherTokenIndex: 0,
      pairAddr: [usdm.address, btcm.address].sort(),
    };
    const ethmPair = {
      usdmIndex: 0,
      otherTokenIndex: 0,
      pairAddr: [usdm.address, ethm.address].sort(),
    };
    for (let i = 0; i < btcmPair.pairAddr.length; i++) {
      if (btcmPair.pairAddr[i] == usdm.address) {
        btcmPair.usdmIndex = i;
        btcmPair.otherTokenIndex = i == 0 ? 1 : 0;
        break;
      }
    }
    for (let i = 0; i < ethmPair.pairAddr.length; i++) {
      if (ethmPair.pairAddr[i] == usdm.address) {
        ethmPair.usdmIndex = i;
        ethmPair.otherTokenIndex = i == 0 ? 1 : 0;
        break;
      }
    }
    for (let i = 0; i < prices.length; i++) {
      if (prices[i].pairName.includes('BTCM')) {
        prices[i].usdmReserve = new Big(
          prices[i][`reserve${btcmPair.usdmIndex}`],
        )
          .div(crytoDecimalNumber.USDM)
          .toString();

        prices[i].otherTokenReserve = new Big(
          prices[i][`reserve${btcmPair.otherTokenIndex}`],
        )
          .div(crytoDecimalNumber.BTCM)
          .toString();
        const btcmExc = this.defaultReserve.find((x) => x.token == 'BTCM');
        const mTokenToUSDRateInDecimals = new Big(prices[i].usdmReserve)
          .div(prices[i].otherTokenReserve)
          .mul(crytoDecimalNumber.BTCM);
        const mTokenToUSDRateInHumanReadable = mTokenToUSDRateInDecimals
          .div(crytoDecimalNumber.BTCM)
          .toString();
        //BTC<->USDM
        btcmExc!.toUSDMExchangeRate = new Big(
          mTokenToUSDRateInDecimals,
        ).toString();
      }

      if (prices[i].pairName.includes('ETHM')) {
        prices[i].usdmReserve = new Big(
          prices[i][`reserve${ethmPair.usdmIndex}`],
        )
          .div(crytoDecimalNumber.USDM)
          .toString();
        prices[i].otherTokenReserve = new Big(
          prices[i][`reserve${ethmPair.otherTokenIndex}`],
        )
          .div(crytoDecimalNumber.ETHM)
          .toString();
        const ethmExc = this.defaultReserve.find((x) => x.token == 'ETHM');
        const mTokenToUSDRateInDecimals = new Big(prices[i].usdmReserve)
          .div(prices[i].otherTokenReserve)
          .mul(crytoDecimalNumber.ETHM);
        const mTokenToUSDRateInHumanReadable = mTokenToUSDRateInDecimals
          .div(crytoDecimalNumber.ETHM)
          .toString();
        //ETHM<->USDM
        ethmExc!.toUSDMExchangeRate = new Big(
          mTokenToUSDRateInDecimals,
        ).toString();
      }
    }
    const usdmRate = this.defaultReserve.find((x) => x.token == 'USDM');
    usdmRate!.toUSDMExchangeRate = crytoDecimalNumber.MST; //crytoDecimalNumber.MST
  }
  async getAll(query: any) {
    const funcMsg = `[ProfitAndLossReportService][getAll](query.customerId : ${query.customerId})`;
    logger.info(funcMsg);
    const whereStatement: any = {};
    whereStatement.customerId = query.customerId;
    const t = await seq.sequelize.transaction();
    let reports: any[] = [];
    let currentPNL: ProfitAndLossReport | undefined = undefined;
    const resp: ResponseBase = new ResponseBase();
    const createdFrom = query.dateFrom
      ? moment.utc(query.dateFrom).startOf('day').add(1, 'day').toDate()
      : undefined;
    const createdTo = query.dateTo
      ? moment.utc(query.dateTo).startOf('day').add(1, 'day').toDate()
      : undefined;
    try {
      if (createdFrom && createdTo) {
        whereStatement.createdDate = {
          [Op.between]: [createdFrom, createdTo],
        };
      } else if (createdFrom) {
        whereStatement.createdDate = {
          [Op.gte]: query.createdFrom,
        };
      } else if (createdTo) {
        whereStatement.createdDate = {
          [Op.lte]: query.createdTo,
        };
      }
      //Weekly volume is the accumalative usdm amount from AgentDailyReportRealTime
      reports = (await modelModule[
        SeqModel.name.ProfitAndLossReport
      ].findAndCountAll({
        where: whereStatement,
        limit: query.recordPerPage,
        offset: query.pageNo * query.recordPerPage,
        order: [['created_date', 'ASC']],
      })) as any;
      const pnl = await this.getCurrentPNL(query, t);
      currentPNL = pnl.data;
    } catch (ex) {
      logger.error(ex);
      await t.rollback();
      return new ErrorResponseBase(
        ServerReturnCode.DatabaseError,
        'Cannot find profit and loss reports',
      );
    }
    resp.success = true;
    resp.msg = `PNL found ${
      query.dateFrom
        ? moment.utc(query.dateFrom).format('YYYY-MM-DD HH:mm:sss')
        : ''
    } to ${moment.utc(currentPNL!.dateTo).format('YYYY-MM-DD HH:mm:sss')}`;
    resp.respType = 'success';
    resp.data = {
      list: reports,
      current: currentPNL,
    };
    await t.commit();
    return resp;
  }
}
