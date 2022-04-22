import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import { Model, Op, Sequelize } from 'sequelize';
import logger from '../util/ServiceLogger';
import { Mixed } from '../../../foundation/types/Mixed';
const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getAll(query: any): Promise<any> {
    let merged = {};
    const t = await seq.sequelize.transaction();
    try {
      const whereStatment: any = {};
      sequelizeHelper.where.pushExactItemIfNotNull(
        whereStatment,
        'agentId',
        query.agentId,
      );
      sequelizeHelper.where.pushExactItemIfNotNull(
        whereStatment,
        'token',
        query.token,
      );
      sequelizeHelper.where.pushArrayItemIfNotNull(
        whereStatment,
        'distType',
        query.distTypes,
      );
      if (query.dateFrom && query.dateTo) {
        whereStatment.dateEnd = {
          [Op.between]: [query.dateFrom, query.dateTo],
        };
      } else if (query.dateFrom) {
        whereStatment.dateEnd = {
          [Op.gte]: query.dateFrom,
        };
      } else if (query.dateTo) {
        whereStatment.dateEnd = {
          [Op.lte]: query.dateTo,
        };
      }
      const result: {
        rows: Model<any, any>[];
        count: number;
      } = await modelModule[SeqModel.name.AgentDailyReport].findAndCountAll({
        limit: query.recordPerPage,
        offset: query.pageNo * query.recordPerPage,
        where: whereStatment,
        transaction: t,
        order: [['id', 'DESC']],
      });
      // const sumResult: any = await modelModule[
      //   SeqModel.name.AgentDailyReport
      // ].findAll({
      //   attributes: [
      //     'token',
      //     [
      //       Sequelize.fn('sum', Sequelize.col('direct_fee_income')),
      //       'sumOfDirectFeeIncome',
      //     ], //直客手續費收入
      //     [
      //       Sequelize.fn('sum', Sequelize.col('direct_interest_income')),
      //       'sumOfDirectInterestFeeIncome',
      //     ], //直客利息收入
      //     [
      //       Sequelize.fn('sum', Sequelize.col('net_agent_fee_income')),
      //       'sumOfNetAgentFeeIncome',
      //     ], //淨代理手續費收入
      //     [
      //       Sequelize.fn('sum', Sequelize.col('net_agent_interest_income')),
      //       'sumOfNetInterestIncome',
      //     ], //淨代理利息收入
      //     [
      //       Sequelize.fn('sum', Sequelize.col('total_income')),
      //       'sumOfTotalIncome',
      //     ], //總收入
      //   ],
      //   where: whereStatment,
      //   transaction: t,
      //   group: ['token'],
      // });
      merged = {
        data: result,
      };
      await t.commit();
    } catch (e) {
      logger.error(e);
      await t.rollback();
    }

    return merged;
  }
  // prettier-ignore
  async getIncomeAnalysis(query: any): Promise<any> {
    const whereStatement: any = {};

    whereStatement.dateEnd = {
      [Op.between]: [query.dateFrom, query.dateTo],
    };

    whereStatement.agentId = query.agentId;

    const returnData = await modelModule[
      SeqModel.name.AgentDailyReport
    ].findAll({
      attributes: [
        'token',
        'dateEnd',
        [Sequelize.fn('sum', Sequelize.col('direct_fee_income')),'sumOfDirectFeeIncome',],
        [Sequelize.fn('sum', Sequelize.col('direct_interest_income')),'sumOfDirectInterestFeeIncome',],
        [Sequelize.fn('sum', Sequelize.col('all_sub_agent_fee_income')),'sumOfAllSubAgentFeeIncome',],
        [Sequelize.fn('sum', Sequelize.col('all_sub_agent_interest_income')),'sumOfAllSubAgentInterestIncome',],
      ],
      where: whereStatement,
      group: ['token', 'dateEnd'],
    });
    return returnData;
  }
}
