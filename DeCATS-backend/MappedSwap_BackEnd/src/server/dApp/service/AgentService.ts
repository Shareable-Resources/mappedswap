import seq from '../sequelize';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { ResponseBase } from '../../../foundation/server/ApiMessage';
import CommonService from '../../../foundation/server/CommonService';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import {
  AgentLevel,
  AgentStatus,
  AgentType,
} from '../../../general/model/dbModel/Agent';
import logger from '../util/ServiceLogger';
import { Mixed } from '../../../foundation/types/Mixed';
import { Model, Op, Sequelize, Transaction } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import globalVar from '../const/globalVar';
import { MstPriceStatus } from '../../../general/model/dbModel/MstPrice';

const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const funcMsg = `[AgentService][getAll](ParentAgentId : ${query.agentId})`;
    logger.info(funcMsg, { message: ' - start' });

    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'parent_agent_id',
      query.agentId,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'address',
      query.address ? query.address.toLowerCase() : null,
    );
    const results: any = await modelModule[SeqModel.name.Agent].findAndCountAll(
      {
        // include: [
        //   {
        //     model: modelModule[SeqModel.name.Agent],
        //     as: 'agent',
        //   },
        // ],
        where: whereStatement,
        limit: query.recordPerPage,
        offset: query.pageNo * query.recordPerPage,
        attributes: { exclude: ['password'] },
        order: [['id', 'DESC']],
      },
    );
    return results;
  }

  async toMSTExchangeRate() {
    const funcMsg = `[AgentService][getCentrizedAddress]`;
    logger.info(funcMsg, { message: ' - start' });
    const resp = new ResponseBase();

    const getMstPriceResult = await modelModule[SeqModel.name.MstPrice].findAll(
      {
        where: {
          status: MstPriceStatus.StatusActive,
        },
      },
    );
    resp.data = getMstPriceResult;

    resp.success = true;
    // resp.data = globalVar.foundationConfig.MSTToUSDRate;
    resp.msg = 'MST To USD Rate Found';
    logger.info(funcMsg, { message: ' - success' });
    return resp;
  }
}

export async function checkParentAgentRate(
  newObj: DBModel.Agent,
): Promise<ResponseBase> {
  // const funcMsg = `[AgentService][checkParentAgentRate](obj.id : ${newObj.id?.toString()})`;
  const funcMsg = `[AgentService][checkParentAgentRate](obj.id : ${
    newObj.id ? newObj.id : newObj.parentAgentId
  })`;
  logger.info(funcMsg, { message: ' - start' });
  const resp = new ResponseBase();
  resp.success = true;
  // let returnValue = true;

  try {
    const getParentAgentResult = await modelModule[SeqModel.name.Agent].findOne(
      {
        where: {
          id: newObj.parentAgentId?.toString(),
          status: AgentStatus.StatusActive,
        },
      },
    );

    const parentAgentType = getParentAgentResult?.getDataValue('agentType');

    if (parentAgentType == AgentType.FixedLevel) {
      logger.info(`parent agent is fixed level`);
      return resp;
    }

    const feePercentage = getParentAgentResult?.getDataValue('feePercentage')
      ? getParentAgentResult?.getDataValue('feePercentage')
      : 0;
    // prettier-ignore
    const interestPercentage = getParentAgentResult?.getDataValue('interestPercentage')
        ? getParentAgentResult?.getDataValue('interestPercentage')
        : 0;

    if (
      parseFloat(newObj.feePercentage.toString()) > parseFloat(feePercentage)
    ) {
      resp.success = false;
      resp.msg = `Fee percentage cannot larger than parent (${feePercentage})`;
      resp.returnCode = ServerReturnCode.InternalServerError;
      resp.respType = 'warning';
      logger.info(resp.msg);
    }
    if (
      parseFloat(newObj.interestPercentage.toString()) >
      parseFloat(interestPercentage)
    ) {
      resp.success = false;
      resp.msg = `Interest percentage cannot larger than parent (${interestPercentage})`;
      resp.returnCode = ServerReturnCode.InternalServerError;
      resp.respType = 'warning';
      logger.info(resp.msg);
    }

    if (resp.success) {
      logger.info(funcMsg + ' - success ', {
        message: 'Fee and Interest percentage not larger than parent',
      });
    } else {
      logger.info(funcMsg + ' - fail ', { message: resp.msg });
    }
  } catch (e) {
    logger.error(funcMsg + ' - fail ');
    logger.error(e);
  }

  // return returnValue;
  return resp;
}

export async function checkAgentLevel(
  parentAgentId: Mixed,
): Promise<ResponseBase> {
  const funcMsg = `[AgentService][checkAgentLevel](parentAgentId : ${parentAgentId})`;
  logger.info(funcMsg, { message: ' - start' });
  const resp = new ResponseBase();
  resp.success = true;

  try {
    const getParentAgentIdResult = await modelModule[
      SeqModel.name.Agent
    ].findOne({
      where: {
        id: parentAgentId.toString(),
        status: AgentStatus.StatusActive,
      },
    });

    if (getParentAgentIdResult) {
      const agentType = getParentAgentIdResult.getDataValue('agentType');
      if (agentType == AgentType.FixedLevel) {
        const parentAgentLevel =
          getParentAgentIdResult.getDataValue('agentLevel');

        if (parentAgentLevel == AgentLevel.LastLevel) {
          resp.success = false;
          resp.msg =
            'Parent agent cannot add subagent. Agent current level: ' +
            parentAgentLevel.toString();
          resp.returnCode = ServerReturnCode.InternalServerError;
          resp.respType = 'warning';
          logger.info(resp.msg);
        } else {
          const countTotolSubAgentResult = await modelModule[
            SeqModel.name.Agent
          ].findAll({
            attributes: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
            where: {
              parentAgentId: parentAgentId.toString(),
              status: AgentStatus.StatusActive,
            },
          });

          if (
            parseInt(
              countTotolSubAgentResult[0].getDataValue('count').toString(),
            ) >=
            parseInt(
              globalVar.dAppConfig.FixedAgentLevel.memberOnEachLevel.toString(),
            )
          ) {
            resp.success = false;
            resp.msg = 'Parent agent already reach maximum number of sub agent';
            resp.returnCode = ServerReturnCode.InternalServerError;
            resp.respType = 'warning';
            logger.info(resp.msg);
          }
        }
      } else {
        logger.info(`agentType != AgentType.FixedLevel`);
      }
    } else {
      // resp.success = false;
      // resp.msg = 'Parent agent not found';
      // resp.returnCode = ServerReturnCode.InternalServerError;
      // resp.respType = 'warning';
      logger.info(
        `Cannot get parent agent, parent agent id: ${parentAgentId.toString()}`,
      );
      return resp;
    }
  } catch (e) {
    logger.error(funcMsg + ' - fail ');
    logger.error(e);

    resp.success = false;
    resp.msg = '';
    resp.returnCode = ServerReturnCode.InternalServerError;
    resp.respType = 'warning';
  }

  return resp;
}

export async function getFixedLevelPercentage(
  parentAgentId: Mixed,
  agentType?: Mixed | null,
): Promise<ResponseBase> {
  const funcMsg = `[AgentService][getFixedLevelPercentage](parentAgentId : ${parentAgentId})`;
  logger.info(funcMsg, { message: ' - start' });
  const resp = new ResponseBase();
  resp.success = false;

  const returnObj: any = {};

  try {
    const getParentAgentIdResult = await modelModule[
      SeqModel.name.Agent
    ].findOne({
      where: {
        id: parentAgentId.toString(),
        status: AgentStatus.StatusActive,
      },
    });

    if (getParentAgentIdResult) {
      const parentAgentType = getParentAgentIdResult.getDataValue('agentType');

      const parentAgentParentId =
        getParentAgentIdResult.getDataValue('parentAgentId');

      let isParentRootAgent = false;
      if (parentAgentParentId == null) {
        isParentRootAgent = true;
      }

      if (!isParentRootAgent) {
        returnObj['agentType'] = parentAgentType;
      } else {
        returnObj['agentType'] = agentType;
      }

      if (returnObj['agentType'] == AgentType.FixedLevel) {
        let parentAgentLevel =
          getParentAgentIdResult.getDataValue('agentLevel');

        if (!parentAgentLevel) {
          parentAgentLevel = 0;
        }

        const agentLevel = parentAgentLevel + 1;

        returnObj['agentLevel'] = agentLevel;
        returnObj['feePercentage'] =
          globalVar.dAppConfig.FixedAgentLevel.feeLevel['level' + agentLevel];
        returnObj['interestPercentage'] =
          globalVar.dAppConfig.FixedAgentLevel.interestLevel[
            'level' + agentLevel
          ];

        resp.success = true;
        resp.data = returnObj;
        logger.info(funcMsg, { message: ' - success' });
      } else {
        logger.info(`returnObj['agentType'] != AgentType.FixedLevel`);
      }
    } else {
      logger.info(
        `Cannot find parent agent, parent agent id: ${parentAgentId}`,
      );
    }
  } catch (e) {
    logger.error(funcMsg + ' - fail ');
    logger.error(e);

    resp.success = false;
    resp.msg = '';
    resp.returnCode = ServerReturnCode.InternalServerError;
    resp.respType = 'warning';
  }

  return resp;
}
