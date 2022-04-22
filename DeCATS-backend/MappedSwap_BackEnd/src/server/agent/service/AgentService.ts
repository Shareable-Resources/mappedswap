import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op, Sequelize, Transaction } from 'sequelize';
import {
  ErrorResponseBase,
  ResponseBase,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import logger from '../util/ServiceLogger';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import {
  signFundingCode,
  signToken,
  validateFundingCode,
} from '../../../foundation/server/Middlewares';

import BlockChainHelper from '../../../foundation/utils/BlockChainHelper';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import {
  AgentLevel,
  AgentStatus,
  AgentType,
} from '../../../general/model/dbModel/Agent';
import Big from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';
import {
  decrypt,
  hashIt,
  makeId,
} from '../../../foundation/server/CommonFunction';
import { AbiItem } from 'web3-utils';
import IAgentDataArtifact from '../../../abi/IAgentData.json';
import { IAgentData } from '../../../@types/IAgentData.d';
import {
  FundingCodeCodeStatus,
  FundingCodeStatus,
  FundingCodeTypeStatus,
} from '../../../general/model/dbModel/FundingCode';
import { Account, SignedTransaction, Providers } from 'web3-core';
import {
  ReferralCodeCodeStatus,
  ReferralCodeStatus,
  ReferralCodeType,
} from '../../../general/model/dbModel/ReferralCode';
import ConnectedWalletService from './ConnectedWalletService';
import foundationConst from '../../../foundation/const/index';
import Web3 from 'web3';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import crypto from 'crypto';
import Db from '../../../foundation/sequlelize';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import globalVar from '../const/globalVar';
import { any } from 'sequelize/types/lib/operators';
import {
  CustomerContractStatus,
  CustomerCreditModeStatus,
  CustomerDefaultDetails,
  CustomerType,
} from '../../../general/model/dbModel/Customer';
import CustomerService from '../service/CustomerService';
import { ConnectedType } from '../../../general/model/dbModel/ConnectedWallet';

const modelModule = seq.sequelize.models;

// declare global {}
// declare interface Window {
//   ethereum: Ethereumish;
// }
export default class Service implements CommonService {
  connectedWalletService: ConnectedWalletService;
  constructor() {
    this.connectedWalletService = new ConnectedWalletService();
  }
  async getAll(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    // const results: any = await modelModule[SeqModel.name.Agent].findAll({});
    // return results as DBModel.Agent[];
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'parent_agent_id',
      query.agentId,
    );
    sequelizeHelper.where.pushLikeItemIfNotNull(
      whereStatement,
      'address',
      query.address ? query.address.toLowerCase() : null,
    );
    sequelizeHelper.where.pushLikeItemIfNotNull(
      whereStatement,
      'name',
      query.name,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'status',
      query.status,
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

  async getById(searchParams?: any): Promise<ResponseBase> {
    const funcMsg = `[AgentService][getById](obj.id : ${searchParams})`;
    let resp = new ResponseBase();
    const result = await modelModule[SeqModel.name.Agent].findOne({
      where: {
        id: searchParams,
      },
      attributes: { exclude: ['password'] },
    });
    if (!result) {
      resp = new WarningResponseBase(
        ServerReturnCode.RecordNotFound,
        'Agent record not found',
      );
      logger.info(funcMsg + ' - fail ', { message: resp.msg });
    } else {
      resp.data = result;
      resp.success = true;
      resp.msg = 'Record found';
    }
    return resp;
  }

  async update(newObj: DBModel.Agent): Promise<ResponseBase> {
    const funcMsg = `[AgentService][update](obj.id : ${newObj.id})`;
    logger.info(funcMsg, { message: ' - start' });
    logger.info('newObj: ', newObj);
    const t = await seq.sequelize.transaction();
    let resp = new ResponseBase();
    const dateNow = new Date();
    newObj.createdDate = dateNow;
    newObj.lastModifiedDate = dateNow;
    if (newObj.address) {
      newObj.address = newObj.address.toLowerCase();
    }
    try {
      //Validate the record is in db
      const recordInDb = await modelModule[SeqModel.name.Agent].findOne({
        where: {
          address: newObj.address,
        },
        transaction: t,
      });

      const checkDuplicateEmail = await modelModule[
        SeqModel.name.Agent
      ].findOne({
        where: {
          email: newObj.email,
          address: { [Op.ne]: newObj.address },
        },
        transaction: t,
      });

      if (!recordInDb || checkDuplicateEmail) {
        if (!recordInDb) {
          resp = new WarningResponseBase(
            ServerReturnCode.RecordNotFound,
            'Agent record not found',
          );
          logger.info(funcMsg + ' - fail ', { message: resp.msg });
        } else {
          resp = new WarningResponseBase(
            ServerReturnCode.RecordDuplicated,
            'Agent email duplicated',
          );
          logger.info(funcMsg + ' - fail ', { message: resp.msg });
        }
      } else {
        const agentType = recordInDb.getDataValue('agentType');

        newObj.parentAgentId = recordInDb.getDataValue('parentAgentId');

        let checkAgentRate;
        let checkParentAgentRate;
        if (agentType == AgentType.MST) {
          newObj.interestPercentage = 0;
          newObj.feePercentage = 0;

          resp.success = true;
          checkAgentRate = resp;
          checkParentAgentRate = resp;
        } else {
          checkAgentRate = await this.getAgentChangedRate(newObj);
          checkParentAgentRate = await this.checkParentAgentRate(newObj);
        }

        if (!newObj.allowViewAgent) {
          newObj.allowViewAgent = false;
        }

        if (checkAgentRate.success && checkParentAgentRate.success) {
          // const agentType = recordInDb.getDataValue('agentType');

          let updateResult: any;
          if (agentType == AgentType.FixedLevel || agentType == AgentType.MST) {
            updateResult = await modelModule[SeqModel.name.Agent].update(
              newObj,
              {
                transaction: t,
                where: {
                  address: newObj.address.toLowerCase(),
                  id: newObj.id?.toString(),
                },
                fields: [
                  'name',
                  'email',
                  'lastModifiedDate',
                  'password',
                  'allowViewAgent',
                ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
              },
            );
          } else {
            if (newObj.password) {
              updateResult = await modelModule[SeqModel.name.Agent].update(
                newObj,
                {
                  transaction: t,
                  where: {
                    address: newObj.address.toLowerCase(),
                    id: newObj.id?.toString(),
                  },
                  fields: [
                    'name',
                    'email',
                    'interestPercentage',
                    'feePercentage',
                    'lastModifiedDate',
                    'password',
                    'allowViewAgent',
                  ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
                },
              );
            } else {
              updateResult = await modelModule[SeqModel.name.Agent].update(
                newObj,
                {
                  transaction: t,
                  where: {
                    address: newObj.address.toLowerCase(),
                    id: newObj.id?.toString(),
                  },
                  fields: [
                    'name',
                    'email',
                    'interestPercentage',
                    'feePercentage',
                    'lastModifiedDate',
                    'allowViewAgent',
                  ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
                },
              );
            }
          }
          const affectedRowsMsg = `Updated affected rows (${updateResult[0]})`;
          logger.info(funcMsg, {
            message: affectedRowsMsg,
          });
          resp.success = updateResult[0] > 0 ? true : false;
          resp.msg = affectedRowsMsg;
          resp.returnCode =
            updateResult[0] > 0
              ? ServerReturnCode.Success
              : ServerReturnCode.InternalServerError;
          resp.respType = updateResult[0] > 0 ? 'success' : 'warning';
        } else {
          if (!checkAgentRate.success) {
            resp = checkAgentRate;
          } else if (!checkParentAgentRate.success) {
            resp = checkParentAgentRate;
          }
          logger.info(funcMsg + ' - fail ', { message: resp.msg });
        }
      }
      await t.commit(); //Transaction must be commited or rollback, otherwise sequlize connection to DB will be locked
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Update user fail :' + e,
      );
      await t.rollback();
    } finally {
      // if (t) {
      //   t.rollback();
      // }
      // try {
      //   t.rollback();
      // } catch (ex) {
      //   logger.error(ex);
      // }
    }
    return resp;
  }

  async create(obj: DBModel.Agent, id: number): Promise<ResponseBase> {
    const newObj = obj;
    const dateNow = new Date();
    newObj.id = null;
    newObj.createdById = id;
    newObj.createdDate = dateNow;
    newObj.lastModifiedById = id;
    newObj.lastModifiedDate = dateNow;
    newObj.status = AgentStatus.StatusActive;
    newObj.parentAgentId = id;
    if (newObj.address) {
      newObj.address = newObj.address.toLowerCase();
    }

    const funcMsg = `[AgentService][create](obj.name : ${newObj.name})`;
    logger.info(funcMsg, { message: ' - start' });
    logger.info('obj:', obj);
    logger.info(`id: ${id}`);
    const t = await seq.sequelize.transaction();
    let resp = new ResponseBase();

    try {
      const recordInDb = await modelModule[SeqModel.name.Agent].findOne({
        where: {
          address: newObj.address,
        },
        transaction: t,
      });
      const recordInDb2 = await modelModule[SeqModel.name.Agent].findOne({
        where: {
          email: newObj.email,
        },
        transaction: t,
      });

      if (!newObj.feePercentage) {
        newObj.feePercentage = 0;
      }
      if (!newObj.interestPercentage) {
        newObj.interestPercentage = 0;
      }
      if (!newObj.allowViewAgent) {
        newObj.allowViewAgent = false;
      }

      if (recordInDb || recordInDb2) {
        resp = new WarningResponseBase(
          ServerReturnCode.UniqueViolationError,
          'Duplicated Record (Email or address duplicated)',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else {
        // prettier-ignore
        const checkParentAgentRateResult = await this.checkParentAgentRate(newObj);
        const checkAgentLevelResult = await this.checkAgentLevel(
          newObj.parentAgentId,
        );

        if (
          checkParentAgentRateResult.success &&
          checkAgentLevelResult.success
        ) {
          if (newObj.address) {
            newObj.address = newObj.address.toLocaleLowerCase();
          }

          // const getParentAgentIdResult = await modelModule[
          //   SeqModel.name.Agent
          // ].findOne({
          //   where: {
          //     id: newObj.parentAgentId,
          //     status: AgentStatus.StatusActive,
          //   },
          // });

          // if (getParentAgentIdResult) {
          //   const parentAgentType =
          //     getParentAgentIdResult.getDataValue('agentType');

          //   const parentAgentParentId =
          //     getParentAgentIdResult.getDataValue('parentAgentId');

          //   let isParentRootAgent = false;
          //   if (parentAgentParentId == null) {
          //     isParentRootAgent = true;
          //   }

          //   if (!isParentRootAgent) {
          //     newObj.agentType = parentAgentType;
          //   }

          //   if (newObj.agentType == AgentType.FixedLevel) {
          //     let parentAgentLevel =
          //       getParentAgentIdResult.getDataValue('agentLevel');

          //     if (!parentAgentLevel) {
          //       parentAgentLevel = 0;
          //     }

          //     const agentLevel = parentAgentLevel + 1;

          //     newObj.agentLevel = agentLevel;
          //     newObj.feePercentage =
          //       agentServerConfig.FixedAgentLevel.interestLevel[
          //         'level' + agentLevel
          //       ];
          //     newObj.interestPercentage =
          //       agentServerConfig.FixedAgentLevel.feeLevel[
          //         'level' + agentLevel
          //       ];
          //   }
          // }

          const fixedLevelObj = await this.getFixedLevelPercentage(
            newObj.parentAgentId,
            newObj.agentType,
          );

          if (fixedLevelObj.success) {
            if (fixedLevelObj.data['agentType']) {
              newObj.agentType = fixedLevelObj.data['agentType'];
            }
            if (fixedLevelObj.data['agentLevel']) {
              newObj.agentLevel = fixedLevelObj.data['agentLevel'];
            }
            if (fixedLevelObj.data['feePercentage']) {
              newObj.feePercentage = fixedLevelObj.data['feePercentage'];
            }
            if (fixedLevelObj.data['interestPercentage']) {
              newObj.interestPercentage =
                fixedLevelObj.data['interestPercentage'];
            }
          }

          const parentAgentObj = await modelModule[SeqModel.name.Agent].findOne(
            {
              where: {
                id: newObj.parentAgentId,
              },
            },
          );

          let parentTree: any = [];
          if (parentAgentObj) {
            parentTree = parentAgentObj?.getDataValue('parentTree');
            if (!parentTree || parentTree.length < 1) {
              parentTree = [];
            }
          }
          parentTree.push(newObj.parentAgentId);

          newObj.parentTree = parentTree;

          const insertResult: any = await modelModule[
            SeqModel.name.Agent
          ].create(newObj, {
            transaction: t,
          });
          const signData = {
            id: insertResult.getDataValue('id'),
            address: insertResult.getDataValue('address'),
          };
          newObj.signData = JSON.stringify(signData);

          const updateResult: any = await modelModule[
            SeqModel.name.Agent
          ].update(newObj, {
            where: {
              id: insertResult.getDataValue('id'),
            },
            fields: ['signData'],
            transaction: t,
          });

          if (newObj.agentType == AgentType.MST) {
            newObj.id = insertResult.getDataValue('id');

            logger.info('agent id: ', newObj.id);

            // const checkCustomerExist = await modelModule[
            //   SeqModel.name.Customer
            // ].findOne({
            //   transaction: t,
            //   where: {
            //     address: newObj.address,
            //   },
            // });

            // if (checkCustomerExist) {
            //   resp = await this.updateMstCustomer(newObj, t);
            // } else {

            // }
            resp = await this.createMstCustomer(newObj, t);
          } else {
            resp.success = true;
            resp.msg = `New agent is created. New record id :(${insertResult.id})`;
            logger.info(funcMsg + ' - success ', { message: resp.msg });
          }
          // Also add newly agent to contract

          if (resp.success) {
            const abiItems: AbiItem[] = IAgentDataArtifact as AbiItem[];
            const contractAddr =
              globalVar.foundationConfig.smartcontract.MappedSwap[
                'OwnedUpgradeableProxy<AgentData>'
              ].address;
            const httpProvider = new Web3.providers.HttpProvider(
              globalVar.foundationConfig.rpcHostHttp,
              foundationConst.web3HttpProviderOption,
            );
            //eth client based on env (Dev/Testnet)

            const ethClient = new EthClient(
              httpProvider,
              globalVar.foundationConfig.chainId,
            );
            const isListening =
              await ethClient.web3Client.eth.net.isListening();
            const chainWebSocketConnected = httpProvider.connected;
            if (chainWebSocketConnected) {
              const contract = new ethClient.web3Client.eth.Contract(
                abiItems,
                contractAddr,
              ) as any;

              const agentDataContract: IAgentData = contract as any;
              const sideChainWeb3Account =
                ethClient.web3Client.eth.accounts.privateKeyToAccount(
                  encryptionKey!,
                );
              const nonce = await ethClient.web3Client.eth.getTransactionCount(
                sideChainWeb3Account.address,
                'pending',
              );

              const valString = Web3.utils.toHex(newObj.signData);
              const tx = {
                // this could be provider.addresses[0] if it exists
                from: sideChainWeb3Account!.address,
                to: agentDataContract.options.address,
                gasPrice: '0x8F0D1800',
                nonce: nonce,
                // optional if you want to specify the gas limit
                gas: '0xAA690',
                // optional if you are invoking say a payable function
                value: '0x00',
                data: agentDataContract.methods
                  .insertData(signData.address, valString)
                  .encodeABI(),
                // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
              };
              const signTxResult: SignedTransaction =
                await sideChainWeb3Account!.signTransaction(tx);
              const result = await ethClient.web3Client.eth
                .sendSignedTransaction(signTxResult.rawTransaction as string)
                .on('transactionHash', function (transactionHash) {
                  logger.info(`TxHash:${transactionHash}`);
                })
                .on('receipt', function (receipt) {
                  logger.info(`Receipt:${JSON.stringify(receipt)}`);
                  if (receipt.status) {
                    logger.info(
                      `[AgentData][InsertData] - success, txHash :${receipt.transactionHash}`,
                    );
                  } else {
                    logger.error(
                      `[AgentData][InsertData] - fail, txHash :${receipt.transactionHash}`,
                    );
                  }
                });
              /*
              .on('error', function (error) {
                logger.error(`[AgentData][InsertData] - fail`);
                throw error;
              });*/
            } else {
              logger.error(`[AgentData][InsertData] - websocket not connected`);
            }
          }
        } else {
          if (!checkParentAgentRateResult.success) {
            resp = checkParentAgentRateResult;
          }
          if (!checkAgentLevelResult.success) {
            resp = checkAgentLevelResult;
          }
          logger.info(funcMsg + ' - fail ', { message: resp.msg });
        }
      }
      await t.commit(); //Transaction must be commited or rollback, otherwise sequlize connection to DB will be locked
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Insert user fail :' + e,
      );
      await t.rollback();
    }
    return resp;
  }

  async login(
    searchParams?: any,
    addressFromSignature?: any,
    isReadOnly?: any,
    byPass?: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[AgentService][login](obj.email : ${searchParams.email} obj.password: )`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    const result = await modelModule[SeqModel.name.Agent].findOne({
      where: {
        email: searchParams.email,
        password: searchParams.password,
      },
    });
    if (!result) {
      resp = new WarningResponseBase(
        ServerReturnCode.RecordNotFound,
        'Agent record not found',
      );
      logger.info(funcMsg + ' - fail ', { message: resp.msg });
    } else {
      if (
        addressFromSignature == result.getDataValue('address') ||
        isReadOnly ||
        byPass
      ) {
        const token = await signToken({
          loginId: result.getDataValue('id'),
          id: result.getDataValue('id'),
          name: result.getDataValue('name'),
          type: 'Agent',
          status: result.getDataValue('status'),
          parentAgentId: result.getDataValue('parentAgentId'),
          contractStatus: result.getDataValue('contractStatus'),
          role: result.getDataValue('role'),
          address: result.getDataValue('address'),
          agentType: result.getDataValue('agentType'),
          allowViewAgent: result.getDataValue('allowViewAgent')
            ? result.getDataValue('allowViewAgent')
            : false,
          isReadOnly: isReadOnly,
        });
        resp.data = {
          token: token,
          loginId: result.getDataValue('id'),
          id: result.getDataValue('id'),
        };
        resp.success = true;
        resp.msg = 'Record found';
        await this.connectedWalletService.create({
          id: null,
          address: result.getDataValue('address'),
          connectedType: ConnectedType.agent,
          createdDate: new Date(),
        });
        await logger.info(funcMsg, { message: ' - success' });
      } else {
        resp.msg = 'Signature mismatched';
        resp.success = false;
        resp.respType = 'warning';

        logger.info(resp.msg);
      }
    }
    return resp;
  }

  async getNoOfNodes(id: Mixed): Promise<any> {
    const funcMsg = `[AgentService][getNoOfNodes](Agent id : ${id})`;
    const returnData = { agents: [], customers: [] };
    const agents = await modelModule[SeqModel.name.Agent].findAll({
      attributes: [[Sequelize.fn('count', Sequelize.col('id')), 'count']],
      where: {
        parentAgentId: id.toString(),
      },
    });
    const customers = await modelModule[SeqModel.name.Customer].findAll({
      attributes: [[Sequelize.fn('count', Sequelize.col('id')), 'count']],
      where: {
        agentId: id.toString(),
      },
    });

    console.log(JSON.parse(JSON.stringify(customers))[0].count);
    console.log(JSON.parse(JSON.stringify(agents))[0].count);
    returnData.agents = JSON.parse(JSON.stringify(agents))[0].count;
    returnData.customers = JSON.parse(JSON.stringify(customers))[0].count;
    return returnData;
  }

  async getSubAgent(query: any, jwt: any): Promise<any> {
    const funcMsg = `[AgentService][getSubAgent](Agent id : ${query.agentId})`;
    logger.info(funcMsg, { message: ' - start' });
    const whereStatement: any = {};
    let agents;

    const checkAgentInParentTreeResult = await this.checkAgentInParentTree(
      query.agentId,
      jwt.id,
    );

    if (checkAgentInParentTreeResult.success) {
      sequelizeHelper.where.pushExactItemIfNotNull(
        whereStatement,
        'parent_agent_id',
        query.agentId,
      );
      agents = await modelModule[SeqModel.name.Agent].findAll({
        where: whereStatement,
        limit: query.recordPerPage,
        offset: query.pageNo * query.recordPerPage,
        attributes: ['id', 'name', 'address'],
        include: [
          {
            separate: true,
            model: modelModule[SeqModel.name.Agent],
            as: 'children',
            attributes: ['id', 'name', 'address'],
          },
        ],
      });
    } else {
      agents = checkAgentInParentTreeResult;
    }
    return agents;
  }

  /**
   * Check if parent agent rate is less than newObj obj' s rate, rate means interestPercentage or feePercentage
   * @param newObj the agent record waiting to be created
   * 1. Find out agent record in database, using newObj.parentAgentId
   * 2. The parent agent record must be active
   * 3. Return Success
   *    - If the agent record is fixed level, simply return success
   *    - If newObj' s interest percentage and fee percentage both less than parent interest percentage and fee percentage respectively
   * 4. Return False
   *    - If any newObj obj' s interest percentage or fee percentage is larger than parent interest percentage or fee percentage
   */
  async checkParentAgentRate(newObj: DBModel.Agent): Promise<ResponseBase> {
    const funcMsg = `[AgentService][checkParentAgentRate](obj.id : ${
      newObj.id ? newObj.id : newObj.parentAgentId
    })`;
    logger.info(funcMsg, { message: ' - start' });
    const resp = new ResponseBase();
    resp.success = true;
    // let returnValue = true;

    try {
      const getParentAgentResult = await modelModule[
        SeqModel.name.Agent
      ].findOne({
        where: {
          id: newObj.parentAgentId?.toString(),
          status: AgentStatus.StatusActive,
        },
      });

      const parentAgentType = getParentAgentResult?.getDataValue('agentType');

      if (parentAgentType == AgentType.FixedLevel) {
        logger.info(funcMsg, { message: 'account is Fixed Level' });
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

  async getAgentChangedRate(newObj: DBModel.Agent): Promise<ResponseBase> {
    const funcMsg = `[AgentService][getAgentChangedRate](obj.id : ${newObj.id?.toString()})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();

    try {
      const getOriginalAgentResult = await modelModule[
        SeqModel.name.Agent
      ].findOne({
        where: {
          id: newObj.id?.toString(),
          status: AgentStatus.StatusActive,
        },
      });

      const originalFeePercentage =
        getOriginalAgentResult?.getDataValue('feePercentage');
      const originalInterestPercentage =
        getOriginalAgentResult?.getDataValue('interestPercentage');

      const changedFeePercentage = newObj.feePercentage - originalFeePercentage;
      const changedInterestPercentage =
        newObj.interestPercentage - originalInterestPercentage;

      if (changedFeePercentage < 0 || changedInterestPercentage < 0) {
        resp = await this.checkAllowAgentChangeRate(newObj);
      } else {
        resp.success = true;
        logger.info(funcMsg, { message: ' - success' });
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
    }

    return resp;
  }

  async checkAllowAgentChangeRate(
    newObj: DBModel.Agent,
  ): Promise<ResponseBase> {
    const funcMsg = `[AgentService][getAgentChangedRate](obj.id : ${newObj.id?.toString()})`;
    logger.info(funcMsg, { message: ' - start' });
    const resp = new ResponseBase();
    resp.success = true;

    try {
      const getChildMaxFeeResult = await modelModule[
        SeqModel.name.Agent
      ].findOne({
        attributes: [
          [
            Sequelize.fn('max', Sequelize.col('fee_percentage')),
            'fee_percentage',
          ],
        ],
        where: {
          parentAgentId: newObj.id?.toString(),
          status: AgentStatus.StatusActive,
        },
      });
      const getChildMaxInterestResult = await modelModule[
        SeqModel.name.Agent
      ].findOne({
        attributes: [
          [
            Sequelize.fn('max', Sequelize.col('interest_percentage')),
            'interest_percentage',
          ],
        ],
        where: {
          parentAgentId: newObj.id?.toString(),
          status: AgentStatus.StatusActive,
        },
      });

      const maxChildFee = getChildMaxFeeResult?.getDataValue('fee_percentage');
      // prettier-ignore
      const maxChildInterest = getChildMaxInterestResult?.getDataValue('interest_percentage');

      if (maxChildFee && newObj.feePercentage < maxChildFee) {
        resp.success = false;
        resp.msg = 'Fee percentage must not less then child agent';
        resp.returnCode = ServerReturnCode.InternalServerError;
        resp.respType = 'warning';

        logger.info(resp.msg);
      }

      if (maxChildInterest && newObj.interestPercentage < maxChildInterest) {
        resp.success = false;
        resp.msg = 'Interest percentage must not less then child agent';
        resp.returnCode = ServerReturnCode.InternalServerError;
        resp.respType = 'warning';

        logger.info(resp.msg);
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);

      resp.success = false;
      resp.msg = 'Interest percentage must not less then child agent';
      resp.returnCode = ServerReturnCode.InternalServerError;
      resp.respType = 'warning';
    }

    logger.info(funcMsg, { message: ' - success' });
    return resp;
  }

  async changeRole(id: string, agentId: string): Promise<ResponseBase> {
    const funcMsg = `[AgentService][rootAgentChangeUser](id: ${id} agentId : ${agentId})`;
    let resp = new ResponseBase();

    const checkAgentInParentTreeResult = await this.checkAgentInParentTree(
      agentId,
      id,
    );

    if (checkAgentInParentTreeResult.success) {
      let checkIsRootAgentResult = await modelModule[
        SeqModel.name.Agent
      ].findOne({
        where: {
          id: id,
          parentAgentId: null,
        },
      });

      if (!checkIsRootAgentResult) {
        checkIsRootAgentResult = await modelModule[SeqModel.name.Agent].findOne(
          {
            where: {
              id: id,
              agentType: AgentType.MST,
            },
          },
        );
      }

      if (!checkIsRootAgentResult) {
        resp.success = false;
        resp.msg =
          'Not Root Agent or MST Agent!! Only Root Agent can change role!';
        resp.respType = 'warning';

        logger.info(resp.msg);
      } else {
        const result = await modelModule[SeqModel.name.Agent].findOne({
          where: {
            id: agentId,
          },
        });

        if (!result) {
          resp = new WarningResponseBase(
            ServerReturnCode.RecordNotFound,
            'Agent record not found',
          );
          logger.info(funcMsg + ' - fail ', { message: resp.msg });
        } else {
          const token = await signToken({
            loginId: id,
            id: result.getDataValue('id'),
            name: result.getDataValue('name'),
            type: 'Agent',
            status: result.getDataValue('status'),
            parentAgentId: result.getDataValue('parentAgentId'),
            contractStatus: result.getDataValue('contractStatus'),
            address: result.getDataValue('address'),
          });
          resp.data = {
            token: token,
            loginId: id,
            id: result.getDataValue('id'),
          };
          resp.success = true;
          resp.msg = 'Record found';

          logger.info(funcMsg, { message: ' - success' });
        }
      }
    } else {
      resp = checkAgentInParentTreeResult;
    }

    return resp;
  }

  // async agentTree(query: any): Promise<{
  //   rows: Model<any, any>[];
  //   count: number;
  // }> {
  //   const results: any = await modelModule[SeqModel.name.Agent].findAndCountAll(
  //     {
  //       include: [
  //         {
  //           model: modelModule[SeqModel.name.Agent],
  //           as: 'agent',
  //         },
  //       ],
  //       // where: whereStatement,
  //       limit: query.recordPerPage,
  //       offset: query.pageNo * query.recordPerPage,
  //       attributes: { exclude: ['password'] },
  //       order: [['id', 'DESC']],
  //     },
  //   );
  //   return results;
  // }

  async genReferralCode(
    id: string,
    // interestPercentage: number,
    // feePercentage: number,
    obj: DBModel.ReferralCode,
  ): Promise<ResponseBase> {
    const funcMsg = `[AgentService][genReferralCode](id: ${id} agentId : ${id})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    const t = await seq.sequelize.transaction();
    const dateNow = new Date();
    const tomorrow = new Date(
      dateNow.getTime() + 1000 * 60 * 60 * 24,
    ).toDateString();

    if (!obj.expiryDate) {
      obj.expiryDate = new Date(tomorrow);
    }
    const expiryDate = new Date(obj.expiryDate);
    // get total seconds between the times
    const delta = Math.abs(expiryDate.valueOf() - dateNow.valueOf()) / 1000;
    // calculate (and subtract) whole days
    const dayDiff = Math.ceil(delta / 86400);

    try {
      const recordInDb = await modelModule[SeqModel.name.Agent].findOne({
        where: {
          id: id,
        },
        transaction: t,
      });

      if (recordInDb) {
        obj.agentId = id;
        obj.isUsed = false;
        obj.codeStatus = ReferralCodeCodeStatus.StatusActive;
        obj.createdDate = dateNow;
        obj.createdById = id;
        obj.lastModifiedDate = dateNow;
        obj.lastModifiedById = id;
        obj.status = ReferralCodeStatus.StatusActive;

        const parentAgentId = recordInDb.getDataValue('parentAgentId');
        if (parentAgentId == null) {
          if (!obj.agentType && obj.agentType != 0) {
            obj.agentType = AgentType.FixedLevel;
          }
        }

        const agentObj: DBModel.Agent = new DBModel.Agent();
        agentObj.parentAgentId = obj.agentId;
        agentObj.interestPercentage = Number(obj.interestPercentage.toString());
        agentObj.feePercentage = Number(obj.feePercentage.toString());

        let checkAgentLevelResult: any = {};
        if (parentAgentId) {
          checkAgentLevelResult = await this.checkAgentLevel(parentAgentId);
        } else {
          checkAgentLevelResult['success'] = true;
        }
        const checkParentAgentRateResult = await this.checkParentAgentRate(
          agentObj,
        );

        if (
          checkParentAgentRateResult.success &&
          checkAgentLevelResult.success
        ) {
          if (obj.agentType == AgentType.FixedLevel) {
            const fixedLevelObj = await this.getFixedLevelPercentage(
              obj.agentId!,
              obj.agentType,
            );

            if (fixedLevelObj.success) {
              obj.feePercentage = fixedLevelObj.data['feePercentage'];
              obj.interestPercentage = fixedLevelObj.data['interestPercentage'];
            }
          }

          let hashed: any;
          if (obj.type == ReferralCodeType.ForeverUse) {
            hashed = await signFundingCode({}, null);
            obj.expiryDate = null;
          } else {
            hashed = await signFundingCode({}, dayDiff + 'd');
          }

          if (hashed) {
            const referralCode: string = hashed.substring(
              hashed.indexOf('.') + 1,
              hashed.length,
            );
            obj.referralCode = referralCode;
            obj.hashString = hashed.substring(0, hashed.indexOf('.'));

            const insertResult: any = await modelModule[
              SeqModel.name.ReferralCode
            ].create(obj, {
              transaction: t,
            });

            resp.success = true;
            resp.data = referralCode;
            resp.msg = 'Generate referral code successs';
            logger.info('Generate referral code successs');
            logger.info(hashed);
          } else {
            resp = new WarningResponseBase(
              ServerReturnCode.RecordNotFound,
              'failed to gen referral code',
            );

            logger.info(funcMsg + ' - fail ', { message: resp.msg });
          }
        } else {
          logger.info(funcMsg + ' - fail ', { message: resp.msg });
        }
      } else {
        resp = new WarningResponseBase(
          ServerReturnCode.UniqueViolationError,
          'Agent Record not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      }

      t.commit();
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'generate funding code fail :' + e,
      );

      await t.rollback();
    }

    return resp;
  }

  async getAllReferralCode(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const funcMsg = `[AgentService][genReferralCode](agentId : ${query.agentId})`;
    logger.info(funcMsg, { message: ' - start' });

    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'status',
      ReferralCodeStatus.StatusActive,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'agentId',
      query.agentId,
    );

    const results: any = await modelModule[
      SeqModel.name.ReferralCode
    ].findAndCountAll({
      include: [
        {
          attributes: ['address'],
          model: modelModule[SeqModel.name.Agent],
          where: Sequelize.literal(
            '"t_decats_referral_code"."type" = ' +
              "'" +
              ReferralCodeType.OneTimeUse.toString() +
              "'",
          ),
          required: false,
          as: 'agent',
        },
      ],
      raw: true,
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['created_date', 'DESC']],
    });

    logger.info('Get All referral code successs');
    return results;
  }
  /**
   * Register with referral code, the success of register depends on newObj' s parent level and sub agents, as well as last level
   * 1. Validate funding code by jwt
   * 2. If step(1) success, find out the referral code record in database
   * 3. Base on the found referral code record, get its agent_id, as the registered user parent_agent_id
   * 4. By default, the new registered agent id will have
   * {
   *    parent_agent_id      => found referral_code_record.agent_id
   *    interest_percentage  => found referral_code_record.interest_percentage
   *    fee_percentage       => found referral_code_record.fee_percentage
   *    agent_type           => found referral_code_record.agent_type
   * }
   * 5. If the referral code is one time used only, check if it is used or not
   * 6. If the refferal code is not one time use only, or the one time used hasn' t used, the referral code is usable
   * 7. Check if the newly created obj interest percentage and fee percentage is valid
   * 8. Check if parent agent level is last level or reach max. number of sub agents
   * 9. Check if the newly created obj has duplicate record in database
   * 10. Based on referral_code_record, get newObj's level, feePercentage and interestPercentage from db and server config
   * 11. Create agent record
   * 12. Update sign data in agent record
   * 13. Update referreal code to used if not used
   * 14. Call contract to insert sign data into contract
   */
  async registerWithReferralCode(
    newObj: DBModel.Agent,
    referralCode: string,
  ): Promise<ResponseBase> {
    const funcMsg = `[AgentService][registerWithReferralCode](referralCode : ${referralCode})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    const t = await seq.sequelize.transaction();
    const dateNow = new Date();

    try {
      resp = await validateFundingCode(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + referralCode,
      );

      if (resp.success) {
        const recordInDb = await modelModule[
          SeqModel.name.ReferralCode
        ].findOne({
          where: {
            referralCode: referralCode,
          },
          transaction: t,
        });

        if (recordInDb) {
          newObj.parentAgentId = recordInDb.getDataValue('agentId');
          newObj.interestPercentage = 0;
          newObj.feePercentage = 0;

          const fundingCodeType = recordInDb.getDataValue('type');
          let checkIsUsed = false;
          if (fundingCodeType == ReferralCodeType.OneTimeUse) {
            checkIsUsed = recordInDb?.getDataValue('isUsed');
          }
          // prettier-ignore
          // Check newObj's interest and fee percentage not exceeds parent interest and fee percentage
          const checkParentAgentRateResult = await this.checkParentAgentRate(newObj);
          // Check parent parent level is not last level or exceeds max. number of sub agents
          const checkAgentLevelResult = await this.checkAgentLevel(
            recordInDb.getDataValue('agentId'),
          );
          //If level, rate and refferal code are all valid
          if (
            !checkIsUsed &&
            checkParentAgentRateResult.success &&
            checkAgentLevelResult.success
          ) {
            newObj.name = recordInDb.getDataValue('agentName');
            newObj.referralCodeId = recordInDb.getDataValue('id');
            newObj.createdById = recordInDb.getDataValue('agentId');
            newObj.lastModifiedById = recordInDb.getDataValue('agentId');
            newObj.status = AgentStatus.StatusActive;

            if (!newObj.name) {
              newObj.name = '';
            }
            //Validate duplicate agent address
            const recordAgentInDb = await modelModule[
              SeqModel.name.Agent
            ].findOne({
              where: {
                address: newObj.address,
                status: AgentStatus.StatusActive,
              },
            });

            if (recordAgentInDb) {
              await t.rollback();

              resp = new WarningResponseBase(
                ServerReturnCode.UniqueViolationError,
                'Agent already exist, please use correct address.',
              );
              logger.info(funcMsg + ' - fail ', { message: resp.msg });
            } else {
              newObj.agentType = recordInDb.getDataValue('agentType');
              newObj.feePercentage = recordInDb.getDataValue('feePercentage');
              newObj.interestPercentage =
                recordInDb.getDataValue('interestPercentage');

              const fixedLevelObj = await this.getFixedLevelPercentage(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                newObj.parentAgentId!,
                recordInDb.getDataValue('agentType'),
              );
              if (fixedLevelObj.success) {
                if (fixedLevelObj.data['agentType']) {
                  newObj.agentType = fixedLevelObj.data['agentType'];
                }
                if (fixedLevelObj.data['agentLevel']) {
                  newObj.agentLevel = fixedLevelObj.data['agentLevel'];
                }
                if (fixedLevelObj.data['feePercentage']) {
                  newObj.feePercentage = fixedLevelObj.data['feePercentage'];
                }
                if (fixedLevelObj.data['interestPercentage']) {
                  newObj.interestPercentage =
                    fixedLevelObj.data['interestPercentage'];
                }
              }

              if (newObj.agentType == AgentType.MST) {
                newObj.interestPercentage = 0;
                newObj.feePercentage = 0;
              }

              const insertAgentResult = await modelModule[
                SeqModel.name.Agent
              ].create(newObj, {
                transaction: t,
              });

              const id = insertAgentResult.getDataValue('id');
              const signData = {
                id: id,
                address: insertAgentResult.getDataValue('address'),
              };
              const agentObj: DBModel.Agent = new DBModel.Agent();
              agentObj.createdById = id;
              agentObj.createdDate = dateNow;
              agentObj.lastModifiedById = id;
              agentObj.lastModifiedDate = dateNow;
              agentObj.signData = JSON.stringify(signData);
              const updateAgentResult: any = await modelModule[
                SeqModel.name.Agent
              ].update(agentObj, {
                fields: [
                  'createdDate',
                  'createdById',
                  'lastModifedDate',
                  'lastModifiedById',
                  'signData',
                ],
                where: {
                  id: id,
                },
                transaction: t,
              });

              if (fundingCodeType == ReferralCodeType.OneTimeUse) {
                const referralCodeObj: DBModel.ReferralCode =
                  new DBModel.ReferralCode();
                referralCodeObj.isUsed = true;
                referralCodeObj.lastModifiedDate = dateNow;
                referralCodeObj.lastModifiedById = id;

                const updateResult: any = await modelModule[
                  SeqModel.name.ReferralCode
                ].update(referralCodeObj, {
                  transaction: t,
                  where: {
                    id: newObj.referralCodeId?.toString(),
                    codeStatus: ReferralCodeCodeStatus.StatusActive,
                    status: ReferralCodeStatus.StatusActive,
                    isUsed: false,
                  },
                  fields: ['isUsed', 'lastModifiedDate', 'lastModifiedById'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
                });
              }

              // Also add newly agent to contract

              const abiItems: AbiItem[] = IAgentDataArtifact as AbiItem[];
              const contractAddr =
                globalVar.foundationConfig.smartcontract.MappedSwap[
                  'OwnedUpgradeableProxy<AgentData>'
                ].address;
              const httpProvider = new Web3.providers.HttpProvider(
                globalVar.foundationConfig.rpcHostHttp,
                foundationConst.web3HttpProviderOption,
              );
              //eth client based on env (Dev/Testnet)

              const ethClient = new EthClient(
                httpProvider,
                globalVar.foundationConfig.chainId,
              );
              const isListening =
                await ethClient.web3Client.eth.net.isListening();
              const chainWebSocketConnected = httpProvider.connected;
              if (chainWebSocketConnected) {
                const contract = new ethClient.web3Client.eth.Contract(
                  abiItems,
                  contractAddr,
                ) as any;

                const agentDataContract: IAgentData = contract as any;
                const sideChainWeb3Account =
                  ethClient.web3Client.eth.accounts.privateKeyToAccount(
                    encryptionKey!,
                  );
                const nonce =
                  await ethClient.web3Client.eth.getTransactionCount(
                    sideChainWeb3Account.address,
                    'pending',
                  );

                const valString = Web3.utils.toHex(agentObj.signData);
                const tx = {
                  // this could be provider.addresses[0] if it exists
                  from: sideChainWeb3Account!.address,
                  to: agentDataContract.options.address,
                  gasPrice: '0x8F0D1800',
                  nonce: nonce,
                  // optional if you want to specify the gas limit
                  gas: '0xAA690',
                  // optional if you are invoking say a payable function
                  value: '0x00',
                  data: agentDataContract.methods
                    .insertData(signData.address, valString)
                    .encodeABI(),
                  // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
                };
                const signTxResult: SignedTransaction =
                  await sideChainWeb3Account!.signTransaction(tx);
                const result = await ethClient.web3Client.eth
                  .sendSignedTransaction(signTxResult.rawTransaction as string)
                  .on('transactionHash', function (transactionHash) {
                    logger.info(`TxHash:${transactionHash}`);
                  })
                  .on('receipt', function (receipt) {
                    logger.info(`Receipt:${JSON.stringify(receipt)}`);
                    if (receipt.status) {
                      logger.info(
                        `[AgentData][InsertData] - success, txHash :${receipt.transactionHash}`,
                      );
                    } else {
                      logger.error(
                        `[AgentData][InsertData] - fail, txHash :${receipt.transactionHash}`,
                      );
                    }
                  });
                /*
                  .on('error', function (error) {
                    logger.error(`[AgentData][InsertData] - fail`);
                    throw error;
                  });*/
              } else {
                logger.error(
                  `[AgentData][InsertData] - websocket not connected`,
                );
              }

              await t.commit();

              resp.success = true;
              resp.msg = 'Create Agent with refferal Code successs';
              logger.info(resp.msg);
            }
          } else {
            if (!checkIsUsed) {
              resp = new WarningResponseBase(
                ServerReturnCode.RecordDuplicated,
                'Referral code is already used',
              );
              logger.info(funcMsg + ' - fail ');
            }
            if (!checkParentAgentRateResult.success) {
              resp = checkParentAgentRateResult;
            }
            if (!checkAgentLevelResult.success) {
              resp = checkAgentLevelResult;
            }
          }
        } else {
          await t.rollback();

          resp = new WarningResponseBase(
            ServerReturnCode.UniqueViolationError,
            'Referral Code not found',
          );
          logger.info(funcMsg + ' - fail ', { message: resp.msg });
        }
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'register with referral code fail :' + e,
      );

      await t.rollback();
    }

    logger.info(funcMsg, { message: ' - end' });
    return resp;
  }
  /**
   * Validate newObj.level based on parent agent level, there is limit on how many sub agents an agent can have
   * @param newObj the agent record waiting to be created
   * 1. Find out agent record in database, using newObj.parentAgentId
   * 2. The parent agent record must be active
   * 3. Return Success
   *    - If the parent agent record is not fixed level
   *    - If the parent agent record is fixed level and its no. of sub agents is less than config.memberOnEachLevel
   *    - If the parent agent record is fixed level and parent agent is not at last level
   * 4. Return False
   *    - If the parent agent record is fixed level and parent agent is at last level
   *    - If the parent agent record is fixed level and its no. of sub agents is greater than config.memberOnEachLevel
   */
  async checkAgentLevel(parentAgentId: Mixed): Promise<ResponseBase> {
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
              'Parent agent cannot add subagent. Parent agent current level: ' +
              parentAgentLevel.toString();
            resp.returnCode = ServerReturnCode.InternalServerError;
            resp.respType = 'warning';

            logger.info(resp.msg);
          } else {
            const countTotolSubAgentResult = await modelModule[
              SeqModel.name.Agent
            ].findAll({
              attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
              ],
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
                globalVar.agentConfig.FixedAgentLevel.memberOnEachLevel.toString(),
              )
            ) {
              resp.success = false;
              resp.msg =
                'Parent agent already reach maximum number of sub agent';
              resp.returnCode = ServerReturnCode.InternalServerError;
              resp.respType = 'warning';

              logger.info(resp.msg);
            }

            logger.info(funcMsg, { message: ' - success' });
          }
        } else {
          logger.info('Account type is not Fixed Level');
        }
      } else {
        logger.info(
          `Cannot find parent agent, parent agent id: ${parentAgentId.toString()}`,
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

  /**
   * Get interest, fee percentage, level based on parentAgentId and agentType
   * @param parentAgentId parentAgentId
   * @param agentType agentType
   * 1. Find out agent record in database, using newObj.parentAgentId
   * 3. Return Success
   *    - If the parent agent record is fixed level
   *    - If parameter agentType is fixed level
   * 3.1 Return parent agent level+1, and related agent fee and intersest percentage base on level
   * 4. Return False
   *    - If the parent agent record is not fixed level
   */
  async getFixedLevelPercentage(
    parentAgentId: Mixed,
    agentType?: Mixed | null,
  ): Promise<ResponseBase> {
    const funcMsg = `[AgentService][getFixedLevelPercentage](parentAgentId: ${parentAgentId}), agentType: ${agentType}`;
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
        const parentAgentType =
          getParentAgentIdResult.getDataValue('agentType');

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
            globalVar.agentConfig.FixedAgentLevel.feeLevel[
              'level' + agentLevel
            ];
          returnObj['interestPercentage'] =
            globalVar.agentConfig.FixedAgentLevel.interestLevel[
              'level' + agentLevel
            ];

          resp.success = true;
          resp.data = returnObj;

          logger.info(funcMsg, { message: ' - success' });
        } else {
          logger.info('agent is not fixed level');
        }
      } else {
        logger.info(
          `Cannot find parent agent, parent agent id: ${parentAgentId.toString()}`,
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

  async encryption(
    obj: string,
    theKey: string,
    theIv: string,
  ): Promise<ResponseBase> {
    logger.info('process.argv.length: ' + process.argv.length);
    logger.info('process.argv: ' + process.argv);
    logger.info('process.argv[2]: ' + process.argv[2]);
    logger.info('process.argv[3]: ' + process.argv[3]);

    const funcMsg = `[AgentService][encryption](obj: ${obj}`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();

    try {
      const encryptionType = 'aes-256-cbc';
      const encryptionEncoding = 'base64';
      const bufferEncryption = 'utf-8';

      // const aesKey = process.argv[2];
      // const aesIV = process.argv[3];
      let aesKey = '';
      if (theKey) {
        aesKey = theKey;
      } else {
        aesKey = process.argv[2];
      }
      let aesIV = '';
      if (theIv) {
        aesIV = theIv;
      } else {
        aesIV = process.argv[3];
      }

      const val = JSON.stringify(obj);
      const key = Buffer.from(aesKey, bufferEncryption);
      const iv = Buffer.from(aesIV, bufferEncryption);
      const cipher = crypto.createCipheriv(encryptionType, key, iv);
      let encrypted = cipher.update(val, bufferEncryption, encryptionEncoding);
      encrypted += cipher.final(encryptionEncoding);

      resp.success = true;
      resp.data = encrypted;
      resp.msg = 'Encryption successs';
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Encryption fail :' + e,
      );
    }

    return resp;
  }

  async decryption(obj: string): Promise<ResponseBase> {
    logger.info('process.argv.length: ' + process.argv.length);
    logger.info('process.argv: ' + process.argv);
    logger.info('process.argv[2]: ' + process.argv[2]);
    logger.info('process.argv[3]: ' + process.argv[3]);

    const funcMsg = `[AgentService][decryption](obj: ${obj}`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();

    try {
      const decryptionResult = await decrypt(obj);

      resp.success = true;
      resp.data = decryptionResult;
      resp.msg = 'Decryption success';
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Decryption fail :' + e,
      );
    }

    return resp;
  }

  async updateSignDataOfOldUser(id?: Mixed): Promise<ResponseBase> {
    const funcMsg = `[AgentService][updateSignDataOfOldUser]`;

    logger.info(funcMsg, { message: ' - start' });
    const resp = new ResponseBase();
    resp.success = false;
    let signData: any = {
      id: null,
      address: null,
    };
    let noSignDataAgents: any = await modelModule[
      SeqModel.name.Agent
    ].findAll();
    if (noSignDataAgents) {
      if (id) {
        noSignDataAgents = noSignDataAgents.filter((x) => x.id == id);
      }
      for (let i = 0; i < noSignDataAgents.length; i++) {
        const t = await seq.sequelize.transaction();
        try {
          const agent: DBModel.Agent = JSON.parse(
            JSON.stringify(noSignDataAgents[i]),
          );
          signData = {
            id: agent.id,
            address: agent.address,
          };
          agent.signData = JSON.stringify(signData);
          const updateResult: any = await modelModule[
            SeqModel.name.Agent
          ].update(agent, {
            where: {
              id: signData.id as string,
            },
            fields: ['signData'],
            transaction: t,
          });
          if (!updateResult[0]) {
            throw new Error('Cannot update signData');
          }
          resp.success = true;
          resp.msg = `New agent is created. Update id :(${signData.id}  - ${signData.address})`;
          logger.info(funcMsg + ' - success ', { message: resp.msg });
          // Also add newly agent to contract
          const abiItems: AbiItem[] = IAgentDataArtifact as AbiItem[];
          const contractAddr =
            globalVar.foundationConfig.smartcontract.MappedSwap[
              'OwnedUpgradeableProxy<AgentData>'
            ].address;
          const httpProvider = new Web3.providers.HttpProvider(
            globalVar.foundationConfig.rpcHostHttp,
            foundationConst.web3HttpProviderOption,
          );
          //eth client based on env (Dev/Testnet)
          const ethClient = new EthClient(
            httpProvider,
            globalVar.foundationConfig.chainId,
          );
          const isListening = await ethClient.web3Client.eth.net.isListening();
          const chainWebSocketConnected = httpProvider.connected;
          if (chainWebSocketConnected) {
            const contract = new ethClient.web3Client.eth.Contract(
              abiItems,
              contractAddr,
            ) as any;

            const agentDataContract: IAgentData = contract as any;
            const sideChainWeb3Account =
              ethClient.web3Client.eth.accounts.privateKeyToAccount(
                encryptionKey!,
              );
            const nonce = await ethClient.web3Client.eth.getTransactionCount(
              sideChainWeb3Account.address,
              'pending',
            );

            const valString = Web3.utils.toHex(agent.signData);
            const tx = {
              // this could be provider.addresses[0] if it exists
              from: sideChainWeb3Account!.address,
              to: agentDataContract.options.address,
              gasPrice: '0x8F0D1800',
              nonce: nonce,
              // optional if you want to specify the gas limit
              gas: '0xAA690',
              // optional if you are invoking say a payable function
              value: '0x00',
              data: agentDataContract.methods
                .updateData(signData.address, valString)
                .encodeABI(),
              // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
            };
            const signTxResult: SignedTransaction =
              await sideChainWeb3Account!.signTransaction(tx);
            const result = await ethClient.web3Client.eth
              .sendSignedTransaction(signTxResult.rawTransaction as string)
              .on('transactionHash', function (transactionHash) {
                logger.info(`TxHash:${transactionHash}`);
              })
              .on('receipt', async function (receipt) {
                logger.info(`Receipt:${JSON.stringify(receipt)}`);
                if (receipt.status) {
                  logger.info(
                    `[AgentData][updateSignDataOfOldUser] - success, txHash :${receipt.transactionHash}   [AgentId] ${signData.id} - ${signData.address}`,
                  );
                } else {
                  logger.error(
                    `[AgentData][updateSignDataOfOldUser] - fail, txHash :${receipt.transactionHash}     [AgentId] ${signData.id} - ${signData.address}`,
                  );
                }
              })
              .on('error', async function (error: any) {
                if (
                  error.receipt.revertReason ==
                  '0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001355706461746520746f2073616d65206461746100000000000000000000000000'
                ) {
                  logger.info(`Skipping ${signData.id} - ${signData.address}`);
                } else {
                  logger.error(`[AgentData][updateSignDataOfOldUser] - fail`);
                  if ((t as any).finished) {
                    await t.rollback();
                  }
                }
              });
          } else {
            logger.error(
              `[AgentData][updateSignDataOfOldUser] - websocket not connected`,
            );

            throw new Error(
              `[AgentData][updateSignDataOfOldUser] - websocket not connected`,
            );
          }
          await t.commit();
        } catch (e) {
          logger.error(
            funcMsg + `- fail [AgentId] ${signData.id} - ${signData.address}`,
          );
          logger.error(e);
          BlockChainHelper.logRevertReason(e, logger);
          resp.success = false;
          resp.msg = '';
          resp.returnCode = ServerReturnCode.InternalServerError;
          resp.respType = 'warning';
          await t.rollback();
        }
      }
    }

    return resp;
  }

  async verifySignDataOfOldUser(): Promise<ResponseBase> {
    const funcMsg = `[AgentService][verifySignDataOfOldUser]`;

    logger.info(funcMsg, { message: ' - start' });
    const resp = new ResponseBase();
    resp.success = false;
    let signData: any = {
      id: null,
      address: null,
    };
    const noSignDataAgents: any = await modelModule[
      SeqModel.name.Agent
    ].findAll();
    if (noSignDataAgents) {
      for (let i = 0; i < noSignDataAgents.length; i++) {
        const t = await seq.sequelize.transaction();
        try {
          const agent: DBModel.Agent = JSON.parse(
            JSON.stringify(noSignDataAgents[i]),
          );
          signData = {
            id: agent.id,
            address: agent.address,
          };
          agent.signData = JSON.stringify(signData);

          resp.success = true;
          resp.msg = `New agent is created. Update id :(${signData.id}  - ${signData.address})`;
          logger.info(funcMsg + ' - success ', { message: resp.msg });
          // Also add newly agent to contract
          const abiItems: AbiItem[] = IAgentDataArtifact as AbiItem[];
          const contractAddr =
            globalVar.foundationConfig.smartcontract.MappedSwap[
              'OwnedUpgradeableProxy<AgentData>'
            ].address;
          const httpProvider = new Web3.providers.HttpProvider(
            globalVar.foundationConfig.rpcHostHttp,
            foundationConst.web3HttpProviderOption,
          );
          //eth client based on env (Dev/Testnet)
          const ethClient = new EthClient(
            httpProvider,
            globalVar.foundationConfig.chainId,
          );
          const isListening = await ethClient.web3Client.eth.net.isListening();
          const chainWebSocketConnected = httpProvider.connected;
          if (chainWebSocketConnected) {
            const contract = new ethClient.web3Client.eth.Contract(
              abiItems,
              contractAddr,
            ) as any;

            const agentDataContract: IAgentData = contract as any;
            const sideChainWeb3Account =
              ethClient.web3Client.eth.accounts.privateKeyToAccount(
                encryptionKey!,
              );
            const nonce = await ethClient.web3Client.eth.getTransactionCount(
              sideChainWeb3Account.address,
              'pending',
            );

            const valString = Web3.utils.toHex(agent.signData);
            const tx = {
              // this could be provider.addresses[0] if it exists
              from: sideChainWeb3Account!.address,
              to: agentDataContract.options.address,
              gasPrice: '0x8F0D1800',
              nonce: nonce,
              // optional if you want to specify the gas limit
              gas: '0xAA690',
              // optional if you are invoking say a payable function
              value: '0x00',
              data: agentDataContract.methods
                .verifyData(signData.address, valString)
                .encodeABI(),
              // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
            };
            const signTxResult: SignedTransaction =
              await sideChainWeb3Account!.signTransaction(tx);
            const result = await ethClient.web3Client.eth
              .sendSignedTransaction(signTxResult.rawTransaction as string)
              .on('transactionHash', function (transactionHash) {
                logger.info(`TxHash:${transactionHash}`);
              })
              .on('receipt', function (receipt) {
                logger.info(`Receipt:${JSON.stringify(receipt)}`);
                if (receipt.status) {
                  logger.info(
                    `${funcMsg} - success, txHash :${receipt.transactionHash}   [AgentId] ${signData.id} - ${signData.address}`,
                  );
                } else {
                  logger.error(
                    `${funcMsg}  - fail, txHash :${receipt.transactionHash}     [AgentId] ${signData.id} - ${signData.address}`,
                  );
                }
              });
          } else {
            logger.error(`${funcMsg}  - websocket not connected`);

            throw new Error(`${funcMsg} - websocket not connected`);
          }
          await t.commit();
        } catch (e) {
          logger.error(
            funcMsg + `- fail [AgentId] ${signData.id} - ${signData.address}`,
          );
          logger.error(e);

          BlockChainHelper.logRevertReason(e, logger);
          resp.success = false;
          resp.msg = '';
          resp.returnCode = ServerReturnCode.InternalServerError;
          resp.respType = 'warning';
          await t.rollback();
        }
      }
    }

    return resp;
  }

  async approveSignDataOfOldUser(id: string): Promise<ResponseBase> {
    const funcMsg = `[AgentService][approveSignDataOfOldUser]`;

    logger.info(funcMsg, { message: ' - start' });
    const resp = new ResponseBase();
    resp.success = false;
    let signData: any = {
      id: null,
      address: null,
    };
    const noSignDataAgents: any = await modelModule[
      SeqModel.name.Agent
    ].findAll({ where: { id: id } });
    if (noSignDataAgents) {
      for (let i = 0; i < noSignDataAgents.length; i++) {
        const t = await seq.sequelize.transaction();
        try {
          const agent: DBModel.Agent = JSON.parse(
            JSON.stringify(noSignDataAgents[i]),
          );
          signData = {
            id: agent.id,
            address: agent.address,
          };
          agent.signData = JSON.stringify(signData);

          resp.success = true;
          resp.msg = `New agent is created. Update id :(${signData.id}  - ${signData.address})`;
          logger.info(funcMsg + ' - success ', { message: resp.msg });
          // Also add newly agent to contract
          const abiItems: AbiItem[] = IAgentDataArtifact as AbiItem[];
          const contractAddr =
            globalVar.foundationConfig.smartcontract.MappedSwap[
              'OwnedUpgradeableProxy<AgentData>'
            ].address;
          const httpProvider = new Web3.providers.HttpProvider(
            globalVar.foundationConfig.rpcHostHttp,
            foundationConst.web3HttpProviderOption,
          );
          //eth client based on env (Dev/Testnet)
          const ethClient = new EthClient(
            httpProvider,
            globalVar.foundationConfig.chainId,
          );
          const isListening = await ethClient.web3Client.eth.net.isListening();
          const chainWebSocketConnected = httpProvider.connected;
          if (chainWebSocketConnected) {
            const contract = new ethClient.web3Client.eth.Contract(
              abiItems,
              contractAddr,
            ) as any;

            const agentDataContract: IAgentData = contract as any;
            const sideChainWeb3Account =
              ethClient.web3Client.eth.accounts.privateKeyToAccount(
                encryptionKey!,
              );
            const nonce = await ethClient.web3Client.eth.getTransactionCount(
              sideChainWeb3Account.address,
              'pending',
            );

            const valString = Web3.utils.toHex(agent.signData);
            const tx = {
              // this could be provider.addresses[0] if it exists
              from: sideChainWeb3Account!.address,
              to: agentDataContract.options.address,
              gasPrice: '0x8F0D1800',
              nonce: nonce,
              // optional if you want to specify the gas limit
              gas: '0xAA690',
              // optional if you are invoking say a payable function
              value: '0x00',
              data: agentDataContract.methods
                .approveData(signData.address, valString)
                .encodeABI(),
              // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
            };
            const signTxResult: SignedTransaction =
              await sideChainWeb3Account!.signTransaction(tx);
            const result = await ethClient.web3Client.eth
              .sendSignedTransaction(signTxResult.rawTransaction as string)
              .on('transactionHash', function (transactionHash) {
                logger.info(`TxHash:${transactionHash}`);
              })
              .on('receipt', function (receipt) {
                logger.info(`Receipt:${JSON.stringify(receipt)}`);
                if (receipt.status) {
                  logger.info(
                    `${funcMsg}  - success, txHash :${receipt.transactionHash}   [AgentId] ${signData.id} - ${signData.address}`,
                  );
                } else {
                  logger.error(
                    `${funcMsg}  - fail, txHash :${receipt.transactionHash}     [AgentId] ${signData.id} - ${signData.address}`,
                  );
                }
              });
          } else {
            logger.error(`${funcMsg}  - websocket not connected`);

            throw new Error(`${funcMsg}  - websocket not connected`);
          }
          await t.commit();
        } catch (e) {
          logger.error(
            funcMsg + `- fail [AgentId] ${signData.id} - ${signData.address}`,
          );
          logger.error(e);

          BlockChainHelper.logRevertReason(e, logger);
          resp.success = false;
          resp.msg = '';
          resp.returnCode = ServerReturnCode.InternalServerError;
          resp.respType = 'warning';
          await t.rollback();
        }
      }
    }

    return resp;
  }

  async insertSignDataOfOldUser(): Promise<ResponseBase> {
    const funcMsg = `[AgentService][insertSignDataOfOldUser]`;

    logger.info(funcMsg, { message: ' - start' });
    const resp = new ResponseBase();
    resp.success = false;
    let signData: any = {
      id: null,
      address: null,
    };
    const noSignDataAgents: any = await modelModule[
      SeqModel.name.Agent
    ].findAll({
      where: {
        signData: null,
      },
    });
    if (noSignDataAgents) {
      for (let i = 0; i < noSignDataAgents.length; i++) {
        const t = await seq.sequelize.transaction();
        try {
          const agent: DBModel.Agent = JSON.parse(
            JSON.stringify(noSignDataAgents[i]),
          );
          signData = {
            id: agent.id,
            address: agent.address,
          };
          agent.signData = JSON.stringify(signData);
          const updateResult: any = await modelModule[
            SeqModel.name.Agent
          ].update(agent, {
            where: {
              id: signData.id as string,
            },
            fields: ['signData'],
            transaction: t,
          });
          if (!updateResult[0]) {
            throw new Error('Cannot update signData');
          }
          resp.success = true;
          resp.msg = `New agent is created. Update id :(${signData.id}  - ${signData.address})`;
          logger.info(funcMsg + ' - success ', { message: resp.msg });
          // Also add newly agent to contract
          const abiItems: AbiItem[] = IAgentDataArtifact as AbiItem[];
          const contractAddr =
            globalVar.foundationConfig.smartcontract.MappedSwap[
              'OwnedUpgradeableProxy<AgentData>'
            ].address;
          const httpProvider = new Web3.providers.HttpProvider(
            globalVar.foundationConfig.rpcHostHttp,
            foundationConst.web3HttpProviderOption,
          );
          //eth client based on env (Dev/Testnet)
          const ethClient = new EthClient(
            httpProvider,
            globalVar.foundationConfig.chainId,
          );
          const isListening = await ethClient.web3Client.eth.net.isListening();
          const chainWebSocketConnected = httpProvider.connected;
          if (chainWebSocketConnected) {
            const contract = new ethClient.web3Client.eth.Contract(
              abiItems,
              contractAddr,
            ) as any;

            const agentDataContract: IAgentData = contract as any;
            const sideChainWeb3Account =
              ethClient.web3Client.eth.accounts.privateKeyToAccount(
                encryptionKey!,
              );
            const nonce = await ethClient.web3Client.eth.getTransactionCount(
              sideChainWeb3Account.address,
              'pending',
            );

            const valString = Web3.utils.toHex(agent.signData);
            const tx = {
              // this could be provider.addresses[0] if it exists
              from: sideChainWeb3Account!.address,
              to: agentDataContract.options.address,
              gasPrice: '0x8F0D1800',
              nonce: nonce,
              // optional if you want to specify the gas limit
              gas: '0xAA690',
              // optional if you are invoking say a payable function
              value: '0x00',
              data: agentDataContract.methods
                .insertData(signData.address, valString)
                .encodeABI(),
              // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
            };
            const signTxResult: SignedTransaction =
              await sideChainWeb3Account!.signTransaction(tx);
            const result = await ethClient.web3Client.eth
              .sendSignedTransaction(signTxResult.rawTransaction as string)
              .on('transactionHash', function (transactionHash) {
                logger.info(`TxHash:${transactionHash}`);
              })
              .on('receipt', async function (receipt) {
                logger.info(`Receipt:${JSON.stringify(receipt)}`);
                if (receipt.status) {
                  logger.info(
                    `${funcMsg}  - success, txHash :${receipt.transactionHash}`,
                  );
                } else {
                  logger.error(
                    `${funcMsg}  - fail, txHash :${receipt.transactionHash}`,
                  );
                }
              });
          } else {
            logger.error(`${funcMsg} - websocket not connected`);
            throw new Error(`${funcMsg}  - websocket not connected`);
          }
          await t.commit();
        } catch (e) {
          logger.error(
            funcMsg + `- fail [AgentId] ${signData.id} - ${signData.address}`,
          );
          logger.error(e);

          BlockChainHelper.logRevertReason(e, logger);
          resp.success = false;
          resp.msg = '';
          resp.returnCode = ServerReturnCode.InternalServerError;
          resp.respType = 'warning';
          await t.rollback();
        }
      }
    }

    return resp;
  }

  async getCurrentLevelDetails(agentId: Mixed): Promise<ResponseBase> {
    const funcMsg = `[AgentService][getCurrentLevelDetails](agentId : ${agentId})`;
    logger.info(funcMsg, { message: ' - start' });
    const resp = new ResponseBase();
    resp.success = false;

    const returnObj: any = {};

    try {
      const getAgentResult = await modelModule[SeqModel.name.Agent].findOne({
        where: {
          id: agentId.toString(),
          status: AgentStatus.StatusActive,
        },
      });

      if (getAgentResult) {
        const agentType = getAgentResult.getDataValue('agentType');
        const parentAgentId = getAgentResult.getDataValue('parentAgentId');

        if (agentType == AgentType.FixedLevel || parentAgentId == null) {
          let agentLevel = getAgentResult.getDataValue('agentLevel');

          if (!agentLevel) {
            agentLevel = 0;
          }

          if (agentLevel == AgentLevel.LastLevel) {
            resp.success = false;
            resp.msg = 'Current Agent is in last level';
            resp.returnCode = ServerReturnCode.InternalServerError;
            resp.respType = 'warning';

            logger.info(resp.msg);
          } else {
            const nextAgentLevel = agentLevel + 1;
            const nextAgentFee =
              globalVar.agentConfig.FixedAgentLevel.feeLevel[
                'level' + nextAgentLevel
              ];
            const nextAgnetInterest =
              globalVar.agentConfig.FixedAgentLevel.interestLevel[
                'level' + nextAgentLevel
              ];

            const countTotolSubAgentResult = await modelModule[
              SeqModel.name.Agent
            ].findAll({
              attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
              ],
              where: {
                parentAgentId: agentId.toString(),
                status: AgentStatus.StatusActive,
              },
            });

            let totalRegisteredSubAgent = 0;
            if (countTotolSubAgentResult) {
              totalRegisteredSubAgent = parseInt(
                countTotolSubAgentResult[0].getDataValue('count').toString(),
              );
            }

            const totalSubAgent =
              globalVar.agentConfig.FixedAgentLevel.memberOnEachLevel;

            returnObj['nextAgentLevel'] = nextAgentLevel;
            returnObj['nextAgentFee'] = nextAgentFee;
            returnObj['nextAgnetInterest'] = nextAgnetInterest;
            returnObj['totalSubAgent'] = totalSubAgent;
            returnObj['totalRegisteredSubAgent'] = totalRegisteredSubAgent;

            resp.success = true;
            resp.data = returnObj;

            logger.info(funcMsg, { message: ' - success' });
          }
        } else {
          resp.success = false;
          resp.msg = 'Current Agent is not Fix Level Agent';
          resp.returnCode = ServerReturnCode.InternalServerError;
          resp.respType = 'warning';

          logger.info(resp.msg);
        }
      } else {
        resp.success = false;
        resp.msg = 'Parent agent not found';
        resp.returnCode = ServerReturnCode.InternalServerError;
        resp.respType = 'warning';

        logger.info(resp.msg);
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

  async updateParentTreeList(): Promise<ResponseBase> {
    const funcMsg = `[AgentService][updateParentTreeList]`;
    logger.info(funcMsg, { message: ' - start' });
    const t = await seq.sequelize.transaction();
    let resp = new ResponseBase();
    const dateNow = new Date();

    try {
      const agentResult = await modelModule[SeqModel.name.Agent].findAll({
        transaction: t,
        order: [['id', 'ASC']],
        // limit: 5,
      });

      if (agentResult) {
        for (let i = 0; i <= agentResult.length - 1; i++) {
          const agent = agentResult[i];
          const parentAgentId = agent.getDataValue('parentAgentId');

          if (agent.getDataValue('parentAgentId')) {
            const parentAgentDetails = await modelModule[
              SeqModel.name.Agent
            ].findOne({
              transaction: t,
              where: {
                id: parentAgentId,
              },
              order: [['id', 'ASC']],
            });

            if (parentAgentDetails) {
              let parentTree: Mixed[] = [];
              parentTree = parentAgentDetails.getDataValue('parentTree');

              if (!parentTree || parentTree.length < 1) {
                parentTree = [];
              }

              parentTree.push(parentAgentId);

              if (parentTree && parentTree.length > 0) {
                const agentObj: DBModel.Agent = new DBModel.Agent();
                agentObj.id = agent.getDataValue('id');
                agentObj.parentTree = parentTree;

                const updateResult = await modelModule[
                  SeqModel.name.Agent
                ].update(agentObj, {
                  transaction: t,
                  where: {
                    id: agentObj.id?.toString(),
                  },
                  fields: ['parentTree'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
                });

                if (updateResult[0] <= 0) {
                  await t.rollback();

                  break;
                }
              }
            } else {
              resp = new WarningResponseBase(
                ServerReturnCode.RecordNotFound,
                'Parent Agent record not found',
              );
              logger.info(funcMsg + ' - fail ', { message: resp.msg });
            }
          } else {
            logger.info('cannot get parent agent id');
          }
        }

        resp.success = true;
        resp.respType = 'success';
        resp.msg = 'Update parent tree success';

        logger.info(funcMsg, { message: ' - success' });

        await t.commit();
      } else {
        await t.rollback();

        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Agent record not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      }
    } catch (e) {
      await t.rollback();

      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Update user fail :' + e,
      );
    }

    return resp;
  }

  async checkAgentInParentTree(
    targetAgentId: any,
    jwtAgentId: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[AgentService][checkAgentInParentTree]`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    const dateNow = new Date();

    try {
      const agentsResult = await modelModule[SeqModel.name.Agent].findOne({
        where: {
          id: targetAgentId,
        },
      });

      if (agentsResult) {
        if (targetAgentId != jwtAgentId) {
          const parentTree = agentsResult.getDataValue('parentTree');
          const isInParentTree = parentTree.includes(jwtAgentId);

          if (isInParentTree) {
            resp.success = true;
            resp.msg = 'Agent is in parent Agent Tree';

            logger.info(funcMsg + ' - success ');
          } else {
            resp.success = false;
            resp.returnCode = 0;
            resp.msg = 'Agent is not in parent Agent Tree';

            logger.info(funcMsg + ' - fail ', { message: resp.msg });
          }
        } else {
          resp.success = true;
          resp.msg = 'Agent is checking himself';

          logger.info(funcMsg + ' - success ');
        }
      } else {
        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Agent record not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Check agent fail :' + e,
      );
    }

    return resp;
  }

  async createMstCustomer(newObj: DBModel.Agent, t?: any) {
    const funcMsg = `[AgentService][createMstCustomer](obj.name : ${newObj.name})`;
    logger.info(funcMsg, { message: ' - start' });
    logger.info('newObj: ', newObj);
    let resp = new ResponseBase();

    let isNewTransaction = false;
    if (!t) {
      t = await seq.sequelize.transaction();
      isNewTransaction = true;
    }

    try {
      const customerObj: DBModel.Customer = new DBModel.Customer();

      const recordInDb = await modelModule[SeqModel.name.FundingCode].findOne({
        transaction: t,
        where: {
          agentId: newObj.parentAgentId?.toString(),
        },
      });

      let isRootAgent = false;
      const parentAgent = await modelModule[SeqModel.name.Agent].findOne({
        transaction: t,
        where: {
          id: newObj.parentAgentId?.toString(),
        },
      });

      if (parentAgent) {
        const parentParentAgentId = parentAgent.getDataValue('parentAgentId');

        if (!parentParentAgentId) {
          isRootAgent = true;
        }
      }

      // if (recordInDb || newObj.parentAgentId == '1') {
      if (recordInDb || isRootAgent) {
        const customerService: CustomerService = new CustomerService();

        const checkCustomerExist = await modelModule[
          SeqModel.name.Customer
        ].findOne({
          transaction: t,
          where: {
            address: newObj.address,
          },
        });

        customerObj.address = newObj.address;
        customerObj.name = newObj.name;
        customerObj.agentId = newObj.id!;
        customerObj.creditMode = CustomerCreditModeStatus.StatusDisabled;
        customerObj.contractStatus = CustomerContractStatus.StatusEnabled;
        customerObj.type = CustomerType.normal;

        if (recordInDb) {
          customerObj.fundingCodeId = recordInDb.getDataValue('id');
        }

        if (checkCustomerExist) {
          logger.info(`Customer Exist with address(${newObj.address})`);

          customerObj.id = checkCustomerExist.getDataValue('id');

          // resp = await customerService.update(
          //   customerObj,
          //   newObj.id!,
          //   false,
          //   t,
          // );

          customerObj.leverage = CustomerDefaultDetails.leverage;
          customerObj.maxFunding = CustomerDefaultDetails.maxFunding;
          if (
            process.env.NODE_ENV != 'dev' &&
            process.env.NODE_ENV != 'local'
          ) {
            customerObj.riskLevel = CustomerDefaultDetails.riskLevel;
          }

          const updateResult = await modelModule[SeqModel.name.Customer].update(
            customerObj,
            {
              transaction: t,
              where: {
                address: customerObj.address,
              },
              fields: [
                'name',
                'agentId',
                'contractStatus',
                'riskLevel',
                'leverage',
                'maxFunding',
                'creditMode',
                'lastModifiedDate',
              ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
            },
          );

          resp.success = true;
        } else {
          logger.info(`Customer Not Exist with address(${newObj.address})`);

          resp = await customerService.create(customerObj, t);
        }
        // if (checkCustomerExist) {
        //   resp = await customerService.update(customerObj)
        // } else {
        //   resp = await customerService.create(customerObj, t);
        // }

        if (resp.success) {
          logger.info(
            `[AgentService][createMstCustomer](obj.name : ${newObj.name}) success`,
          );

          const fundingCodeObj: DBModel.FundingCode = new DBModel.FundingCode();
          fundingCodeObj.customerName = '';
          fundingCodeObj.type = FundingCodeTypeStatus.ForeverUse;
          fundingCodeObj.agentType = AgentType.MST;

          resp = await customerService.genFundingCode(
            fundingCodeObj,
            Number.parseInt(customerObj.agentId.toString()),
            t,
          );
        }
      } else {
        logger.info('Funding Code not found/not root agent');

        resp.msg = 'Funding Code not found/not root agent';
        resp.success = false;
      }
    } catch (e) {
      if (isNewTransaction) {
        await t.rollback();
      }

      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Insert user fail :' + e,
      );
    }

    return resp;
  }

  // async updateMstCustomer(newObj: DBModel.Agent, t?: any) {
  //   const funcMsg = `[AgentService][updateMstCustomer](obj.name : ${newObj.name})`;
  //   logger.info(funcMsg, { message: ' - start' });
  //   logger.info('newObj: ', newObj);
  //   let resp = new ResponseBase();

  //   let isNewTransaction = false;
  //   if (!t) {
  //     t = await seq.sequelize.transaction();
  //     isNewTransaction = true;
  //   }

  //   try {
  //     const customerResult = await modelModule[SeqModel.name.Customer].findOne({
  //       transaction: t,
  //       where: {
  //         address: newObj.address,
  //       },
  //     });

  //     const recordInDb = await modelModule[SeqModel.name.FundingCode].findOne({
  //       transaction: t,
  //       where: {
  //         agentId: newObj.parentAgentId?.toString(),
  //       },
  //     });
  //   } catch (e) {
  //     if (isNewTransaction) {
  //       await t.rollback();
  //     }

  //     logger.error(funcMsg + ' - fail ');
  //     logger.error(e);
  //     resp = new ErrorResponseBase(
  //       ServerReturnCode.InternalServerError,
  //       'Update MST user fail :' + e,
  //     );
  //   }

  //   return resp;
  // }

  async updateSelf(newObj: DBModel.Agent): Promise<ResponseBase> {
    const funcMsg = `[AgentService][updateSelf](obj.id : ${newObj.id})`;
    logger.info(funcMsg, { message: ' - start' });
    logger.info('newObj: ', newObj);
    const t = await seq.sequelize.transaction();
    let resp = new ResponseBase();
    const dateNow = new Date();
    newObj.createdDate = dateNow;
    newObj.lastModifiedDate = dateNow;
    if (newObj.address) {
      newObj.address = newObj.address.toLowerCase();
    }

    try {
      const recordInDb = await modelModule[SeqModel.name.Agent].findOne({
        where: {
          // address: newObj.address,
          id: newObj.id?.toString(),
        },
        transaction: t,
      });

      if (recordInDb) {
        let emailDuplicated = false;

        if (newObj.email) {
          const checkEmailInDb = await modelModule[SeqModel.name.Agent].findOne(
            {
              where: {
                email: newObj.email,
                id: {
                  [Op.ne]: newObj.id?.toString(),
                },
              },
              transaction: t,
            },
          );

          if (checkEmailInDb) {
            emailDuplicated = true;
          }
        }

        if (!emailDuplicated) {
          const updateResult = await modelModule[SeqModel.name.Agent].update(
            newObj,
            {
              transaction: t,
              where: {
                // address: newObj.address.toLowerCase(),
                id: newObj.id?.toString(),
              },
              fields: ['name', 'email', 'lastModifiedDate'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
            },
          );

          const affectedRowsMsg = `Updated affected rows (${updateResult[0]})`;
          logger.info(funcMsg, {
            message: affectedRowsMsg,
          });
          resp.success = updateResult[0] > 0 ? true : false;
          resp.msg = affectedRowsMsg;
          resp.returnCode =
            updateResult[0] > 0
              ? ServerReturnCode.Success
              : ServerReturnCode.InternalServerError;
          resp.respType = updateResult[0] > 0 ? 'success' : 'warning';

          await t.commit();
        } else {
          await t.rollback();

          resp = new WarningResponseBase(
            ServerReturnCode.RecordNotFound,
            'The input email is already exist',
          );
          logger.info(funcMsg + ' - fail ', { message: resp.msg });
        }
      } else {
        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Agent record not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
        await t.rollback();
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Update user fail :' + e,
      );
      await t.rollback();
    }

    return resp;
  }

  async updateSelfPassword(
    newObj: DBModel.Agent,
    currentPassword: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[AgentService][updateSelfEmail](obj.id : ${newObj.id})`;
    logger.info(funcMsg, { message: ' - start' });
    logger.info('newObj: ', newObj);
    const t = await seq.sequelize.transaction();
    let resp = new ResponseBase();
    const dateNow = new Date();

    if (newObj.address) {
      newObj.address = newObj.address.toLowerCase();
    }

    newObj.lastModifiedDate = dateNow;

    try {
      const recordInDb = await modelModule[SeqModel.name.Agent].findOne({
        where: {
          // address: newObj.address,
          id: newObj.id?.toString(),
        },
        transaction: t,
      });

      if (recordInDb) {
        const currentPw = recordInDb.getDataValue('password');

        if (currentPw == currentPassword) {
          const updateResult = await modelModule[SeqModel.name.Agent].update(
            newObj,
            {
              transaction: t,
              where: {
                // address: newObj.address.toLowerCase(),
                id: newObj.id?.toString(),
              },
              fields: ['password', 'lastModifiedDate'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
            },
          );

          const affectedRowsMsg = `Updated affected rows (${updateResult[0]})`;
          logger.info(funcMsg, {
            message: affectedRowsMsg,
          });
          resp.success = updateResult[0] > 0 ? true : false;
          resp.msg = affectedRowsMsg;
          resp.returnCode =
            updateResult[0] > 0
              ? ServerReturnCode.Success
              : ServerReturnCode.InternalServerError;
          resp.respType = updateResult[0] > 0 ? 'success' : 'warning';

          await t.commit();
        } else {
          await t.rollback();

          resp = new WarningResponseBase(
            ServerReturnCode.RecordNotFound,
            'Current password is incorret',
          );
          logger.info(funcMsg + ' - fail ', { message: resp.msg });
        }
      } else {
        await t.rollback();

        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Agent record not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      }
    } catch (e) {
      await t.rollback();

      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Update user fail :' + e,
      );
    }

    return resp;
  }
}
