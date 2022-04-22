import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { JSONB, Model, Op, QueryTypes, Sequelize } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import logger from '../util/ServiceLogger';
import moment from 'moment';
import BlockPrices from '../../../general/model/dbModel/BlockPrices';
import JSONBig from 'json-bigint';
import globalVar from '../../../foundation/const/globalVar';
import { crytoDecimalNumber } from '../../../general/model/dbModel/Prices';
import Big from 'big.js';
import { TokenWithExchangeRate } from '../model/TokenWithExchangeRate';
import BalanceSnapshot, {
  BalanceSnapShotWithUSDM,
} from '../../../general/model/dbModel/BalanceSnapshot';
import { ResponseBase } from '../../../foundation/server/ApiMessage';
import NetCashInInUSDM from '../model/NetCashInInUSDM';
import { start } from 'pm2';
const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(
    query: any,
  ): Promise<{ rows: Model<any, any>[]; count: number }> {
    const funcMsg = `[BalanceSnapshotService][getAll](query.agentId : ${query.agentId})`;
    logger.info(funcMsg);
    const whereStatement: any = {};

    if (query.dateFrom && query.dateTo) {
      whereStatement.dateFrom = {
        [Op.gte]: query.dateFrom,
      };
      whereStatement.dateTo = {
        [Op.lte]: query.dateTo,
      };
    } else if (query.dateFrom) {
      whereStatement.dateFrom = {
        [Op.gte]: query.dateFrom,
      };
    } else if (query.dateTo) {
      whereStatement.dateTo = {
        [Op.lte]: query.dateTo,
      };
    }
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'token',
      query.token,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'customerId',
      query.customerId,
    );
    const results: any = await modelModule[
      SeqModel.name.CommissionJob
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results;
  }

  async getNetCashInInUSDM(query: any) {
    const sql = `select
                  "token",
                  "depositAmtInUSDM",
                  "withdrawAmtInUSDM",
                  ("depositAmtInUSDM" - "withdrawAmtInUSDM") as "netCashInUSDM" from (
                  select 
                      "token",
                    sum(case when "type" in (3) then (amount * price) else 0 end) "depositAmtInUSDM",
                    sum(case when "type" in (4) then (amount * price) else 0 end) "withdrawAmtInUSDM"
                  from
                    t_decats_balances_histories
                  where
                    created_date >= :dateFrom and created_date <= :dateTo
                  group by "token"
                ) as t1
                `;
    let withdrawDeposits: NetCashInInUSDM[] = (await seq.sequelize.query(sql, {
      replacements: {
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      },
      type: QueryTypes.SELECT,
    })) as any;
    withdrawDeposits = JSONBig.parse(JSONBig.stringify(withdrawDeposits));
    let sumOfUSDM = new Big(0).toString();
    withdrawDeposits.forEach((x) => {
      sumOfUSDM = new Big(sumOfUSDM).plus(x.netCashInUSDM).toString();
    });
    return {
      withdrawDeposits: withdrawDeposits,
      sumOfUSDM: sumOfUSDM,
    };
  }

  async getEquity(query: any) {
    const dateFrom = query.dateFrom;
    const dateTo = query.dateTo;
    const customerId = query.customerId;
    const tokens = query.tokens;
    const tokenWithExchangeRate: TokenWithExchangeRate[] = tokens as any;
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
        dateFrom: dateFrom,
        dateTo: dateTo,
      },
      type: QueryTypes.SELECT,
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
        const btcmExc = tokenWithExchangeRate.find((x) => x.name == 'BTCM');
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
        const ethmExc = tokenWithExchangeRate.find((x) => x.name == 'ETHM');
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

    let balanceSnapShots: BalanceSnapshot[] = (await modelModule[
      SeqModel.name.BalanceSnapshot
    ].findAll({
      where: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('created_date')),
            '=',
            Sequelize.fn('date', dateFrom),
          ),
        ],

        createdDate: dateFrom,
        customerId: customerId,
      },
    })) as any;
    balanceSnapShots = JSONBig.parse(JSONBig.stringify(balanceSnapShots));
    const usdmRate = tokenWithExchangeRate.find((x) => x.name == 'USDM');
    usdmRate!.toUSDMExchangeRate = crytoDecimalNumber.MST; //crytoDecimalNumber.MST
    const balanceSnapShotUSDM: BalanceSnapShotWithUSDM[] = balanceSnapShots.map(
      (x) => {
        const excRate = tokenWithExchangeRate.find((t) => t.name == x.token);
        const toUSDMExc = new Big(excRate!.toUSDMExchangeRate)
          .div(crytoDecimalNumber.MST)
          .toString();
        const balMinusUnrealized = new Big(x.balance)
          .minus(x.unrealizedInterest)
          .toString();
        const convertToUSDM = new Big(balMinusUnrealized)
          .div(crytoDecimalNumber[x.token])
          .mul(toUSDMExc)
          .toFixed(6)
          .replace('.', '');
        return {
          ...x,
          excRate: toUSDMExc,
          inUSDM: new Big(convertToUSDM).toString(),
        };
      },
    );
    let equity = new Big(0).toString();
    balanceSnapShotUSDM.forEach((x) => {
      equity = new Big(equity).add(x.inUSDM).toString();
    });
    return {
      balanceSnapShotUSDM: balanceSnapShotUSDM,
      equity: equity,
    };
  }

  async getProfitAndLoss(query: any): Promise<ResponseBase> {
    const funcMsg = `[BalanceSnapshotService][getProfitAndLoss]`;
    const resp = new ResponseBase();
    let tokens: any = await modelModule[SeqModel.name.Token].findAll({
      where: {
        name: {
          [Op.not]: 'MST',
        },
      },
    });
    tokens = JSONBig.parse(JSONBig.stringify(tokens));
    const queryStart = {
      dateFrom: moment(query.dateFrom)
        .startOf('day')
        .add(1, 'day')
        .format('YYYY-MM-DD HH:mm:ss.SSS'),
      dateTo: moment(query.dateFrom)
        .endOf('day')
        .add(1, 'day')
        .format('YYYY-MM-DD HH:mm:ss.SSS'),
      tokens: tokens,
      customerId: query.customerId,
    };

    const queryEnd = {
      dateFrom: moment(query.dateTo)
        .startOf('day')
        .add(1, 'day')
        .format('YYYY-MM-DD HH:mm:ss.SSS'),
      dateTo: moment(query.dateTo)
        .endOf('day')
        .add(1, 'day')
        .format('YYYY-MM-DD HH:mm:ss.SSS'),
      tokens: tokens,
      customerId: query.customerId,
    };
    const startEquity = await this.getEquity(queryStart);
    const endEquity = await this.getEquity(queryEnd);
    const netCashIn = await this.getNetCashInInUSDM(queryStart);
    resp.data = {
      startEquity: startEquity.equity,
      endEquity: endEquity.equity,
      netCashIn: netCashIn.sumOfUSDM,
      profitAndLoss: new Big(endEquity.equity)
        .minus(startEquity.equity)
        .minus(netCashIn.sumOfUSDM)
        .toString(),
    };
    return resp;
  }
}
