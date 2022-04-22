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
import { ConnectedType } from '../../../general/model/dbModel/ConnectedWallet';
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
   * Create raily statistic report
   * @param dateRange － ProfitReportDatesRange
   */
  async create(dateRange: ProfitReportDatesRange) {
    logger.info(`[DailyStatisticReportService] create`);

    //today report range

    logger.info(
      `Creating daily statistic on ${dateRange.createdDate}  (Range: ${dateRange.dateFrom}-${dateRange.dateTo})`,
    );
    const resp = new ResponseBase();
    const t = await seq.sequelize.transaction();
    try {
      await this.checkDailyStatisticReportsExists(dateRange, t);
      const report = this.createDailyStatisticReport(dateRange);
      await this.assignNoOfActiveAddresses(report, dateRange, t);
      await this.assignNoOfConnectedWallets(report, dateRange, t);
      await this.insertStatisticReports(report, t);
      await t.commit();
      resp.success = true;
    } catch (e) {
      resp.success = false;
      resp.msg = `[DailyStatisticReportService] cannot create on ${dateRange.createdDate}`;
      logger.error(resp.msg);
      logger.error(e);
      await t.rollback();
    }

    return resp;
  }

  private async insertStatisticReports(
    report: DailyStatisticReport,
    t: Transaction,
  ) {
    logger.info(
      `[DailyStatisticReportService][Statistic] insertStatisticReports`,
    );
    const insert: any = await modelModule[
      SeqModel.name.DailyStatisticReport
    ].create(report, { transaction: t });
  }

  private createDailyStatisticReport(
    dateRange: ProfitReportDatesRange,
  ): DailyStatisticReport {
    logger.info(
      `[DailyStatisticReportService][ProfitAndLoss] createDailyStatisticReport`,
    );
    const report = new DailyStatisticReport();
    report.dateFrom = dateRange.dateFrom;
    report.dateTo = dateRange.dateTo;
    report.createdDate = dateRange.createdDate;
    return report;
  }

  private async assignNoOfConnectedWallets(
    report: DailyStatisticReport,
    dateRange: ProfitReportDatesRange,
    t: Transaction,
  ) {
    logger.info(
      `[DailyStatisticReportService][DailyStatistic] assignNoOfConnectedWallets`,
    );
    const whereStatement: any = {};
    whereStatement.createdDate = {
      [Op.between]: [dateRange.dateFrom, dateRange.dateTo],
    };
    whereStatement.connectedType = ConnectedType.customer;
    //Addresses from t_decats_balance_histories
    let connectedWallets: ConnectedWallet[] = (await modelModule[
      SeqModel.name.ConnectedWallet
    ].findAll({
      attributes: ['address'],
      where: whereStatement,
      group: ['address'],
      transaction: t,
    })) as any;
    connectedWallets = JSON.parse(JSON.stringify(connectedWallets));
    report.noOfConnectedWallets = connectedWallets.length;
  }

  private async assignNoOfActiveAddresses(
    report: DailyStatisticReport,
    dateRange: ProfitReportDatesRange,
    t: Transaction,
  ) {
    logger.info(
      `[DailyStatisticReportService][ProfitAndLoss] assignNoOfActiveAddresses`,
    );
    const whereStatement: any = {};
    whereStatement.createdDate = {
      [Op.between]: [dateRange.dateFrom, dateRange.dateTo],
    };
    //Addresses from t_decats_balance_histories
    let balanceHistories: BalanceHistory[] = (await modelModule[
      SeqModel.name.BalanceHistory
    ].findAll({
      attributes: ['address'],
      where: whereStatement,
      group: ['address'],
      transaction: t,
    })) as any;
    balanceHistories = JSON.parse(JSON.stringify(balanceHistories));
    //Addresses from t_decats_interest_histories
    let interestHistories: InterestHistory[] = (await modelModule[
      SeqModel.name.InterestHistory
    ].findAll({
      attributes: ['address'],
      where: whereStatement,
      group: ['address'],
      transaction: t,
    })) as any;
    interestHistories = JSON.parse(JSON.stringify(interestHistories));
    let addresses = interestHistories
      .map((x) => x.address)
      .concat(balanceHistories.map((x) => x.address));
    addresses = [...new Set(addresses)];
    report.noOfActiveAddresses = addresses.length;
  }

  /**
   * Check if pair report is existed, if exists, throw error
   * @param dateRange - all used dateRange
   * @param t - Transaction
   */
  private async checkDailyStatisticReportsExists(
    dateRange: ProfitReportDatesRange,
    t: Transaction,
  ) {
    logger.info(
      `[DailyStatisticReportService][Statistic] checkDailyStatisticReportsExists`,
    );
    const pairReportInDb: any = await modelModule[
      SeqModel.name.DailyStatisticReport
    ].findOne({
      where: {
        createdDate: dateRange.createdDate,
      },
      limit: 1,
      transaction: t,
    });
    const dbRecord: DailyStatisticReport | undefined = JSONBig.parse(
      JSONBig.stringify(pairReportInDb),
    );
    if (dbRecord) {
      throw new Error(
        `DailyStatisticReport report already generated (${dateRange.dateTo})`,
      );
    }
  }
}
