import seq from '../sequelize';
import { Op, QueryTypes, Transaction } from 'sequelize';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import globalVar from '../const/globalVar';
import JSONBig from 'json-bigint';
import { AbiItem } from 'web3-utils';
import moment from 'moment';
import ProfitReportDatesRange from '../model/ProfitReportDatesRange';

import {
  BalanceHistory,
  BalanceSnapshot,
  BlockPrices,
  Customer,
  ConnectedWallet,
  DailyStatisticReport,
  InterestHistory,
  ProfitDailyReport,
} from '../../../general/model/dbModel/0_index';
import { TokenReserve, TokenWithExchangeRate } from '../model/TokenReserve';
import logger from '../util/ServiceLogger';
import Web3 from 'web3';
import { EthClient } from '../../../foundation/utils/ethereum/EthClient';
import foundationConst from '../../../foundation/const/index';
import IUniswapV2PairArtifact from '../../../abi/IUniswapV2Pair.json';
import { IUniswapV2Pair } from '../../../@types/IUniswapV2Pair';
import { ERC20 } from '../../../@types/ERC20';
import Big from 'big.js';
import { ResponseBase } from '../../../foundation/server/ApiMessage';
import PairDailyReport from '../../../general/model/dbModel/PairDailyReport';
import { crytoDecimalNumber } from '../../../general/model/dbModel/Prices';
import ProfitAndLossReport from '../../../general/model/dbModel/ProfitAndLossReport';
import { REQUEST_HEADER_FIELDS_TOO_LARGE } from 'http-status-codes';
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

  /**
   * Create Profit daily reports and balance snap shots
   * @param cronJobDate － cron job date in YYYY-MM-DD hh:mm:ss
   */
  async create(dateRange: ProfitReportDatesRange) {
    logger.info(`[ProfitDailyReportService] create`);
    logger.info(
      `Creating profit and loss reports on ${dateRange.createdDate}  (Range: ${dateRange.dateFrom}-${dateRange.dateTo})`,
    );
    const resp = new ResponseBase();
    const t = await seq.sequelize.transaction();
    try {
      await this.checkProfitAndLossReportsAlreadyExists(dateRange, t);
      await this.assignPricesFromBlockPrices(dateRange, t);
      const profitAndLossReports = await this.createProfitAndLossReport(
        dateRange,
        t,
      );
      await this.assignNetCashInInUSDM(profitAndLossReports, dateRange, t);
      await this.assignLastProfitAndLossReports(
        profitAndLossReports,
        dateRange,
        t,
      );
      await this.calProfitAndLoss(profitAndLossReports);
      await this.insertProfitAndLossReports(profitAndLossReports, t);
      await t.commit();
      resp.success = true;
    } catch (e) {
      resp.success = false;
      resp.msg = `[ProfitAndLossService] cannot create on ${dateRange.createdDate}`;
      logger.error(resp.msg);
      logger.error(e);
      await t.rollback();
    }

    // resp.data = {
    //   profitDailyReports: summariesToBeInsert,
    //   balanceDailyReports: balancesToBeInsert,
    // };
    return resp;
  }

  async checkProfitAndLossReportsAlreadyExists(dateRange, t) {
    const reports: any = await modelModule[
      SeqModel.name.ProfitAndLossReport
    ].findOne({
      where: {
        createdDate: dateRange.createdDate,
      },
      limit: 1,
      transaction: t,
    });
    const dbRecord: ProfitDailyReport | undefined = JSONBig.parse(
      JSONBig.stringify(reports),
    );
    if (dbRecord) {
      throw new Error(
        `Profit and loss report already generated (${dateRange.dateTo})`,
      );
    }
  }

  async calProfitAndLoss(profitAndLossReports: ProfitAndLossReport[]) {
    for (const report of profitAndLossReports) {
      report.profitAndLoss = new Big(report.equityEnd)
        .minus(report.equityStart ? report.equityStart : 0)
        .minus(report.netCashInUSDM)
        .toString();
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
  async createProfitAndLossReport(
    dateRange: ProfitReportDatesRange,
    t: Transaction,
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
    const sql = `select
                    customer_id as "customerId",
                      null as "equityStart",		
                     cast( sum(case when "token" = 'USDM' then ((balance-unrealized_interest)/(${crytoDecimalNumber.USDM}) * ${usdmPrice})
                         when "token" = 'ETHM' then ((balance-unrealized_interest)/(${crytoDecimalNumber.ETHM}) * ${ethmPrice})
                         when "token" = 'BTCM' then ((balance-unrealized_interest)/(${crytoDecimalNumber.BTCM}) * ${btcmPrice}) else 0 end) * ${crytoDecimalNumber.USDM} as decimal(78, 0)) "equityEnd",
                    0 as "netCashInUSDM",
                    :dateFrom as "dateFrom",
                    :dateTo as "dateTo",
                    :createdDate as "createdDate"
                  from
                    public.t_decats_balances_snapshots
                  where
                    created_date = :createdDate
                  group by
                    customer_id
                  order by
                    customer_id
                                  
                                  
                  `;
    let profitAndLossReports: ProfitAndLossReport[] =
      (await seq.sequelize.query(sql, {
        replacements: {
          createdDate: dateRange.createdDate,
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
        },
        type: QueryTypes.SELECT,
        transaction: t,
      })) as any;
    profitAndLossReports = JSONBig.parse(JSON.stringify(profitAndLossReports));
    return profitAndLossReports;
  }

  /**
   * Insert data to t_decats_profit_and_loss_reports
   * @param dataToBeInsert － t_decats_profit_and_loss_reports to be inserted
   * @param t - Transaction
   */
  private async insertProfitAndLossReports(
    dataToBeInsert: ProfitAndLossReport[],
    t: Transaction,
  ) {
    logger.info(
      `[ProfitDailyReportService][ProfitAndLossReport] insertProfitAndLossReports`,
    );
    const insert: any = await modelModule[
      SeqModel.name.ProfitAndLossReport
    ].bulkCreate(dataToBeInsert, { transaction: t });
  }

  private async assignLastProfitAndLossReports(
    reports: ProfitAndLossReport[],
    dateRange: ProfitReportDatesRange,
    t: Transaction,
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

  private async assignNetCashInInUSDM(
    reports: ProfitAndLossReport[],
    dateRange: ProfitReportDatesRange,
    t: Transaction,
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
}
