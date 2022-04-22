import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import * as ReqModel from '../../../server/dApp/model/reqModel/0_index';
import logger from '../util/ServiceLogger';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import { MiningRewardsDistributionStatus } from '../../../general/model/dbModel/MiningRewardsDistribution';
import {
  ErrorResponseBase,
  ResponseBase,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { MiningRewardsStatus } from '../../../general/model/dbModel/MiningRewards';
import { Model, Op, QueryTypes } from 'sequelize';
import globalVar from '../const/globalVar';

const modelModule = seq.sequelize.models;
const USDMiningPoolAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap[
    'OwnedBeaconProxy<USDMiningPool>'
  ].address;
const BTCMiningPoolAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap[
    'OwnedBeaconProxy<BTCMiningPool>'
  ].address;
const ETHMiningPoolAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap[
    'OwnedBeaconProxy<ETHMiningPool>'
  ].address;
const contractAddr =
  globalVar.foundationConfig.smartcontract.MappedSwap[
    'OwnedUpgradeableProxy<Payout>'
  ].address;

export default class Service implements CommonService {
  sideChainClient?: EthClient; // mainnet/testnet/dev

  async getAll() {
    //
  }

  async getClaimSummary(
    query: any,
    address: string,
  ): Promise<{ rows: Model<any, any>[] }> {
    const funcMsg = `[CommissionDistributionService][getAllSummary](query.agentId : ${query.agentId})`;
    logger.info(funcMsg, { message: ' - start' });
    const whereJobStatment: any = {};
    const whereSummaryStatment: any = {};

    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();

    let returnResult;

    try {
      if (query.fromTime) {
        whereStatement.push(
          'date_from >= :fromTime',
          'dateFrom',
          query.dateFrom,
        );
      }
      if (query.toTime) {
        whereStatement.push(
          'dateTo <= :toTime',
          'dateTo',
          query.toTime + ' 23:59:59',
        );
      }

      if (query.token) {
        let tokenAddress = '';

        if (query.token.toUpperCase() == 'USD') {
          tokenAddress = USDMiningPoolAddress.toLowerCase();
        } else if (query.token.toUpperCase() == 'ETH') {
          tokenAddress = ETHMiningPoolAddress.toLowerCase();
        } else if (query.token.toUpperCase() == 'BTC') {
          tokenAddress = BTCMiningPoolAddress.toLowerCase();
        }

        whereStatement.push(
          'tdmrd.pool_token = :poolToken',
          'poolToken',
          tokenAddress,
        );
      }

      whereStatement.push(
        'tdmrd.status != :detailStatus',
        'detailStatus',
        MiningRewardsDistributionStatus.Acquired.toString(),
      );
      whereStatement.push('tdmrd.address = :address', 'address', address);

      const sql = `
      select tdmrd."pool_token" as "poolToken", sum(tdmrd.amount) as amount
      from t_decats_mining_rewards_distribution tdmrd 
      ${whereStatement.toSql()}
      group by tdmrd."pool_token" 
      ;
    `;
      // logger.info(sql);

      const merged = {
        ...whereStatement.replacement,
      };

      const result: any[] = await seq.sequelize.query(sql, {
        replacements: {
          ...merged,
          // recordPerPage: query.recordPerPage,
          // pageNo: query.pageNo, //agent_id: id,
        },
        type: QueryTypes.SELECT,
      });

      const objList: any = [];
      if (result) {
        for (let i = 0; i < result.length; i++) {
          const obj = {};
          if (
            result[i]['poolToken'].toLowerCase() ==
            USDMiningPoolAddress.toLowerCase()
          ) {
            obj['poolToken'] = 'USD';
          } else if (
            result[i]['poolToken'].toLowerCase() ==
            ETHMiningPoolAddress.toLowerCase()
          ) {
            obj['poolToken'] = 'ETH';
          } else if (
            result[i]['poolToken'].toLowerCase() ==
            BTCMiningPoolAddress.toLowerCase()
          ) {
            obj['poolToken'] = 'BTC';
          } else {
            obj['poolToken'] = result[i]['poolToken'].toLowerCase();
          }
          obj['amount'] = result[i]['amount'];

          objList.push(obj);
        }
      }

      returnResult = {
        // count: rewardSum[0].count,
        rows: objList,
      };

      logger.info(funcMsg + ' - success ');
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
    }
    return returnResult;
  }

  async getRewardByAddress(query: any, address: string): Promise<any[]> {
    const funcMsg = `[MiningRewardsService][getRewardByAddress]`;
    logger.info(funcMsg, { message: ' - start' });

    let getRewardResult;

    try {
      const whereStatement: any = {};
      sequelizeHelper.where.pushExactItemIfNotNull(
        whereStatement,
        'address',
        address.toLowerCase(),
      );

      if (query.token) {
        let tokenAddress = '';

        if (query.token.toUpperCase() == 'USD') {
          tokenAddress = USDMiningPoolAddress.toLowerCase();
        } else if (query.token.toUpperCase() == 'ETH') {
          tokenAddress = ETHMiningPoolAddress.toLowerCase();
        } else if (query.token.toUpperCase() == 'BTC') {
          tokenAddress = BTCMiningPoolAddress.toLowerCase();
        }

        // whereStatement.push(
        //   'tdmrd.pool_token = :poolToken',
        //   'poolToken',
        //   tokenAddress,
        // );

        sequelizeHelper.where.pushExactItemIfNotNull(
          whereStatement,
          'poolToken',
          tokenAddress,
        );
      }

      // whereStatement.status = {
      //   [Op.ne]: MiningRewardsDistributionStatus.Acquired,
      // };

      getRewardResult = await modelModule[
        SeqModel.name.MiningRewards
      ].findAndCountAll({
        include: [
          {
            required: true,
            // separate: true,
            model: modelModule[SeqModel.name.MiningRewardsDistribution],
            as: 'rewardsDetails',
            // attributes: ['round_id'],
            where: whereStatement,
            order: [['id', 'DESC']],
          },
        ],
        where: {
          // status: MiningRewardsStatus.Approved,
          // status: { [Op.ne]: MiningRewardsStatus.NotApproved },
        },
        limit: query.recordPerPage,
        offset: query.pageNo * query.recordPerPage,
        order: [['id', 'DESC']],
      });

      logger.info(funcMsg, { message: ' - start' });
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
    }

    return getRewardResult;
  }

  async updateRewardById(
    newObj: DBModel.MiningRewardsDistribution,
    t?: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[MiningRewardsService][updateRewardById](id : ${newObj.id})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    const dateNow = new Date();
    let isNewTransaction = false;
    if (!t) {
      t = await seq.sequelize.transaction();
      isNewTransaction = true;
    }

    try {
      const recordInDb = await modelModule[
        SeqModel.name.MiningRewardsDistribution
      ].findOne({
        where: {
          id: newObj.id?.toString(),
          address: newObj.address,
          status: MiningRewardsDistributionStatus.NotAcquired,
        },
        transaction: t,
      });

      if (recordInDb) {
        newObj.status = MiningRewardsDistributionStatus.Acquired;

        const updateResult: any = await modelModule[
          SeqModel.name.MiningRewardsDistribution
        ].update(newObj, {
          fields: ['status'],
          where: {
            id: newObj.id?.toString(),
          },
          transaction: t,
        });

        if (isNewTransaction) {
          await t.commit();
        }

        resp.success = true;
        resp.msg = `update reward status success, id: ${newObj.id}`;

        logger.info(funcMsg + ' - success ', { message: resp.msg });
      } else {
        if (isNewTransaction) {
          await t.rollback();
        }

        resp = new WarningResponseBase(
          ServerReturnCode.UniqueViolationError,
          'Record not found, please use correct ID.',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      }
    } catch (e) {
      if (isNewTransaction) {
        await t.rollback();
      }

      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'update reward status fail :' + e,
      );
    }

    logger.info(funcMsg, { message: ' - end' });
    return resp;
  }
}
