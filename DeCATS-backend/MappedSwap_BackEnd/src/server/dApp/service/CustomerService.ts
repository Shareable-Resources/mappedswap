import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import * as ReqModel from '../../../server/dApp/model/reqModel/0_index';
import {
  ErrorResponseBase,
  ResponseBase,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import logger from '../util/ServiceLogger';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { Model, Sequelize } from 'sequelize';
import {
  CustomerContractStatus,
  CustomerCreditModeStatus,
  CustomerDefaultDetails,
  CustomerStatus,
  CustomerType,
} from '../../../general/model/dbModel/Customer';
import {
  signFundingCode,
  signToken,
  validateFundingCode,
} from '../../../foundation/server/Middlewares';
import {
  FundingCodeCodeStatus,
  FundingCodeStatus,
  FundingCodeTypeStatus,
} from '../../../general/model/dbModel/FundingCode';
import { defaultAgentId } from '../const';
import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'url';
// import callPool, {
//   getNonce,
// } from '../../../foundation/utils/poolContract/Pool';
import foundationConst from '../../../foundation/const/index';
import {
  ReferralCodeCodeStatus,
  ReferralCodeStatus,
  ReferralCodeType,
} from '../../../general/model/dbModel/ReferralCode';
import {
  checkAgentLevel,
  checkParentAgentRate,
  getFixedLevelPercentage,
} from './AgentService';
import { AgentStatus, AgentType } from '../../../general/model/dbModel/Agent';
import { AbiItem } from 'web3-utils';
import IAgentDataArtifact from '../../../abi/IAgentData.json';
import Web3 from 'web3';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import { IAgentData } from '../../../@types/IAgentData.d';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import { SignedTransaction } from 'web3-core';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import Db from '../../../foundation/sequlelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import UserWalletAbi from '../../../abi/UserWallet.json';
import { UserWallet } from '../../../@types/UserWallet';
// import crypto = require('crypto');
import crypto from 'crypto';
import globalVar from '../const/globalVar';
import ConnectedWalletService from '../service/ConnectedWalletService';
import { ConnectedType } from '../../../general/model/dbModel/ConnectedWallet';
import {
  addNonce,
  exportedNonce,
  NonceLoader,
} from '../SystemTask/NonceLoader';
import { IPoolAgent } from '../../../@types/IPoolAgent';
import abi from '../../../abi/IPoolAgent.json';
const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  connectedWalletService: ConnectedWalletService;
  constructor() {
    this.connectedWalletService = new ConnectedWalletService();
  }
  async getAll(query: any): Promise<null> {
    return null;
  }

  async login(obj: ReqModel.CustomerLoginReq) {
    const funcMsg = `[CustomerService][login](obj.address : ${obj.address})`;

    let resp = new ResponseBase();
    const t = await seq.sequelize.transaction();
    try {
      logger.info(funcMsg, { message: ' - start' });
      obj.address = obj.address.toLowerCase();
      // let address = obj.address;
      let centralizedWalletAddress;
      let isCentralized = false;
      if (obj.centralizedWalletAddress) {
        centralizedWalletAddress = await getWalletOwner(
          obj.centralizedWalletAddress,
        );

        if (centralizedWalletAddress != obj.address) {
          resp = new WarningResponseBase(
            ServerReturnCode.RecordNotFound,
            `Wallet Address not match ${obj.centralizedWalletAddress}`,
          );

          return resp;
        } else {
          isCentralized = true;
        }
      }

      const whereStatement: any = {};
      whereStatement.address = Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('address')),
        '=',
        isCentralized
          ? obj.centralizedWalletAddress!.toLowerCase()
          : obj.address.toLowerCase(),
      );
      let recordInDb: any = await modelModule[SeqModel.name.Customer].findOne({
        where: whereStatement,
        transaction: t,
      });
      if (!recordInDb) {
        if (!obj.type) {
          obj.type = CustomerType.normal;
        }
        const newObj: DBModel.Customer = {
          id: null,
          address: isCentralized
            ? obj.centralizedWalletAddress!.toLowerCase()
            : obj.address.toLowerCase(),
          name: null,
          agentId: defaultAgentId, //be default 1
          leverage: 0,
          maxFunding: 0,
          creditMode: CustomerCreditModeStatus.StatusDisabled,
          contractStatus: CustomerContractStatus.StatusDisabled,
          riskLevel: 0,
          fundingCodeId: null,
          type: obj.type,
          createdById: null,
          createdDate: new Date(),
          lastModifiedById: null,
          lastModifiedDate: new Date(),
          status: CustomerStatus.StatusActive,
        };
        const insertResult: any = await modelModule[
          SeqModel.name.Customer
        ].create(newObj, {
          transaction: t,
        });
        const id = insertResult.getDataValue('id');
        newObj.createdById = id;
        newObj.createdDate = new Date();
        newObj.lastModifiedById = id;
        newObj.lastModifiedDate = new Date();
        const updateResult: any = await modelModule[
          SeqModel.name.Customer
        ].update(newObj, {
          fields: [
            'lastModifedDate',
            'lastModifiedById',
            'createdById',
            'createdDate',
          ],
          where: {
            id: id,
          },
          transaction: t,
        });

        let walletAddress = obj.address;
        if (obj.type == CustomerType.centralized) {
          const getCentrizedAddressResult = await this.getCentrizedAddress(
            obj.address,
          );

          if (getCentrizedAddressResult.success) {
            walletAddress = getCentrizedAddressResult.data;
          }
        }

        resp.msg = `Customer record not found, new customer is created (${id})`;
        resp.success = true;
        resp.respType = 'success';
        recordInDb = await modelModule[SeqModel.name.Customer].findOne({
          where: whereStatement,
          transaction: t,
        });

        logger.info(resp.msg);
        // const token = await signToken({
        //   loginId: recordInDb.getDataValue('id'),
        //   id: recordInDb.getDataValue('id'),
        //   name: recordInDb.getDataValue('name'),
        //   type: 'Customer',
        //   status: recordInDb.getDataValue('status'),
        //   address: recordInDb.getDataValue('address'),
        //   walletAddress: walletAddress,
        //   contractStatus: recordInDb.getDataValue('contractStatus'),
        // });
        // resp.data = token;
        // logger.info(funcMsg + ' - success ', { message: resp.msg });
        // logger.info(funcMsg, { message: resp.msg });
      } else if (
        recordInDb &&
        recordInDb.getDataValue('status') == CustomerStatus.StatusInactive
      ) {
        // prettier-ignore
        resp = new WarningResponseBase(
              ServerReturnCode.RecordNotFound,
              `Customer record status is not avaiable for login (${recordInDb.getDataValue('status')})`,
            );
        resp.msg = 'Customer record status is not avaiable for login';
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else {
        let walletAddress = recordInDb.getDataValue('address');
        if (recordInDb.getDataValue('type') == CustomerType.centralized) {
          const getCentrizedAddressResult = await this.getCentrizedAddress(
            obj.address,
          );

          if (getCentrizedAddressResult.success) {
            walletAddress = getCentrizedAddressResult.data;
          }
        }

        resp.success = true;
        resp.msg = 'Customer record found';
        resp.respType = 'success';
        // const token = await signToken({
        //   loginId: recordInDb.getDataValue('id'),
        //   id: recordInDb.getDataValue('id'),
        //   name: recordInDb.getDataValue('name'),
        //   type: 'Customer',
        //   status: recordInDb.getDataValue('status'),
        //   address: recordInDb.getDataValue('address'),
        //   walletAddress: walletAddress,
        //   contractStatus: recordInDb.getDataValue('contractStatus'),
        // });
        // resp.data = token;
        logger.info(funcMsg + ' - success ', { message: resp.msg });
      }
      await t.commit();

      if (obj.fundingCode) {
        const customerObj: DBModel.Customer = new DBModel.Customer();
        customerObj.address = obj.address;
        const respObj = await this.loadFundingCode(
          customerObj,
          obj.fundingCode?.toString(),
          null,
        );

        // t = await seq.sequelize.transaction();

        // const agentObj: DBModel.Agent = new DBModel.Agent();
        // agentObj.address = obj.address;
        // agentObj.email = '';
        // agentObj.password = '';

        // const respObj2 = await this.registerWithReferralCode(
        //   agentObj,
        //   obj.fundingCode?.toString(),
        //   t,
        // );

        // const respObj = await this.registerCustomerWithReferralCode(
        //   customerObj,
        //   obj.fundingCode?.toString(),
        //   t,
        // );

        // await t.commit();

        // resp.msg += ', ' + respObj.msg;
        // resp.msg = respObj.msg;
        resp = respObj;
        // resp.returnCode = ServerReturnCode.LoginSuccessButLoadFundingCodeFailed;
      }

      // let address = recordInDb.getDataValue('address');
      // let centralizedAddress;
      // if (obj.isCenterized) {
      //   centralizedAddress = await getWalletOwner(address);

      //   if (centralizedAddress) {
      //     address = centralizedAddress;
      //   }
      // }

      if (resp.success) {
        const agentRecordInDb: any = await modelModule[
          SeqModel.name.Agent
        ].findOne({
          where: whereStatement,
        });

        let agentId = '';
        let agentType = null;
        if (agentRecordInDb) {
          agentId = agentRecordInDb.getDataValue('id');
          agentType = agentRecordInDb.getDataValue('agentType');
        }

        let isAgent = false;
        if (agentRecordInDb) {
          isAgent = true;
        }

        let walletAddress = obj.address;
        if (obj.type == CustomerType.centralized) {
          const getCentrizedAddressResult = await this.getCentrizedAddress(
            obj.address,
          );

          if (getCentrizedAddressResult.success) {
            walletAddress = getCentrizedAddressResult.data;
          }
        }

        const token = await signToken({
          loginId: recordInDb.getDataValue('id'),
          id: recordInDb.getDataValue('id'),
          name: recordInDb.getDataValue('name'),
          type: 'Customer',
          status: recordInDb.getDataValue('status'),
          address: isCentralized
            ? obj.centralizedWalletAddress!.toLowerCase()
            : obj.address.toLowerCase(),
          walletAddress: walletAddress,
          contractStatus: recordInDb.getDataValue('contractStatus'),
          isAgent: isAgent,
          agentId: agentId,
          agentType: agentType,
        });
        resp.data = token;

        //insert connected wallet record to db
        await this.connectedWalletService.create({
          id: null,
          address: isCentralized
            ? obj.centralizedWalletAddress!.toLowerCase()
            : obj.address.toLowerCase(),
          connectedType: ConnectedType.customer,
          createdDate: new Date(),
        });
      }

      return resp;
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Insert customer fail :' + e,
      );
      await t.rollback();
      return resp;
    }
  }

  async loadFundingCode(
    newObj: DBModel.Customer,
    fundingCode: string,
    jwt: any | null,
  ): Promise<ResponseBase> {
    const funcMsg = `[CustomerService][loadFundingCode](FundingCode : ${newObj.fundingCodeId})(address: ${newObj.address})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    let t = await seq.sequelize.transaction();
    const dateNow = new Date();
    let dateWithoutSecond: any = new Date(new Date().setSeconds(0, 0));
    dateWithoutSecond = dateWithoutSecond.setHours(0, 0, 0, 0);

    if (fundingCode) {
      fundingCode = fundingCode.toUpperCase();
    }

    let updateCustomerResult: any;
    let insertCustomerResult: any;

    const backupCustomer = new DBModel.Customer();

    newObj.leverage = CustomerDefaultDetails.leverage;
    newObj.maxFunding = CustomerDefaultDetails.maxFunding;
    newObj.contractStatus = CustomerContractStatus.StatusEnabled;
    if (!newObj.riskLevel) {
      newObj.riskLevel = 800000;
    }
    newObj.lastModifiedDate = dateNow;
    newObj.status = CustomerStatus.StatusActive;
    newObj.creditMode = CustomerCreditModeStatus.StatusDisabled;

    try {
      resp = await validateFundingCode(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + fundingCode,
      );
      // resp = await validateFundingCode(newObj.fundingCode);

      const recordInDb = await modelModule[SeqModel.name.FundingCode].findOne({
        where: {
          fundingCode: fundingCode,
        },
      });

      if (!resp.success) {
        if (recordInDb) {
          const expiryDate = new Date(recordInDb.getDataValue('expiryDate'));
          const agentType = recordInDb.getDataValue('agentType');

          if (agentType != AgentType.MST && expiryDate) {
            if (dateWithoutSecond <= expiryDate) {
              resp.success = true;
            }
          } else {
            resp.success = true;
          }
        } else {
          resp.msg = 'Invalid Funding Code';
          logger.info(resp.msg);
        }
      }

      if (resp.success) {
        // recordInDb = await modelModule[SeqModel.name.FundingCode].findOne({
        //   where: {
        //     fundingCode: fundingCode,
        //   },
        // });

        if (recordInDb) {
          const fundingCodeType = recordInDb.getDataValue('type');
          let checkIsUsed = false;

          if (fundingCodeType == FundingCodeTypeStatus.OneTimeUse) {
            checkIsUsed = recordInDb?.getDataValue('isUsed');
          }

          if (!checkIsUsed) {
            const agentType = recordInDb.getDataValue('agentType');

            newObj.name = recordInDb.getDataValue('customerName');
            newObj.agentId = recordInDb.getDataValue('agentId');
            newObj.fundingCodeId = recordInDb.getDataValue('id');
            newObj.lastModifiedById = recordInDb.getDataValue('agentId');

            const recordCustomerInDb = await modelModule[
              SeqModel.name.Customer
            ].findOne({
              where: {
                address: newObj.address,
                status: CustomerStatus.StatusActive,
              },
            });

            if (recordCustomerInDb) {
              if (recordCustomerInDb.getDataValue('fundingCodeId')) {
                // await t.rollback();

                resp = new WarningResponseBase(
                  ServerReturnCode.UniqueViolationError,
                  'Customer already binded funding Code.',
                );
                logger.info(funcMsg + ' - fail ', { message: resp.msg });
              } else {
                newObj.id = recordCustomerInDb.getDataValue('id');
                newObj.lastModifiedById = recordCustomerInDb.getDataValue('id');

                if (agentType == AgentType.MST) {
                  resp = await this.registerAgentWithFundingCode(
                    newObj,
                    fundingCode,
                    t,
                  );

                  const newAgentInDb = await modelModule[
                    SeqModel.name.Agent
                  ].findOne({
                    transaction: t,
                    where: {
                      address: newObj.address,
                      status: AgentStatus.StatusActive,
                    },
                  });

                  if (newAgentInDb) {
                    newObj.agentId = newAgentInDb.getDataValue('id');
                  } else {
                    await t.rollback();

                    resp.success = false;
                    resp = new WarningResponseBase(
                      ServerReturnCode.UniqueViolationError,
                      'MST agent not found!',
                    );

                    logger.info(resp.msg);

                    return resp;
                  }
                } else {
                  logger.info('agentType != AgentType.MST');
                }

                if (resp.success) {
                  backupCustomer.address =
                    recordCustomerInDb.getDataValue('address');
                  backupCustomer.name =
                    recordCustomerInDb.getDataValue('customerName');
                  backupCustomer.agentId =
                    recordCustomerInDb.getDataValue('agentId');
                  backupCustomer.leverage =
                    recordCustomerInDb.getDataValue('leverage');
                  backupCustomer.maxFunding =
                    recordCustomerInDb.getDataValue('maxFunding');
                  backupCustomer.creditMode =
                    recordCustomerInDb.getDataValue('creditMode');
                  backupCustomer.contractStatus =
                    recordCustomerInDb.getDataValue('contractStatus');
                  backupCustomer.riskLevel =
                    recordCustomerInDb.getDataValue('riskLevel');
                  backupCustomer.fundingCodeId =
                    recordCustomerInDb.getDataValue('fundingCodeId');
                  backupCustomer.lastModifiedDate =
                    recordCustomerInDb.getDataValue('lastModifiedDate');
                  backupCustomer.lastModifiedById =
                    recordCustomerInDb.getDataValue('lastModifiedById');
                  backupCustomer.status =
                    recordCustomerInDb.getDataValue('status');

                  updateCustomerResult = await modelModule[
                    SeqModel.name.Customer
                  ].update(newObj, {
                    transaction: t,
                    where: {
                      address: newObj.address,
                    },
                    fields: [
                      'name',
                      'agentId',
                      'leverage',
                      'contractStatus',
                      'riskLevel',
                      'maxFunding',
                      'creditMode',
                      'fundingCodeId',
                      'lastModifiedDate',
                      'lastModifiedById',
                    ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
                  });

                  if (!updateCustomerResult) {
                    resp = new WarningResponseBase(
                      ServerReturnCode.UniqueViolationError,
                      'Update Customer Failed',
                    );
                    logger.info(funcMsg + ' - fail ', { message: resp.msg });
                  }
                }
              }
            } else {
              // newObj.createdDate = dateNow;
              // newObj.createdById = 0;
              // newObj.lastModifiedById = 0;

              // insertCustomerResult = await modelModule[
              //   SeqModel.name.Customer
              // ].create(newObj, {
              //   transaction: t,
              // });

              await t.rollback();

              resp = new WarningResponseBase(
                ServerReturnCode.UniqueViolationError,
                'Customer not found',
              );
              logger.info(funcMsg + ' - fail ', { message: resp.msg });

              return resp;
            }

            await t.commit();

            if (updateCustomerResult || insertCustomerResult) {
              const fundingCodeObj = new DBModel.FundingCode();
              fundingCodeObj.isUsed = true;

              t = await seq.sequelize.transaction();

              const receipt: any = await callPool(
                newObj.address,
                newObj.maxFunding,
                newObj.riskLevel,
                newObj.contractStatus,
                newObj.creditMode,
                newObj.leverage,
                // logger,
                // new DBModel.CustomerCreditUpdate(),
              );

              if (receipt && receipt.status) {
                logger.info(
                  `receipt.status is true for address ${newObj.address}`,
                );

                if (fundingCodeType == FundingCodeTypeStatus.OneTimeUse) {
                  const updateResult: any = await modelModule[
                    SeqModel.name.FundingCode
                  ].update(fundingCodeObj, {
                    transaction: t,
                    where: {
                      id: newObj.fundingCodeId?.toString(),
                      codeStatus: FundingCodeCodeStatus.StatusActive,
                      status: FundingCodeStatus.StatusActive,
                      isUsed: false,
                    },
                    fields: ['isUsed', 'lastModifiedDate'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
                  });
                }

                // if (agentType == AgentType.MST) {
                //   resp = await this.registerAgentWithFundingCode(
                //     newObj,
                //     fundingCode,
                //     t,
                //   );
                // }

                // if (resp.success) {
                if (jwt) {
                  const whereStatement: any = {};
                  whereStatement.address = Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('address')),
                    '=',
                    jwt.address.toLowerCase(),
                  );

                  const agentRecordInDb: any = await modelModule[
                    SeqModel.name.Agent
                  ].findOne({
                    where: whereStatement,
                    transaction: t,
                  });

                  let agentId = '';
                  let agentType = null;

                  let isAgent = false;
                  if (agentRecordInDb) {
                    agentId = agentRecordInDb.getDataValue('id');
                    agentType = agentRecordInDb.getDataValue('agentType');
                    isAgent = true;
                  }

                  const token = await signToken({
                    loginId: jwt.id,
                    id: jwt.id,
                    name: jwt.name,
                    type: 'Customer',
                    status: jwt.status,
                    address: jwt.address.toLowerCase(),
                    walletAddress: jwt.walletAddress,
                    contractStatus: jwt.contractStatus,
                    isAgent: isAgent,
                    agentId: agentId,
                    agentType: agentType,
                  });

                  resp.data = token;
                }
                resp.success = true;
                resp.msg = `Funding Code used successfully.`;
                logger.info(funcMsg + ' - success ', { message: resp.msg });
                // } else {
                //   // resp = new WarningResponseBase(
                //   //   ServerReturnCode.UniqueViolationError,
                //   //   'Update contract failed',
                //   // );
                //   logger.info(funcMsg + ' - fail ', { message: resp.msg });
                // }
              } else {
                // await t.rollback();
                logger.info(
                  `receipt is null or receipt.status is false for address ${newObj.address}`,
                );

                updateCustomerResult = await modelModule[
                  SeqModel.name.Customer
                ].update(backupCustomer, {
                  transaction: t,
                  where: {
                    address: newObj.address,
                  },
                  fields: [
                    'address',
                    'name',
                    'agentId',
                    'leverage',
                    'maxFunding',
                    'creditMode',
                    'contractStatus',
                    'riskLevel',
                    'fundingCodeId',
                    'lastModifiedDate',
                    'lastModifiedById',
                  ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
                });

                resp = new WarningResponseBase(
                  ServerReturnCode.UniqueViolationError,
                  'Update contract failed',
                );
                logger.info(funcMsg + ' - fail ', { message: resp.msg });
              }
              await t.commit();
            }
          } else {
            resp = new WarningResponseBase(
              ServerReturnCode.UniqueViolationError,
              'Funging Code was used, please try a new code!',
            );
            logger.info(funcMsg + ' - fail ', { message: resp.msg });
            await t.rollback();
          }
        } else {
          resp = new WarningResponseBase(
            ServerReturnCode.UniqueViolationError,
            'Funging Code not found',
          );
          logger.info(funcMsg + ' - fail ', { message: resp.msg });

          await t.rollback();
        }
      } else {
        await t.rollback();
      }
      // await t.commit();
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

  async registerAgentWithFundingCode(
    customerObj: DBModel.Customer,
    fundingCode: string,
    t?: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[CustomerService][registerAgentWithFundingCode](FundingCode : ${fundingCode})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    const dateNow = new Date();
    // let t = await seq.sequelize.transaction();
    let isNewTransaction = false;
    if (!t) {
      t = await seq.sequelize.transaction();
      isNewTransaction = true;
    }

    try {
      const recordInDb = await modelModule[SeqModel.name.FundingCode].findOne({
        where: {
          fundingCode: fundingCode,
        },
      });

      if (recordInDb) {
        const parentAgentObj = await modelModule[SeqModel.name.Agent].findOne({
          where: {
            id: recordInDb?.getDataValue('agentId'),
          },
        });

        if (parentAgentObj) {
          const validationHelper: ValidationHelper = new ValidationHelper();

          let parentTree = parentAgentObj?.getDataValue('parentTree');
          if (!parentTree || parentTree.length < 1) {
            parentTree = [];
          }

          parentTree.push(recordInDb?.getDataValue('agentId'));

          const agentObj: DBModel.Agent = new DBModel.Agent();
          agentObj.address = customerObj.address;
          if (customerObj.name) {
            agentObj.name = customerObj.name;

            if (validationHelper.isEmail(customerObj.name)) {
              agentObj.email = customerObj.name;
            }
          }
          agentObj.fundingCodeId = recordInDb?.getDataValue('id');
          agentObj.interestPercentage = 0;
          agentObj.feePercentage = 0;
          agentObj.parentAgentId = recordInDb?.getDataValue('agentId');
          agentObj.agentType = recordInDb?.getDataValue('agentType');
          agentObj.agentLevel = null;
          agentObj.interestPercentage = 0;
          agentObj.feePercentage = 0;
          agentObj.status = AgentStatus.StatusActive;
          agentObj.parentTree = parentTree;

          const insertAgentResult = await modelModule[
            SeqModel.name.Agent
          ].create(agentObj, {
            transaction: t,
          });

          const id = insertAgentResult.getDataValue('id');
          const signData = {
            id: id,
            address: insertAgentResult.getDataValue('address'),
          };
          agentObj.createdById = id;
          agentObj.lastModifiedById = id;
          agentObj.signData = JSON.stringify(signData);
          const updateAgent = await modelModule[SeqModel.name.Agent].update(
            agentObj,
            {
              transaction: t,
              where: {
                address: customerObj.address,
              },
              fields: [
                'createdById',
                'createdDate',
                'lastModifiedDate',
                'lastModifiedById',
                'signData',
              ],
            },
          );

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
            if (exportedNonce == null) {
              const nonceLoader: NonceLoader = new NonceLoader();
              await nonceLoader.loadNonceIntoMemory();
            }

            if (exportedNonce != null) {
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

              const valString = Web3.utils.toHex(agentObj.signData);
              const tx = {
                // this could be provider.addresses[0] if it exists
                from: sideChainWeb3Account!.address,
                to: agentDataContract.options.address,
                gasPrice: '0x8F0D1800',
                // nonce: nonce,
                nonce: exportedNonce,
                // optional if you want to specify the gas limit
                gas: '0xAA690',
                // optional if you are invoking say a payable function
                value: '0x00',
                data: agentDataContract.methods
                  .insertData(signData.address, valString)
                  .encodeABI(),
                // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
              };
              logger.info(
                `current nonce ${exportedNonce} for address ${signData.address}`,
              );
              await addNonce();
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
            } else {
              logger.error(`[AgentData][InsertData] - cannot get nonce`);
            }
          } else {
            logger.error(`[AgentData][InsertData] - websocket not connected`);
          }

          // // customerObj.agentId = insertAgentResult.id;
          // customerObj.agentId = insertAgentResult.getDataValue('id');
          // customerObj.lastModifiedById = insertAgentResult.getDataValue('id');
          // customerObj.lastModifiedDate = new Date();

          // const updateCustomerResult = await modelModule[
          //   SeqModel.name.Customer
          // ].update(customerObj, {
          //   transaction: t,
          //   where: {
          //     address: customerObj.address,
          //   },
          //   fields: ['agentId', 'lastModifiedDate', 'lastModifiedById'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
          // });

          const fundingCodeObj: DBModel.FundingCode = new DBModel.FundingCode();
          fundingCodeObj.customerName = '';
          fundingCodeObj.type = FundingCodeTypeStatus.ForeverUse;
          fundingCodeObj.agentType = AgentType.MST;

          resp = await this.genFundingCode(fundingCodeObj, id, t);

          if (resp.success) {
            if (isNewTransaction) {
              await t.commit();
            }

            resp.success = true;
            logger.info(funcMsg, { message: ' - success' });
          } else {
            if (isNewTransaction) {
              await t.rollback();
            }

            resp.success = false;
            logger.info(funcMsg + ' - fail ', { message: resp.msg });
          }
        } else {
          resp.success = false;

          resp = new WarningResponseBase(
            ServerReturnCode.UniqueViolationError,
            'Parent Agent not found',
          );
          logger.info(funcMsg + ' - fail ', { message: resp.msg });

          if (isNewTransaction) {
            await t.rollback();
          }
        }
      } else {
        resp.success = false;

        resp = new WarningResponseBase(
          ServerReturnCode.UniqueViolationError,
          'Funging Code not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });

        if (isNewTransaction) {
          await t.rollback();
        }
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'generate funding code fail :' + e,
      );

      if (isNewTransaction) {
        await t.rollback();
      }
    }

    return resp;
  }

  async getCentrizedAddress(address: string): Promise<ResponseBase> {
    const funcMsg = `[CustomerService][getCentrizedAddress](address : ${address})`;
    logger.info(funcMsg, { message: ' - start' });
    const resp = new ResponseBase();
    const dateNow = new Date();

    const path = globalVar.foundationConfig.wallet.url;
    const port = globalVar.foundationConfig.wallet.port;
    const url = new URL(path + ':' + port + '/user/userWalletAddress');
    const params = { loginAddress: address };

    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url, {
      method: 'GET',
    });

    if (response.status == 200) {
      const data = await response.json();

      if (data.returnCode == 0) {
        resp.success = true;
        resp.data = data.data;
        resp.msg = 'Address Found';
        logger.info(funcMsg, { message: ' - success' });
      } else {
        resp.success = false;
        resp.msg = 'get centralized address failed';
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      }
    } else {
      resp.success = false;
      resp.msg = 'Cannot access wallet';
      logger.info(funcMsg + ' - fail ', { message: resp.msg });
    }

    return resp;
  }

  async registerWithReferralCode(
    newObj: DBModel.Agent,
    referralCode: string,
    t?: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[AgentService][registerWithReferralCode](referralCode : ${referralCode})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    const dateNow = new Date();
    // const t = await seq.sequelize.transaction();
    let isNewTransaction = false;
    if (!t) {
      t = await seq.sequelize.transaction();
      isNewTransaction = true;
    }

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
          const checkParentAgentRateResult = await checkParentAgentRate(newObj);
          const checkAgentLevelResult = await checkAgentLevel(
            recordInDb.getDataValue('agentId'),
          );

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

            const recordAgentInDb = await modelModule[
              SeqModel.name.Agent
            ].findOne({
              where: {
                address: newObj.address,
                status: AgentStatus.StatusActive,
              },
            });

            if (recordAgentInDb) {
              if (isNewTransaction) {
                await t.rollback();
              }

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
              newObj.agentLevel = null;

              const fixedLevelObj = await getFixedLevelPercentage(
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

              if (isNewTransaction) {
                await t.commit();
              }

              resp.success = true;
              resp.msg = 'Create Agent with refferal Code successs';
              logger.info(funcMsg, { message: ' - success' });
            }
          } else {
            if (!checkIsUsed) {
              resp = new WarningResponseBase(
                ServerReturnCode.RecordDuplicated,
                'Referral code is already used',
              );
              logger.info(funcMsg + ` - fail ${resp.msg}`);
            }
            if (!checkParentAgentRateResult.success) {
              resp = checkParentAgentRateResult;
            }
            if (!checkAgentLevelResult.success) {
              resp = checkAgentLevelResult;
            }
          }
        } else {
          if (isNewTransaction) {
            await t.rollback();
          }

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

      if (isNewTransaction) {
        await t.rollback();
      }
    }

    logger.info(funcMsg, { message: ' - end' });
    return resp;
  }

  async registerCustomerWithReferralCode(
    newObj: DBModel.Customer,
    referralCode: string,
    t?: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[CustomerService][registerCustomerWithReferralCode](FundingCode : ${newObj.fundingCodeId})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    // let t = await seq.sequelize.transaction();
    let isNewTransaction = false;
    if (!t) {
      t = await seq.sequelize.transaction();
      isNewTransaction = true;
    }

    const dateNow = new Date();

    let updateCustomerResult: any;

    const backupCustomer = new DBModel.Customer();

    newObj.leverage = CustomerDefaultDetails.leverage;
    newObj.maxFunding = CustomerDefaultDetails.maxFunding;
    newObj.contractStatus = CustomerContractStatus.StatusEnabled;
    if (!newObj.riskLevel) {
      newObj.riskLevel = 800000;
    }
    newObj.lastModifiedDate = dateNow;
    newObj.status = CustomerStatus.StatusActive;
    newObj.creditMode = CustomerCreditModeStatus.StatusDisabled;

    // const req: any = {
    //   authorization: newObj.fundingCodeId,
    // };
    // const res: any = new ResponseBase();
    // let next: any;

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
        });

        if (recordInDb) {
          const referralCodeType = recordInDb.getDataValue('type');
          let checkIsUsed = false;

          if (referralCodeType == FundingCodeTypeStatus.OneTimeUse) {
            checkIsUsed = recordInDb?.getDataValue('isUsed');
          }

          if (!checkIsUsed) {
            newObj.name = recordInDb.getDataValue('customerName');
            newObj.agentId = recordInDb.getDataValue('agentId');
            newObj.fundingCodeId = recordInDb.getDataValue('id');
            newObj.lastModifiedById = recordInDb.getDataValue('agentId');

            const recordCustomerInDb = await modelModule[
              SeqModel.name.Customer
            ].findOne({
              where: {
                address: newObj.address,
                status: CustomerStatus.StatusActive,
              },
            });

            if (recordCustomerInDb) {
              if (recordCustomerInDb.getDataValue('fundingCodeId')) {
                resp = new WarningResponseBase(
                  ServerReturnCode.UniqueViolationError,
                  'Customer already binded funding Code.',
                );
                logger.info(funcMsg + ' - fail ', { message: resp.msg });
              } else {
                newObj.id = recordCustomerInDb.getDataValue('id');
                newObj.lastModifiedById = recordCustomerInDb.getDataValue('id');

                backupCustomer.address =
                  recordCustomerInDb.getDataValue('address');
                backupCustomer.name =
                  recordCustomerInDb.getDataValue('customerName');
                backupCustomer.agentId =
                  recordCustomerInDb.getDataValue('agentId');
                backupCustomer.leverage =
                  recordCustomerInDb.getDataValue('leverage');
                backupCustomer.maxFunding =
                  recordCustomerInDb.getDataValue('maxFunding');
                backupCustomer.creditMode =
                  recordCustomerInDb.getDataValue('creditMode');
                backupCustomer.contractStatus =
                  recordCustomerInDb.getDataValue('contractStatus');
                backupCustomer.riskLevel =
                  recordCustomerInDb.getDataValue('riskLevel');
                backupCustomer.fundingCodeId =
                  recordCustomerInDb.getDataValue('fundingCodeId');
                backupCustomer.lastModifiedDate =
                  recordCustomerInDb.getDataValue('lastModifiedDate');
                backupCustomer.lastModifiedById =
                  recordCustomerInDb.getDataValue('lastModifiedById');
                backupCustomer.status =
                  recordCustomerInDb.getDataValue('status');

                updateCustomerResult = await modelModule[
                  SeqModel.name.Customer
                ].update(newObj, {
                  transaction: t,
                  where: {
                    address: newObj.address,
                  },
                  fields: [
                    'name',
                    'agentId',
                    'leverage',
                    'contractStatus',
                    'riskLevel',
                    'maxFunding',
                    'creditMode',
                    'fundingCodeId',
                    'lastModifiedDate',
                    'lastModifiedById',
                  ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
                });

                if (!updateCustomerResult) {
                  resp = new WarningResponseBase(
                    ServerReturnCode.UniqueViolationError,
                    'Update Customer Failed',
                  );
                  logger.info(funcMsg + ' - fail ', { message: resp.msg });
                }
              }
            } else {
              if (isNewTransaction) {
                await t.rollback();
              }

              resp = new WarningResponseBase(
                ServerReturnCode.UniqueViolationError,
                'Customer not found',
              );
              logger.info(funcMsg + ' - fail ', { message: resp.msg });

              return resp;
            }

            if (isNewTransaction) {
              await t.commit();
            }

            if (updateCustomerResult) {
              const referralCodeObj = new DBModel.ReferralCode();
              referralCodeObj.isUsed = true;

              t = await seq.sequelize.transaction();

              const receipt: any = await callPool(
                newObj.address,
                newObj.maxFunding,
                newObj.riskLevel,
                newObj.contractStatus,
                newObj.creditMode,
                newObj.leverage,
                // logger,
                // new DBModel.CustomerCreditUpdate(),
              );

              if (receipt && receipt.status) {
                if (referralCodeType == ReferralCodeType.OneTimeUse) {
                  const updateResult: any = await modelModule[
                    SeqModel.name.FundingCode
                  ].update(referralCodeObj, {
                    transaction: t,
                    where: {
                      id: newObj.fundingCodeId?.toString(),
                      codeStatus: FundingCodeCodeStatus.StatusActive,
                      status: FundingCodeStatus.StatusActive,
                      isUsed: false,
                    },
                    fields: ['isUsed', 'lastModifiedDate'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
                  });
                }

                resp.success = true;
                resp.msg = `Funding Code used successfully.`;
                logger.info(funcMsg + ' - success ', { message: resp.msg });
              } else {
                updateCustomerResult = await modelModule[
                  SeqModel.name.Customer
                ].update(backupCustomer, {
                  transaction: t,
                  where: {
                    address: newObj.address,
                  },
                  fields: [
                    'address',
                    'name',
                    'agentId',
                    'leverage',
                    'maxFunding',
                    'creditMode',
                    'contractStatus',
                    'riskLevel',
                    'fundingCodeId',
                    'lastModifiedDate',
                    'lastModifiedById',
                  ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
                });

                resp = new WarningResponseBase(
                  ServerReturnCode.UniqueViolationError,
                  'Update contract failed',
                );
                logger.info(funcMsg + ' - fail ', { message: resp.msg });
              }
              if (isNewTransaction) {
                await t.commit();
              }
            }
          } else {
            resp = new WarningResponseBase(
              ServerReturnCode.UniqueViolationError,
              'Referral Code was used, please try a new code!',
            );
            logger.info(funcMsg + ' - fail ', { message: resp.msg });
            if (isNewTransaction) {
              await t.rollback();
            }
          }
        } else {
          logger.info(`ReferralCode not found`);
        }
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'generate funding code fail :' + e,
      );

      if (isNewTransaction) {
        await t.rollback();
      }
    }

    return resp;
  }

  async getAllFundingCode(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const recordInDb = await modelModule[SeqModel.name.Customer].findOne({
      where: {
        id: query.id,
      },
    });

    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'status',
      FundingCodeStatus.StatusActive,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'agentId',
      recordInDb?.getDataValue('agentId'),
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'agentType',
      AgentType.MST,
    );

    const results: any = await modelModule[
      SeqModel.name.FundingCode
    ].findAndCountAll({
      include: [
        {
          attributes: ['address'],
          model: modelModule[SeqModel.name.Customer],
          where: Sequelize.literal(
            '"t_decats_funding_code"."type" = ' +
              "'" +
              FundingCodeTypeStatus.OneTimeUse.toString() +
              "'",
          ),
          required: false,
          as: 'customer',
        },
        {
          attributes: ['address'],
          model: modelModule[SeqModel.name.Agent],
          where: Sequelize.literal(
            '"t_decats_funding_code"."type" = ' +
              "'" +
              FundingCodeTypeStatus.OneTimeUse.toString() +
              "'",
          ),
          required: false,
          as: 'AgentfundingCode',
        },
      ],
      raw: true,
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['created_date', 'DESC']],
    });

    return results;
  }

  async genFundingCode(
    obj: DBModel.FundingCode,
    id: number,
    t?: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[CustomerService][genFundingCode](id : ${id})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    // const t = await seq.sequelize.transaction();
    let isNewTransaction = false;
    if (!t) {
      t = await seq.sequelize.transaction();
      isNewTransaction = true;
    }
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

    const unixTime = Math.round(new Date().getTime() / 1000);
    // const xxx = Math.round(new Date().getTime() / 1000 / 10000);
    const randomHex = crypto.randomBytes(2).toString('hex');
    const unixTimeHex = unixTime.toString(16);

    try {
      const recordInDb = await modelModule[SeqModel.name.Agent].findOne({
        where: {
          id: id,
        },
        transaction: t,
      });

      if (recordInDb) {
        let checkDuplicatedFundingCode = false;
        const checkFundingCodeInDb = await modelModule[
          SeqModel.name.FundingCode
        ].findOne({
          where: {
            agentId: id,
            agentType: AgentType.MST,
            type: FundingCodeTypeStatus.ForeverUse,
            status: FundingCodeStatus.StatusActive,
          },
          transaction: t,
        });

        if (checkFundingCodeInDb) {
          checkDuplicatedFundingCode = true;
        }

        if (!checkDuplicatedFundingCode) {
          // let hashed: any;
          // if (obj.type == FundingCodeTypeStatus.ForeverUse) {
          //   hashed = await signFundingCode({}, null);
          // } else {
          //   hashed = await signFundingCode({}, dayDiff + 'd');
          // }

          let fundingCode = (randomHex + unixTimeHex).toUpperCase();
          // fundingCode = fundingCode.toUpperCase();
          let isFundingDuplicated = true;

          while (isFundingDuplicated) {
            const checkFundingCodeDuplicated = await modelModule[
              SeqModel.name.FundingCode
            ].findOne({
              where: {
                fundingCode: fundingCode,
                status: FundingCodeStatus.StatusActive,
              },
              transaction: t,
            });

            if (!checkFundingCodeDuplicated) {
              isFundingDuplicated = false;
            } else {
              logger.info(
                `funding code ${fundingCode} is duplicated, regenerate again}`,
              );
              fundingCode = (randomHex + unixTimeHex).toUpperCase();
            }
          }

          const hashed = fundingCode;

          const parentAgentId = recordInDb.getDataValue('parentAgentId');
          let isRootAgent = false;
          if (!parentAgentId) {
            isRootAgent = true;
          }

          obj.agentId = id;
          // obj.hashString = hashString;
          obj.isUsed = false;
          obj.codeStatus = FundingCodeCodeStatus.StatusActive;
          obj.createdDate = dateNow;
          obj.createdById = id;
          obj.lastModifiedDate = dateNow;
          obj.lastModifiedById = id;
          obj.status = FundingCodeStatus.StatusActive;

          if (isRootAgent) {
            obj.agentType = AgentType.MST;
            obj.type = FundingCodeTypeStatus.OneTimeUse;
          } else {
            obj.agentType = recordInDb.getDataValue('agentType');
          }

          if (hashed) {
            const fundingCode: string = hashed.substring(
              hashed.indexOf('.') + 1,
              hashed.length,
            );
            // obj.fundingCode = fundingCode;
            // obj.hashString = hashed.substring(0, hashed.indexOf('.'));
            obj.fundingCode = fundingCode;
            obj.hashString = '';

            const insertResult: any = await modelModule[
              SeqModel.name.FundingCode
            ].create(obj, {
              transaction: t,
            });

            resp.success = true;
            resp.data = fundingCode;
            resp.msg = 'Generate funding code successs';
            logger.info(hashed);
            logger.info(resp.msg);
          } else {
            resp = new WarningResponseBase(
              ServerReturnCode.RecordNotFound,
              'failed to gen funding code',
            );
            logger.info(funcMsg + ' - fail ', { message: resp.msg });
          }
        } else {
          resp = new WarningResponseBase(
            ServerReturnCode.UniqueViolationError,
            'Agent already created funding code',
          );
          logger.info(funcMsg + ' - fail ', { message: resp.msg });
        }
      } else {
        resp = new WarningResponseBase(
          ServerReturnCode.UniqueViolationError,
          'Agent Record not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      }

      if (isNewTransaction) {
        await t.commit();
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'generate funding code fail :' + e,
      );

      if (isNewTransaction) {
        await t.rollback();
      }
    }

    return resp;
  }
}

export async function getWalletOwner(loginAddresss: string) {
  // const RPC_HOST = globalVar.foundationConfig.rpcHost;
  const RPC_HOST = globalVar.foundationConfig.rpcHostHttp;

  const web3 = new Web3(RPC_HOST);

  const abiItems: AbiItem[] = UserWalletAbi.abi as AbiItem[];

  let walletOwner = '';

  try {
    const poolContract = new web3.eth.Contract(abiItems, loginAddresss);
    walletOwner = await poolContract.methods.getWalletOwner().call();
    walletOwner = walletOwner.toLowerCase();
  } catch (e: any) {
    if (
      !e.message.startsWith(
        "Returned values aren't valid, did it run Out of Gas?",
      )
    ) {
      logger.error(e);
    }
  }

  return walletOwner;
}

export async function callPool(
  customer_address: string,
  credit: any,
  newRiskLevel: number,
  newEnableStatus: number,
  newMode: number | string,
  newLeverage: number | string,
  //   newObj: DBModel.CustomerCreditUpdate,
) {
  // const RPC_HOST = globalVar.foundationConfig.rpcHost;
  const HTTP_HOST = globalVar.foundationConfig.rpcHostHttp;
  // const POOL_ADDRESS = foundationConfig.smartcontract.MappedSwap.POOL_ADDRESS;
  const POOL_ADDRESS =
    globalVar.foundationConfig.smartcontract.MappedSwap[
      'OwnedUpgradeableProxy<Pool>'
    ].address;

  const web3 = new Web3(HTTP_HOST);
  // const abiItems: AbiItem[] = abi['abi'] as AbiItem[];
  const abiItems: AbiItem[] = abi as AbiItem[];

  //   const service: Service = new Service();

  try {
    const fromWei = web3.utils.fromWei;

    const pool = new web3.eth.Contract(
      abiItems,
      POOL_ADDRESS,
    ) as any as IPoolAgent;

    // const web3Account = web3.eth.accounts.privateKeyToAccount('5555fe01770a5c6dc621f00465e6a0f76bbd4bc1edbde5f2c380fcb00f354b99');
    // const web3Account = web3.eth.accounts.privateKeyToAccount(
    //   config.poolContract.privateKeyToAccount,
    // );\
    const web3Account = web3.eth.accounts.privateKeyToAccount(
      // foundationConfig.smartcontract.MappedSwap.privateKeyToAccount,
      encryptionKey!,
    );

    logger.info(
      'customer_address: ' +
        customer_address +
        ', newMode: ' +
        newMode +
        ', newLeverage: ' +
        newLeverage +
        ', credit: ' +
        web3.utils.toBN(credit) +
        ', newRiskLevel: ' +
        newRiskLevel +
        ', newEnableStatus: ' +
        newEnableStatus,
    );

    logger.info(
      `current nonce ${exportedNonce} for address ${customer_address}`,
    );

    if (exportedNonce == null) {
      const nonceLoader: NonceLoader = new NonceLoader();
      await nonceLoader.loadNonceIntoMemory();
    }

    if (exportedNonce != null) {
      // const txnData = web3.eth.abi.encodeFunctionCall({
      //     name: "updateCustomerDetails",
      //     type: 'function',
      //     inputs:
      //         [
      //             {
      //             "name": "customer",
      //             "type": "address"
      //             },
      //             {
      //             "name": "newCredit",
      //             "type": "uint256"
      //             },
      //             {
      //             "name": "newRiskLevel",
      //             "type": "int256"
      //             },
      //             {
      //             "name": "newEnableStatus",
      //             "type": "bool"
      //             }
      //         ],
      // }, ["0x39EB6463871040f75C89C67ec1dFCB141C3da1cf", "100", "50", "true"]);
      // // }, [customer_address, newCredit, newRiskLevel, newEnableStatus]);

      // console.log(pool.methods);
      const tx = {
        // this could be provider.addresses[0] if it exists
        from: web3Account.address,
        // target address, this could be a smart contract address
        to: POOL_ADDRESS,
        gasPrice: '0x8F0D1800',
        // optional if you want to specify the gas limit
        gas: '0xAA690',
        // optional if you are invoking say a payable function
        value: '0x00',
        // this encodes the ABI of the method and the arguements
        // data: pool.methods.updateCustomerDetails("0x39EB6463871040f75C89C67ec1dFCB141C3da1cf", "100", "50", true).encodeABI(),
        data: pool.methods
          .updateCustomerDetails(
            customer_address,
            newMode,
            newLeverage,
            web3.utils.toBN(credit),
            newRiskLevel,
            newEnableStatus,
          )
          .encodeABI(),
        // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
        nonce: exportedNonce,
      };

      await addNonce();

      // logger.info('tx');
      logger.info('tx.data: ' + tx.data);

      // const signTxResult: transactionHash = await web3Account.signTransaction(tx);
      const signTxResult: any = await web3Account.signTransaction(tx);
      logger.info(
        'signTxResult.transactionHash: ' + signTxResult.transactionHash,
      );

      // newObj.txHash = signTxResult.transactionHash;
      // await service.createCustomerCreditHistory(newObj, null);

      const myReceipt: any = await web3.eth
        .sendSignedTransaction(signTxResult.rawTransaction)
        .on('transactionHash', function (transactionHash) {
          logger.info('transactionHash: ' + transactionHash);
        })
        .on('receipt', function (receipt) {
          logger.info('receipt: ' + receipt.status);
          return receipt;
        });

      return myReceipt;
    } else {
      return null;
    }
  } catch (e: any) {
    logger.error('callPool: ', e);
    return e;
  }
}
