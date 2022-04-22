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
   * Get day end and day start from t_decats_profit_summary
   * @param dateRange - dateRange
   */
  private async getInitializedProfitDailyReports(
    dateRange: ProfitReportDatesRange,
  ): Promise<ProfitDailyReport[]> {
    logger.info(
      `[ProfitDailyReportService][Profit] getInitializedProfitDailyReports`,
    );
    const defaultDbRecords: ProfitDailyReport[] = [];
    for (let i = 0; i < this.defaultReserve.length; i++) {
      const dailyReport = new ProfitDailyReport();
      dailyReport.token = this.defaultReserve[i].token;
      dailyReport.dateFrom = dateRange.dateFrom;
      dailyReport.dateTo = dateRange.dateTo;
      dailyReport.createdDate = dateRange.createdDate;
      dailyReport.lastModifiedDate = new Date();
      defaultDbRecords.push(dailyReport);
    }
    return defaultDbRecords;
  }

  /**
   * Get all tokens' reserves from each pair from RaijinSwapPair, using IUniswapV2Pair.json' s abi
   * @dataToBeInserted rajReserveEnd
   */

  /**
   * Get sell amounts from t_decats_transactions
   * @dataToBeInserted sell_amt
   * @dataToBeInserted bot_sell_amt
   */
  private async assignTransactionSum(
    dateRange: ProfitReportDatesRange,
    reports: ProfitDailyReport[],
    botCustomerId: string,
    t: Transaction,
  ) {
    logger.info(`[ProfitDailyReportService][Profit] assignTransactionSum`);

    const sql = `select
                    "sell_token" as "token",
                    sum(sell_amount) "sellAmt",
                    sum(case when customer_id =:botCustomerId then sell_amount else 0 end) "botSellAmt"
                from
                    t_decats_transactions 
                where
                    tx_time  >= :dateFrom and tx_time<= :dateTo
                group by sell_token;
                `;
    const withdrawDeposits: any[] = await seq.sequelize.query(sql, {
      replacements: {
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
        botCustomerId: botCustomerId,
      },
      type: QueryTypes.SELECT,
      transaction: t,
    });
    for (let i = 0; i < reports.length; i++) {
      const withdrawDeposit = withdrawDeposits.find(
        (x) => x.token == reports[i].token,
      );
      if (withdrawDeposit) {
        reports[i].sellAmt = withdrawDeposit.sellAmt;
        reports[i].botSellAmt = withdrawDeposit.botSellAmt;
      }
    }
  }

  /**
   * Get sell amounts from t_decats_interest_histories
   * @dataToBeInserted interest
   */
  private async assignInterestSum(
    dateRange: ProfitReportDatesRange,
    reports: ProfitDailyReport[],
    t: Transaction,
  ) {
    const sql = `select
                      "token",
                      sum(interest) "interest"
                  from
                      t_decats_interest_histories tdih  
                  where
                      to_time  >= :dateFrom and to_time <=:dateTo
                  group by "token";
                `;
    const interests: any[] = await seq.sequelize.query(sql, {
      replacements: {
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
      },
      type: QueryTypes.SELECT,
      transaction: t,
    });
    for (let i = 0; i < reports.length; i++) {
      const interest = interests.find((x) => x.token == reports[i].token);
      if (interest) {
        reports[i].interest = interest.interest;
      }
    }
  }

  /**
   * Get all balance related fields from t_decats_balance_snapshots
   * @dataToBeInserted pool_debit_end
   * @dataToBeInserted pool_deposit_end
   * @dataToBeInserted bot_balance_end
   */
  private async assignBalanceSnapshotSum(
    dateRange: ProfitReportDatesRange,
    reports: ProfitDailyReport[],
    botCustomerId: string,
    t: Transaction,
  ) {
    const sql = `select
                      "token",
                      sum(case when balance >0 then balance else 0 end) "depositAmt",
                      sum(case when balance <0 then balance else 0 end) "debitAmt",
                      sum(unrealized_interest) "unrealizedInterest",
                      sum(balance) "balanceEnd",
                      sum(case when customer_id = :botCustomerId then balance else 0 end) "botAmt"
                  from
                    t_decats_balances_snapshots tdbs
                  where
                    created_date = :createdDate
                  group by "token"
                  `;
    const withdrawDeposits: any[] = await seq.sequelize.query(sql, {
      replacements: {
        createdDate: dateRange.createdDate,
        botCustomerId: botCustomerId,
      },
      type: QueryTypes.SELECT,
      transaction: t,
    });
    for (let i = 0; i < reports.length; i++) {
      const withdrawDeposit = withdrawDeposits.find(
        (x) => x.token == reports[i].token,
      );
      if (withdrawDeposit) {
        reports[i].poolDebitEnd = withdrawDeposit.debitAmt;
        reports[i].poolDepositEnd = withdrawDeposit.depositAmt;
        reports[i].balanceEnd = withdrawDeposit.balanceEnd;
        reports[i].unrealizedInterest = withdrawDeposit.unrealizedInterest;
        reports[i].botBalanceEnd = withdrawDeposit.botAmt;
      }
    }
  }

  /**
   * Create Profit daily reports and balance snap shots
   * @param cronJobDate － cron job date in YYYY-MM-DD hh:mm:ss
   */
  async create(
    dateRange: ProfitReportDatesRange,
    botCustomer: Customer,
    currRajContractAmts,
    currPoolContractAmts,
  ) {
    //today report range

    logger.info(
      `Creating Profit daily reports on ${dateRange.createdDate}  (Range: ${dateRange.dateFrom}-${dateRange.dateTo})`,
    );
    const resp = new ResponseBase();
    const t = await seq.sequelize.transaction();
    try {
      const profitReports = await this.getInitializedProfitDailyReports(
        dateRange,
      );
      //1. check profit daily reports if exists
      await this.checkProfitDailyReportAlreadyExists(dateRange, t);

      //2. get currenct raj swap contract amt
      await this.assignCurrRajContractAmt(profitReports, currRajContractAmts);
      //3. get current pool contract amt
      await this.assignCurrPoolContractAmt(profitReports, currPoolContractAmts);
      //5. get last profit report
      await this.assignLastProfitReport(dateRange, profitReports, t);
      //6. get deposit and withdraw
      await this.assignWithdrawDeposit(dateRange, profitReports, t);
      //7. get pool_debit_end, pool_deposit_end, bot_balance_end,
      await this.assignBalanceSnapshotSum(
        dateRange,
        profitReports,
        botCustomer.id!,
        t,
      );
      //8. get sell_amt, bot_sell_amt
      await this.assignTransactionSum(
        dateRange,
        profitReports,
        botCustomer.id!,
        t,
      );
      //8. get interest
      await this.assignInterestSum(dateRange, profitReports, t);
      //9. calAllSummaryData
      await this.calProfitDailyReport(profitReports);
      //10. insertProfitDailyReports
      await this.insertProfitDailyReports(profitReports, t);
      await t.commit();
      resp.success = true;
    } catch (e) {
      resp.success = false;
      resp.msg = `[ProfitDailyReportService] cannot create on ${dateRange.createdDate}`;
      logger.error(resp.msg);
      logger.error(e);
      await t.rollback();
    }
    return resp;
  }

  /**
   * Get all tokens' reserves from each pair from RaijinSwapPair, using IUniswapV2Pair.json' s abi
   * @dataToBeInserted rajReserveEnd
   */
  private async assignCurrRajContractAmt(
    reports: ProfitDailyReport[],
    currRajContractAmts: TokenReserve[],
  ) {
    logger.info(`[ProfitDailyReportService][Profit] assignCurrRajContractAmt`);

    for (let i = 0; i < currRajContractAmts.length; i++) {
      const dailyReport = reports.find(
        (x) => x.token == currRajContractAmts[i].token,
      );
      if (dailyReport) {
        dailyReport.rajReserveEnd = currRajContractAmts[i].reserve;
      }
    }
  }

  /**
   * Get pool balance from pool contract of the ERC20 address
   *
   * @dataToInserted pool_end
   */
  private async assignCurrPoolContractAmt(
    reports: ProfitDailyReport[],
    currPoolContractAmts: TokenReserve[],
  ) {
    logger.info(`[ProfitDailyReportService][Profit] getCurrPoolContractAmt`);
    for (let i = 0; i < currPoolContractAmts.length; i++) {
      try {
        const dailyReport = reports.find(
          (x) => x.token == currPoolContractAmts[i].token,
        );
        if (dailyReport) {
          dailyReport.poolEnd = currPoolContractAmts[i].reserve;
        }
      } catch (e: any) {
        logger.error('Cannot find balance from ERC20');
        throw e;
      }
    }
  }
  /**
   * Calculate withdrawAmt, depositAmt, netCashIn
   * @param dateRange － date range
   * @param reports － profitDailyReport to be inserted
   * @param t - transaction
   */
  private async assignWithdrawDeposit(
    dateRange: ProfitReportDatesRange,
    reports: ProfitDailyReport[],
    t: Transaction,
  ) {
    logger.info(
      `[ProfitDailyReportService][Profit] assignWithdrawDeposit, ${dateRange.dateFrom} - ${dateRange.dateTo}`,
    );
    const sql = `select
                    "token",
                    "depositAmt",
                    "withdrawAmt",
                    ("depositAmt" - "withdrawAmt") as "netCashIn" from (
                    select 
                        "token",
                      sum(case when "type" in (3) then amount else 0 end) "depositAmt",
                      sum(case when "type" in (4) then amount else 0 end) "withdrawAmt"
                    from
                      t_decats_balances_histories
                    where
                      created_date >= :dateFrom and created_date <= :dateTo
                    group by "token"
                  ) as t1
                `;
    const withdrawDeposits: ProfitDailyReport[] = await seq.sequelize.query(
      sql,
      {
        replacements: {
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
        },
        type: QueryTypes.SELECT,
        transaction: t,
      },
    );

    for (let i = 0; i < reports.length; i++) {
      const withdrawDeposit = withdrawDeposits.find(
        (x) => x.token == reports[i].token,
      );
      if (withdrawDeposit) {
        reports[i].withdrawAmt = withdrawDeposit.withdrawAmt;
        reports[i].depositAmt = withdrawDeposit.depositAmt;
        reports[i].netCashIn = withdrawDeposit.netCashIn;
      }
    }
  }
  /**
   * Calculate poolAmtChange, rajReserveAmtChange
   * @param dailyReports － profitDailyReport to be inserted
   */
  private async calProfitDailyReport(dailyReports: ProfitDailyReport[]) {
    logger.info(`[ProfitDailyReportService][Profit] calProfitDailyReport`);
    for (let i = 0; i < dailyReports.length; i++) {
      dailyReports[i].poolAmtChange = new Big(dailyReports[i].poolEnd)
        .minus(dailyReports[i].poolStart)
        .toString();
      dailyReports[i].rajReserveAmtChange = new Big(
        dailyReports[i].rajReserveEnd,
      )
        .minus(dailyReports[i].rajReserveStart)
        .toString();
      dailyReports[i].balanceChange = new Big(dailyReports[i].balanceEnd)
        .minus(dailyReports[i].balanceStart)
        .toString();
      dailyReports[i].customerProfit = new Big(dailyReports[i].balanceChange)
        .minus(dailyReports[i].netCashIn)
        .toString();
    }
  }

  private async insertProfitDailyReports(
    dataToBeInsert: ProfitDailyReport[],
    t: Transaction,
  ) {
    logger.info(`[ProfitDailyReportService][Profit] insertProfitDailyReports`);
    const insert: any = await modelModule[
      SeqModel.name.ProfitDailyReport
    ].bulkCreate(dataToBeInsert, { transaction: t });
  }

  /**
   * Get last profit summary data of all tokens where dateTo = param[dateFrom]
   * @param dataToBeInserted - rajReserveStart
   * @param dataToBeInserted - poolReserveStart
   */
  private async assignLastProfitReport(
    dateRange: ProfitReportDatesRange,
    reports: ProfitDailyReport[],
    t: Transaction,
  ) {
    logger.info(`[ProfitDailyReportService][Profit] assignLastProfitReport`);

    let dailyReportsInDb: ProfitDailyReport[] = (await modelModule[
      SeqModel.name.ProfitDailyReport
    ].findAll({
      where: {
        dateTo: dateRange.yesterdayTo,
      },
      transaction: t,
    })) as any;
    dailyReportsInDb = JSONBig.parse(JSONBig.stringify(dailyReportsInDb));
    for (let i = 0; i < reports.length; i++) {
      const foundDbRecord = dailyReportsInDb.find(
        (x) => x.token == reports[i].token,
      );
      if (foundDbRecord) {
        reports[i].rajReserveStart = foundDbRecord.rajReserveEnd;
        reports[i].poolStart = foundDbRecord.poolEnd;
        reports[i].poolDepositStart = foundDbRecord.poolDepositEnd;
        reports[i].poolDebitStart = foundDbRecord.poolDebitEnd;
        reports[i].botBalanceStart = foundDbRecord.botBalanceEnd;
        reports[i].balanceStart = foundDbRecord.balanceEnd;
      }
    }
  }

  /**
   * check profit summaries of the dateTo is exists, if exists, throw error
   */
  private async checkProfitDailyReportAlreadyExists(
    dateRange: ProfitReportDatesRange,
    t: Transaction,
  ) {
    logger.info(
      `[ProfitDailyReportService][Profit] checkProfitDailyReportAlreadyExists`,
    );

    const profitSummaryInDb: any = await modelModule[
      SeqModel.name.ProfitDailyReport
    ].findOne({
      where: {
        createdDate: dateRange.createdDate,
      },
      limit: 1,
      transaction: t,
    });
    const dbRecord: ProfitDailyReport | undefined = JSONBig.parse(
      JSONBig.stringify(profitSummaryInDb),
    );
    if (dbRecord) {
      throw new Error(`Profit summary already generated (${dateRange.dateTo})`);
    }
  }
}

export async function getCurrRajContractAmt(sideChainClient: EthClient) {
  logger.info(`[ProfitDailyReportService][Profit] getCurrRajContractAmt`);
  const rajReserves = [
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
  for (
    let i = 0;
    i < globalVar.foundationConfig.smartcontract.rajSwap.length;
    i++
  ) {
    const contractAddress =
      globalVar.foundationConfig.smartcontract.rajSwap[i].addr;
    const abiItems: AbiItem[] = IUniswapV2PairArtifact as AbiItem[];
    const contract = new sideChainClient!.web3Client.eth.Contract(
      abiItems,
      contractAddress,
    ) as any;
    const uniswapV2Contract: IUniswapV2Pair = contract as any;
    const tokenPair0 = await uniswapV2Contract.methods.token0().call();
    const tokenPair1 = await uniswapV2Contract.methods.token1().call();
    const reserveResult = await uniswapV2Contract.methods.getReserves().call();
    const foundToken0 = rajReserves.find(
      (x) => x.address.toLowerCase() == tokenPair0.toLowerCase(),
    );
    const foundToken1 = rajReserves.find(
      (x) => x.address.toLowerCase() == tokenPair1.toLowerCase(),
    );
    if (foundToken0) {
      foundToken0.reserve = new Big(foundToken0.reserve)
        .plus(new Big(reserveResult.reserve0))
        .toString();
    } else {
      throw new Error(
        `Cannot found address ${tokenPair0} in foundation config`,
      );
    }
    if (foundToken1) {
      foundToken1.reserve = new Big(foundToken1.reserve)
        .plus(new Big(reserveResult.reserve1))
        .toString();
    } else {
      throw new Error(
        `Cannot found address ${tokenPair0} in foundation config`,
      );
    }
  }

  return rajReserves;
}

/**
 * Get pool balance from pool contract of the ERC20 address
 *
 * @dataToInserted pool_end
 */
export async function getCurrPoolContractAmt(
  sideChainClient: EthClient,
): Promise<TokenReserve[]> {
  logger.info(`[ProfitDailyReportService][Profit] getCurrPoolContractAmt`);
  const poolReserves = [
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
  const poolAddr =
    globalVar.foundationConfig.smartcontract.MappedSwap[
      'OwnedUpgradeableProxy<Pool>'
    ].address;

  for (let i = 0; i < poolReserves.length; i++) {
    try {
      const abiItems: AbiItem[] = IUniswapV2PairArtifact as AbiItem[];
      const contract: any = new sideChainClient!.web3Client.eth.Contract(
        abiItems,
        poolReserves[i].address,
      );

      const erc20: ERC20 = contract;
      const balance = await erc20.methods.balanceOf(poolAddr).call();
      poolReserves[i].reserve = balance;
    } catch (e: any) {
      logger.error('Cannot find balance from ERC20');
      throw e;
    }
  }
  return poolReserves;
}
