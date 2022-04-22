import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import SubAgentWeeklyReport from '../model/SubAgentWeeklyReport';
import { Model, Op, QueryTypes, Sequelize } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';

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
const modelModule = seq.sequelize.models;

export default class Service {
  async getExpectedCommission(query: any) {
    const funcMsg = `[CommissionJobService][getExpectedCommission](query.agentId : ${query.agentId})`;
    logger.info(funcMsg);
    const whereAgentDailyReportMTokenStatement: any = {
      distType: AgentDailyReportType.M,
    };
    const whereAgentDailyReportMSTTokenStatement: any = {
      distType: AgentDailyReportType.MST,
    };
    whereAgentDailyReportMTokenStatement.agentId = query.agentId;
    whereAgentDailyReportMSTTokenStatement.agentId = query.agentId;

    //Weekly volume is the accumalative usdm amount from AgentDailyReportRealTime
    let weeklyVolume: any = await modelModule[
      SeqModel.name.AgentDailyReportRealTime
    ].findOne({
      attributes: ['accumalative_usdm_amt'],
      where: {
        agentId: query.agentId,
      },
    });
    weeklyVolume = weeklyVolume
      ? weeklyVolume.getDataValue('accumalative_usdm_amt')
      : 0;
    //Expected commission for this week
    const agentDailyReportMTokenResult: any = await modelModule[
      SeqModel.name.AgentDailyReportRealTime
    ].findAll({
      attributes: ['token', ['dist_token', 'income'], 'createdDate'],
      where: whereAgentDailyReportMTokenStatement,
      order: ['token'],
    });
    const data: any = await modelModule[SeqModel.name.MSTDistRule].findAll({
      order: [['grade', 'asc']],
    });
    const rules: MSTDistRule[] = JSONBig.parse(JSONBig.stringify(data));
    const ar2: any = await modelModule[
      SeqModel.name.AgentDailyReportRealTime
    ].findAll({
      attributes: [
        [Sequelize.literal("'MST'"), 'token'], //custom column name
        [Sequelize.fn('sum', Sequelize.col('dist_token')), 'income'],
        [
          Sequelize.fn('sum', Sequelize.col('dist_token_in_usdm')),
          'incomeInUSDM',
        ],
        'stakedMst',
        'txFeeGrade',
        'stakedMSTGrade',
        'grade',
        'commissionRate',
        'feePercentage',
        'createdDate',
      ],
      group: [
        'agent_id',
        'created_date',
        'stakedMst',
        'txFeeGrade',
        'stakedMSTGrade',
        'grade',
        'commissionRate',
        'feePercentage',
      ],
      where: whereAgentDailyReportMSTTokenStatement,
    });
    let expectedCommissions: any[] = JSONBig.parse(
      JSONBig.stringify(agentDailyReportMTokenResult),
    );
    if (expectedCommissions.length == 0) {
      expectedCommissions = [
        {
          token: 'BTCM',
          income: 0,
          createdDate: moment().format('YYYY-MM-DD'),
        },
        {
          token: 'ETHM',
          income: 0,
          createdDate: moment().format('YYYY-MM-DD'),
        },
        {
          token: 'USDM',
          income: 0,
          createdDate: moment().format('YYYY-MM-DD'),
        },
      ];
    }
    const mstAmt = {
      token: 'MST',
      income: ar2[0] ? ar2[0].getDataValue('income') : 0,
      incomeInUSDM: ar2[0] ? ar2[0].getDataValue('incomeInUSDM') : 0,
      stakedMst: ar2[0] ? ar2[0].getDataValue('stakedMst') : 0,
      txFeeGrade: ar2[0]
        ? ar2[0].getDataValue('txFeeGrade')
        : rules[rules.length - 1].grade,
      stakedMSTGrade: ar2[0]
        ? ar2[0].getDataValue('stakedMSTGrade')
        : rules[rules.length - 1].grade,
      grade: ar2[0]
        ? ar2[0].getDataValue('grade')
        : rules[rules.length - 1].grade,
      commissionRate: ar2[0] ? ar2[0].getDataValue('commissionRate') : 0,
      feePercentage: ar2[0]
        ? ar2[0].getDataValue('feePercentage')
        : rules[rules.length - 1].distMSTTokenRate,
      createdDate: ar2[0]
        ? ar2[0].getDataValue('createdDate')
        : moment().format('YYYY-MM-DD'),
    };
    expectedCommissions.push({
      token: mstAmt.token,
      income: mstAmt.incomeInUSDM,
      createdDate: mstAmt.createdDate,
    });
    //Find commissionRate if query.holdMST
    const detail = {
      stakedMst: mstAmt.stakedMst,
      txFeeGrade: mstAmt.txFeeGrade,
      stakedMSTGrade: mstAmt.stakedMSTGrade,
      grade: mstAmt.grade,
      commissionRate: mstAmt.commissionRate,
      feePercentage: mstAmt.feePercentage,
      weeklyVolume: weeklyVolume,
      comment: '',
    };

    if (query.holdMST !== null || query.holdMST !== undefined) {
      detail.stakedMst = query.holdMST;
      const whereMSTDistRuleStatement: any = {};
      whereMSTDistRuleStatement.holdMST = query.holdMST;

      let foundMstAmtRate = false;
      for (let i = 0; i < rules.length; i++) {
        //Loop through rules to found the greatest mst rate
        //from agent mst staked
        if (!foundMstAmtRate) {
          const ruleHoldMST = rules[i].holdMST;
          if (new Big(query.holdMST).gte(ruleHoldMST)) {
            foundMstAmtRate = true;
          }
        }
        if (foundMstAmtRate) {
          const frontendGrade = rules[i].grade;
          const frontendCommissionRate = rules[i].commissionRate;
          //ruleGrade 5 < 7 txFeeGrade
          if (Number(frontendGrade) <= Number(mstAmt.txFeeGrade)) {
            detail.grade = frontendGrade;
            detail.commissionRate = frontendCommissionRate;
            detail.comment = 'holdMST';
          } else if (Number(frontendGrade) > Number(mstAmt.txFeeGrade)) {
            detail.grade = mstAmt.txFeeGrade;

            detail.comment = 'txFeeGrade';
          } else {
            detail.comment = 'grade';
          }
          break;
        }
      }
    }

    const ruleForGrade: MSTDistRule | undefined = rules.find(
      (x: MSTDistRule) => Number(x.grade) == detail.grade,
    );
    detail.commissionRate = ruleForGrade!.commissionRate;

    return {
      data: expectedCommissions,
      detail: detail,
    };
  }
  async getSubAgentsWeeklyCommission(query: any, jwt: any) {
    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();
    whereStatement.push(
      't1.parent_agent_id = :agentId',
      'agentId',
      query.agentId,
    );
    if (query.address) {
      whereStatement.push(
        't1.address like :address',
        'address',
        `%${query.address}%`,
      );
    }
    const merged = {
      ...whereStatement.replacement,
    };
    const sql = `select
                    t1.id,
                    t1.address,
                    t1.created_date as "createdDate",
                    max(t2.accumalative_usdm_amt) as "weeklyVolume"
                  from
                    t_decats_agents t1
                  left join t_decats_agent_daily_reports_real_time t2 
                  on
                    t1.id = t2.agent_id
                    ${whereStatement.toSql()}
                  group by t1.id order by t1.created_date desc;`;
    let subAgentWeeklyReport: any[] = await seq.sequelize.query(sql, {
      replacements: {
        ...merged,
      },
      type: QueryTypes.SELECT,
    });
    if (subAgentWeeklyReport.length == 0) {
      subAgentWeeklyReport = [];
    }
    const data: SubAgentWeeklyReport[] = JSON.parse(
      JSON.stringify(subAgentWeeklyReport),
    );
    return data;
  }
  async getLedgers(query: any) {
    const funcMsg = `[CommissionJobService][getLedgers](query.agentId : ${query.agentId})`;
    logger.info(funcMsg);
    const whereJobStatment: any = {};
    const whereLedgersStatment: any = {};
    const whereDistStatement: any = {};
    let dateTo = '';
    let dateFrom = '';
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereJobStatment,
      'status',
      query.status,
    );

    if (query.dateYear && query.dateMonth) {
      dateFrom = moment(`${query.dateYear}-${query.dateMonth}-01`)
        .startOf('month')
        .format('YYYY-MM-DD'); //Start of the month
      dateTo = moment(`${query.dateYear}-${query.dateMonth}-01`)
        .endOf('month')
        .format('YYYY-MM-DD'); //End of the month
    } else if (query.dateYear) {
      dateFrom = moment(query.dateYear).startOf('year').format('YYYY-MM-DD'); //Start of the year
      dateTo = moment(query.dateYear).endOf('year').format('YYYY-MM-DD'); //End of the year
    }

    if (dateFrom && dateTo) {
      whereJobStatment.dateFrom = {
        [Op.lte]: dateTo,
      };
      whereJobStatment.dateTo = {
        [Op.gte]: dateFrom,
      };
    }
    whereLedgersStatment.agentId = query.agentId;

    //CF changed code ************************************** */
    if (query.distCommission != null) {
      whereLedgersStatment.distCommission = {
        [Op.gt]: query.distCommission,
      };
    }

    //***************************************************** */

    whereDistStatement.agentId = query.agentId;
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereDistStatement,
      'status',
      query.distStatus,
    );
    let results: any = await modelModule[
      SeqModel.name.CommissionJob
    ].findAndCountAll({
      include: [
        {
          required: true,
          //if not comment out separate, required will not work
          // separate: true,
          attributes: ['token', 'distCommission', 'distCommissionInUSDM'],
          model: modelModule[SeqModel.name.CommissionLedger],
          as: 'ledgers',
          where: whereLedgersStatment,
        },
        {
          required: true,
          separate: true,
          model: modelModule[SeqModel.name.CommissionDistribution],
          as: 'distributions',
          where: whereDistStatement,
        },
      ],
      attributes: [
        'id',
        'dateFrom',
        'dateTo',
        'status',
        'roundId',
        'cronJobId',
      ],
      where: whereJobStatment,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    results = JSONBig.parse(JSON.stringify(results));
    for (let i = 0; i < results.rows.length; i++) {
      //CF changed code ************************************** */
      // if (results.rows[i].ledgers.length == 0) {
      //   results.rows[i].ledgers = [
      //     {
      //       token: 'BTCM',
      //       distCommission: '0',
      //     },
      //     {
      //       token: 'ETHM',
      //       distCommission: '0',
      //     },
      //     {
      //       token: 'MST',
      //       distCommission: '0',
      //     },
      //     {
      //       token: 'USDM',
      //       distCommission: '0',
      //     },
      //   ];
      // }
      //***************************************************** */

      // } else if (!results.rows[i].ledgers.some((e) => e.token == 'MST')) {
      //   results.rows[i].ledgers.push({
      //     token: 'MST',
      //     distCommission: '0',
      //   });
      // }
      if (results.rows[i].distributions.length > 0) {
        results.rows[i].distributions = results.rows[i].distributions[0];
      } else {
        results.rows[i].distributions = null;
      }
    }
    return results;
  }

  async getLedgersDetails(query: any): Promise<any> {
    const whereStatement = {
      cronJobId: query.cronJobId,
      agentId: query.agentId,
    };

    const result = await modelModule[SeqModel.name.AgentDailyReport].findAll({
      attributes: [
        'id',
        'agentId',
        'token',
        'dateEnd',
        'feePercentage',
        'interestPercentage',
        'turnOver',
        'directFeeIncome',
        'directInterestIncome',
        'totalIncome',
        'allSubAgentFeeIncome',
        'allSubAgentInterestIncome',
        'allChildAgentFeeIncome',
        'allChildAgentInterestIncome',
        'netAgentFeeIncome',
        'netAgentInterestIncome',
        'toUSDMExchangeRate',
        'distType',
        'distToken',
        'cronJobId',
        'distTokenInUSDM',
      ],
      where: whereStatement,
      order: [['token', 'ASC']],
    });

    return result;
  }

  async acquireSuccess(obj: CommissionDistribution): Promise<ResponseBase> {
    const funcMsg = `[CommissionDistributionService][acquireSuccess](obj.jobId : ${obj.jobId})`;
    const t = await seq.sequelize.transaction();
    const whereStatment: any = {};
    let resp = new ResponseBase();
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatment,
      'agentId',
      obj.agentId,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatment,
      'jobId',
      obj.jobId,
    );

    try {
      const result = await modelModule[
        SeqModel.name.CommissionDistribution
      ].findOne({
        where: {
          jobId: obj.jobId.toString(),
          agentId: obj.agentId.toString(),
        },
        transaction: t,
      });

      if (!result) {
        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Commission distribution not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else if (
        result &&
        result.getDataValue('status') == CommissionDistributionStatus.Acquired
      ) {
        resp = new WarningResponseBase(
          ServerReturnCode.BadRequest,
          'Commission distribution status has been changed',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else {
        const updateResult: any = await modelModule[
          SeqModel.name.CommissionDistribution
        ].update(obj, {
          transaction: t,
          where: whereStatment,
          fields: ['status', 'acquiredDate', 'txHash', 'txDate'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
        });
        const affectedRowsMsg = `Updated affected rows (${updateResult[0]})`;
        logger.info(funcMsg, {
          message: affectedRowsMsg,
        });
        resp.success = updateResult[0] > 0 ? true : false;
        resp.msg = resp.success ? 'Success' : 'Fail';
        resp.returnCode =
          updateResult[0] > 0
            ? ServerReturnCode.Success
            : ServerReturnCode.InternalServerError;
        resp.respType = updateResult[0] > 0 ? 'success' : 'warning';
      }
      await t.commit();
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Change distribution status to acquired fail :' + e,
      );
      await t.rollback();
    }
    return resp;
  }
}
