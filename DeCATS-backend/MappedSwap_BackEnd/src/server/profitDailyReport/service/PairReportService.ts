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

  private async createInitializedPairReports(
    dateRange: ProfitReportDatesRange,
  ): Promise<PairDailyReport[]> {
    logger.info(`[PairReportService][Pair] createInitializedPairReports`);
    const defaultDbRecords: PairDailyReport[] = [];
    for (
      let i = 0;
      i < this.defaultReserve.filter((x) => x.token != 'USDM').length;
      i++
    ) {
      const dailyReport = new PairDailyReport();
      dailyReport.token = this.defaultReserve[i].token;
      dailyReport.dateFrom = dateRange.dateFrom;
      dailyReport.dateTo = dateRange.dateTo;
      dailyReport.createdDate = dateRange.createdDate;
      dailyReport.lastModifiedDate = new Date();
      defaultDbRecords.push(dailyReport);
    }
    return defaultDbRecords;
  }

  private async assignPairPrice(
    dateRange: ProfitReportDatesRange,
    reports: PairDailyReport[],
    t: Transaction,
  ) {
    let tokens: any = await modelModule[SeqModel.name.Token].findAll({
      where: {
        name: {
          [Op.not]: 'MST',
        },
      },
      transaction: t,
    });
    tokens = JSON.parse(JSON.stringify(tokens));
    const tokenWithExchangeRate: TokenWithExchangeRate[] = tokens as any;
    const usdm =
      foundationConfig.smartcontract.MappedSwap[`OwnedBeaconProxy<USDM>`];
    const ethm =
      foundationConfig.smartcontract.MappedSwap[`OwnedBeaconProxy<ETHM>`];
    const btcm =
      foundationConfig.smartcontract.MappedSwap[`OwnedBeaconProxy<BTCM>`];
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
    const sql = `select
                          pair_name as "pairName",
                          reserve1,
                          reserve0,
                          "created_date" as "createdDate"
                      from
                          t_decats_price_histories
                      where
                          id in (
                      select
                      max(id)
                      from
                      t_decats_price_histories
                      where
                      created_date >= :dateFrom
                      and created_date <= :dateTo
                      group by
                      pair_name)
                      order by
                      pair_name`;
    let prices: any[] = await seq.sequelize.query(sql, {
      replacements: {
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
      },
      type: QueryTypes.SELECT,
      transaction: t,
    });
    prices = JSONBig.parse(JSON.stringify(prices));
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
        const btcmExc = tokenWithExchangeRate.find((x) => x.name == 'BTCM');
        const mTokenToUSDRateInDecimals = new Big(prices[i].usdmReserve)
          .div(prices[i].otherTokenReserve)
          .mul(crytoDecimalNumber.BTCM);
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
        const ethmExc = tokenWithExchangeRate.find((x) => x.name == 'ETHM');
        const mTokenToUSDRateInDecimals = new Big(prices[i].usdmReserve)
          .div(prices[i].otherTokenReserve)
          .mul(crytoDecimalNumber.ETHM);
        //ETHM<->USDM
        ethmExc!.toUSDMExchangeRate = new Big(
          mTokenToUSDRateInDecimals,
        ).toString();
      }
    }
    const usdmExc = tokenWithExchangeRate.find((x) => x.name == 'USDM');
    //USDM<->USDM
    usdmExc!.toUSDMExchangeRate = '1000000000000000000';
    //USDM<->MST

    for (let i = 0; i < tokenWithExchangeRate.length; i++) {
      const report = reports.find(
        (x) => x.token == tokenWithExchangeRate[i].name,
      );
      if (report) {
        report.price = tokenWithExchangeRate[i].toUSDMExchangeRate;
      }
    }
  }

  /**
   * Create Pair report from transaction
   * @param dateRange － dates range
   * @param t － transaction
   */
  private async assignPairReportsFromTx(
    dateRange: ProfitReportDatesRange,
    reports: PairDailyReport[],
    t: Transaction,
  ) {
    logger.info(`[PairReportService][Pair] createPairReportsFromTx`);
    const sql = `
                select
                  sell_token as "sellToken",
                  buy_token as "buyToken",
                  sum(buy_amount) as "buyAmount",
                  sum(sell_amount) as "sellAmount"
                from
                  t_decats_transactions
                where tx_time>= :dateFrom and tx_time <= :dateTo
                group by
                  sell_token ,
                  buy_token 
                order by sell_token 
                  ;`;
    const sumOfTxs: DBModel.Transaction[] = (await seq.sequelize.query(sql, {
      replacements: {
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
      },
      type: QueryTypes.SELECT,
      transaction: t,
    })) as any;
    if (sumOfTxs && sumOfTxs.length > 0) {
      for (let i = 0; i < reports.length; i++) {
        const sumOfTxBuyAmt = sumOfTxs.find(
          (x) => x.buyToken == reports[i].token,
        );
        const sumOfTxSellAmt = sumOfTxs.find(
          (x) => x.sellToken == reports[i].token,
        );
        if (sumOfTxBuyAmt) {
          reports[i].buyAmount = sumOfTxBuyAmt.buyAmount;
          reports[i].usdmSellAmount = sumOfTxBuyAmt.sellAmount;
        }
        if (sumOfTxSellAmt) {
          reports[i].sellAmount = sumOfTxSellAmt.sellAmount;
          reports[i].usdmBuyAmount = sumOfTxSellAmt?.buyAmount;
        }
      }
    }
  }

  /**
   * Create Profit daily reports and balance snap shots
   * @param cronJobDate － cron job date in YYYY-MM-DD hh:mm:ss
   */
  async create(dateRange: ProfitReportDatesRange) {
    logger.info(`[PairReportService] create`);

    //today report range

    logger.info(
      `Creating pair report on ${dateRange.createdDate}  (Range: ${dateRange.dateFrom}-${dateRange.dateTo})`,
    );
    const resp = new ResponseBase();
    const t = await seq.sequelize.transaction();
    try {
      await this.checkPairReportAlreadyExists(dateRange, t);
      const reports = await this.createInitializedPairReports(dateRange);
      await this.assignPairReportsFromTx(dateRange, reports, t);
      await this.assignPairPrice(dateRange, reports, t);
      await this.insertPairReports(reports, t);
      await t.commit();
      resp.success = true;
    } catch (e) {
      resp.success = false;
      resp.msg = `[PairReportService] cannot create on ${dateRange.createdDate}`;
      logger.error(resp.msg);
      logger.error(e);
      await t.rollback();
    }
    return resp;
  }

  /**
   * Insert data to t_decats_pair_daily_reports
   * @param dataToBeInsert － pairReports to be inserted
   * @param t - Transaction
   */
  private async insertPairReports(
    dataToBeInsert: PairDailyReport[],
    t: Transaction,
  ) {
    logger.info(`[PairReportService][Pair] insertPairReports`);
    const insert: any = await modelModule[
      SeqModel.name.PairDailyReport
    ].bulkCreate(dataToBeInsert, { transaction: t });
  }

  /**
   * Check if pair report is existed, if exists, throw error
   * @param dateRange - all used dateRange
   * @param t - Transaction
   */
  private async checkPairReportAlreadyExists(
    dateRange: ProfitReportDatesRange,
    t: Transaction,
  ) {
    logger.info(`[PairReportService][Pair] checkPairReportAlreadyExists`);
    const pairReportInDb: any = await modelModule[
      SeqModel.name.PairDailyReport
    ].findOne({
      where: {
        createdDate: dateRange.createdDate,
      },
      limit: 1,
      transaction: t,
    });
    const dbRecord: BalanceSnapshot | undefined = JSONBig.parse(
      JSONBig.stringify(pairReportInDb),
    );
    if (dbRecord) {
      throw new Error(`Pair report already generated (${dateRange.dateTo})`);
    }
  }
}
