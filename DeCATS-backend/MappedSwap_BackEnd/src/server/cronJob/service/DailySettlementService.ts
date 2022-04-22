import seq from '../sequelize';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import logger from '../util/ServiceLogger';
import moment from 'moment';
import { Mixed } from '../../../foundation/types/Mixed';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import {
  AgentDailyReportType,
  AgentDailyReportStatus,
} from '../../../general/model/dbModel/AgentDailyReport';
import JSONBig from 'json-bigint';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import TreeHelper from '../../../foundation/utils/TreeHelper';
import TxnReceiptHelper from '../../../foundation/utils/TxnReceiptHelper';
import { createdEventApi } from '../const';
import { calculateRootAgentIncome } from '../util/CommonFunction';
import CronJob, {
  CronJobStatus,
  CronJobType,
} from '../../../general/model/dbModel/CronJob';
import sequelize, { QueryTypes, Transaction } from 'sequelize';
import {
  ErrorResponseBase,
  ResponseBase,
} from '../../../foundation/server/ApiMessage';
import { Op } from 'sequelize';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import {
  AccumalativeAmount,
  AccumalativeAmountResult,
  CronJobDaysRange,
  ReportDirectAmt,
  ReportDirectFee,
  TokenAmt,
  TokenWithMSTExchangeRate,
} from '../model/DailySettlement';
import Big from 'big.js';
import foundationConst from '../../../foundation/const/index';
import { CronJobReq, CronJobReqDailySettlement } from '../model/CronJobReq';
import { AgentType } from '../../../general/model/dbModel/Agent';
import { MSTDistRule } from '../../../general/model/dbModel/0_index';
import ArrayHelper from '../../../foundation/utils/ArrayHelper';
import AgentDailyReport from '../../../general/model/dbModel/AgentDailyReport';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import IStakingArtifact from '../../../abi/IStaking.json';
import { IStaking } from '../../../@types/IStaking.d';
import globalVar from '../const/globalVar';
import {
  crytoDecimalNumber,
  crytoDecimalPlace,
} from '../../../general/model/dbModel/Prices';
import MstPrice, {
  MstPriceStatus,
} from '../../../general/model/dbModel/MstPrice';

export default class Service {
  commissionRates: AccumalativeAmount[];
  combineDbRecords: DBModel.AgentDailyReport[];
  dbRecords: DBModel.AgentDailyReport[];
  allTokens: DBModel.Token[];
  funcMsg: string;
  newCronJob?: DBModel.CronJob | undefined;
  sideChainClient?: EthClient; // mainnet/testnet/dev
  mstToUSDRate: Mixed;
  dayRange: {
    realTime: CronJobDaysRange;
    periodically?: CronJobDaysRange;
  };
  modelModule = seq.sequelize.models;
  foundationConfig = globalVar.foundationConfig;
  isRunning: boolean;
  constructor() {
    this.commissionRates = [];
    this.allTokens = [];
    this.combineDbRecords = []; //MST and M
    this.dbRecords = []; //MST or M
    this.funcMsg = `[DailySettlement][createDailySettlement]`;
    this.mstToUSDRate = new Big(0).toString();
    this.dayRange = {
      realTime: new CronJobDaysRange(),
    };
    this.isRunning = false;
  }

  async assignMSTToUSDRate() {
    const dbRecords: any = await this.modelModule[
      SeqModel.name.MstPrice
    ].findOne({
      where: {
        status: MstPriceStatus.StatusActive,
      },
    });
    if (dbRecords) {
      const dbRecord: MstPrice = JSONBig.parse(JSONBig.stringify(dbRecords));
      this.mstToUSDRate = dbRecord.mstPrice;
    } else {
      throw new Error('Cannot find mstToUSDRate');
    }
  }

  async generateFromLastStart() {
    const today = moment().format('YYYY-MM-DD');
    let reqDate;
    let keepGoing = true;
    const query: any = {};
    const generatedDates: string[] = [];
    let lastCronJob: DBModel.CronJob;
    const resp = new ResponseBase();
    while (keepGoing) {
      const dbLastCronJob: any = await this.modelModule[
        SeqModel.name.CronJob
      ].findOne({
        where: {
          [Op.and]: [
            {
              type: CronJobType.DailySettlement,
              status: CronJobStatus.Finished,
            },
          ],
        },
        order: [['createdDate', 'desc']],
      });

      if (dbLastCronJob) {
        lastCronJob = JSON.parse(JSON.stringify(dbLastCronJob));
        reqDate = moment(lastCronJob.createdDate)
          .startOf('day')
          .add(1, 'day')
          .format('YYYY-MM-DD');
      } else {
        reqDate = today;
      }
      const diff = moment(today).diff(reqDate, 'days', false);
      keepGoing = diff >= 0;
      try {
        if (keepGoing) {
          query.createdDate = reqDate;
          const generateReport = await this.createDailySettlement(query);
          generatedDates.push(reqDate);
        } else {
          resp.success = true;
          resp.msg =
            generatedDates.length > 0
              ? `[generateFromLastStart]: No left dates for generation`
              : `[generateFromLastStart][GeneratedDates]:${generatedDates.join(
                  ',',
                )}`;
          logger.info('[generateFromLastStart][Success]');
          logger.info(
            `[generateFromLastStart][GeneratedDates]:${generatedDates.join(
              ',',
            )}`,
          );
        }
      } catch (e) {
        logger.error(e);
        logger.error('[generateFromLastStart][Fail]');
        resp.msg = `[generateFromLastStart][Fail], Finished dates [${generatedDates.join(
          ',',
        )}]`;
        break;
      }
    }
    return resp;
  }
  refreshCombindData() {
    this.combineDbRecords = [];
  }

  refreshData() {
    this.commissionRates = [];
    this.dbRecords = [];
    this.allTokens = [];
    this.funcMsg = `[DailySettlement][createDailySettlement]`;
    this.mstToUSDRate = new Big(0).toString();
  }

  async createRealTimeOrInsert(query: CronJobReqDailySettlement) {
    logger.info('createRealTimeOrInsert');
    let resp = new ResponseBase();
    const currentDateTime = moment();

    resp = await this.createDailySettlement(query);

    return resp;
  }

  async createNewCronJob(cronJobOptions: DBModel.CronJob) {
    //Create a cron job
    return await this.modelModule[SeqModel.name.CronJob].create(cronJobOptions);
  }

  async updateCronJobToFinished(id: string, roundId?: string) {
    const cronJob = new CronJob();
    cronJob.id = id;
    cronJob.status = CronJobStatus.Finished;
    cronJob.lastModifiedDate = new Date();
    //Update cronjob status to processing. because we are about ot generate report

    const updateResult: any = await this.modelModule[
      SeqModel.name.CronJob
    ].update(cronJob, {
      fields: ['status', 'lastModifiedDate'],
      where: { id: cronJob.id },
    });
    const isUpdateSuccess = updateResult[0] > 0 ? true : false;
    if (!isUpdateSuccess) {
      throw new Error('cannot update cron job status to finished');
    }
  }

  async assignDaysRange(createdDate: string) {
    this.dayRange = {
      realTime: new CronJobDaysRange(),
      periodically: undefined,
    };
    this.dayRange.realTime = this.getDayRange(createdDate);
    if (
      this.dayRange.realTime.todayWeekDay ==
      this.dayRange.realTime.weekDayStartInRange
    ) {
      logger.info(
        'today is next day range starts, checking if yesterday agent daily report is wrote',
      );
      const yesterdayEnd = moment(this.dayRange.realTime.yesterday)
        .endOf('day')
        .format('YYYY-MM-DD HH:mm:ss');
      this.dayRange.periodically = this.getDayRange(yesterdayEnd);
      this.dayRange.periodically.now = this.dayRange.realTime.now;
      if (this.dayRange.periodically) {
        let cronJobDataInDb: CronJob | undefined = (await this.modelModule[
          SeqModel.name.CronJob
        ].findOne({
          where: {
            dateFrom: this.dayRange.periodically.dateStart,
            dateTo: this.dayRange.periodically.dateEnd,
          },
        })) as any;
        cronJobDataInDb = JSON.parse(JSON.stringify(cronJobDataInDb));
        const skippedCronJob = [
          CronJobStatus.Finished,
          CronJobStatus.Processing,
          CronJobStatus.Created,
        ];
        if (cronJobDataInDb) {
          if (skippedCronJob.includes(cronJobDataInDb.status)) {
            logger.info(
              `Cron Job in yesterday, ${this.dayRange.periodically.dateStart} - ${this.dayRange.periodically.dateEnd} already generated`,
            );
            this.dayRange.periodically = undefined;
          } else if (cronJobDataInDb.status == CronJobStatus.Fail) {
            logger.info(
              `Cron Job in yesterday, ${this.dayRange.periodically.dateStart} - ${this.dayRange.periodically.dateEnd} is fail`,
            );
          }
        }

        if (this.dayRange.periodically) {
          logger.info(
            `Creating new cron job from ${this.dayRange.periodically.dateStart} - ${this.dayRange.periodically.dateEnd}`,
          );
        }
      }
    }
  }

  async createDailySettlement(
    query: CronJobReqDailySettlement,
  ): Promise<ResponseBase> {
    this.refreshCombindData();
    const distTypes = [AgentDailyReportType.M, AgentDailyReportType.MST];
    this.newCronJob = undefined;
    logger.info('createDatilySettlement starts');
    const resp = new ResponseBase();
    const respMsgs: string[] = [];
    await this.assignDaysRange(query.createdDate);

    try {
      let distType;
      let accumalativeResult: any;
      //Real time
      for (let i = 0; i < distTypes.length; i++) {
        this.refreshData();
        accumalativeResult = await this.getAccumalativeAmount(
          this.dayRange.realTime,
        );
        distType = distTypes[i];
        if (accumalativeResult.isSuccess) {
          this.commissionRates = accumalativeResult.reports;
          if (this.dayRange.realTime) {
            await this.fillInDataForReports(
              distType,
              this.dayRange.realTime,
              false,
            );
          }
        }
      }
      respMsgs.push(
        `Successfully generate real time report for MST ([dateFrom]:${this.dayRange.realTime.dateStart}|[dateTo]:${this.dayRange.realTime.dateEnd}) [createdDate]:${query.createdDate}`,
      );
      //Cron Job
      if (this.dayRange.periodically) {
        this.refreshCombindData();
        for (let i = 0; i < distTypes.length; i++) {
          this.refreshData();
          accumalativeResult = await this.getAccumalativeAmount(
            this.dayRange.periodically,
          );
          distType = distTypes[i];
          if (accumalativeResult.isSuccess) {
            this.commissionRates = accumalativeResult.reports;
            await this.fillInDataForReports(
              distType,
              this.dayRange.periodically,
              true,
            );
          }
        }
        respMsgs.push(
          `Successfully generate periodically time report for MST ([dateFrom]:${this.dayRange.periodically.dateStart}|[dateTo]:${this.dayRange.periodically.dateEnd}) [createdDate]:${query.createdDate}`,
        );
      }
    } catch (e) {
      logger.error(e);
      if (this.dayRange.periodically) {
        await this.revertCronJob(this.dayRange.periodically);
      }
      return new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Create DailySettlements fail :' + e,
      );
    }
    this.refreshData();
    this.refreshCombindData();
    //const ruleMst = await this.modelModule[SeqModel.name.MSTDistRule].findAll();
    resp.success = true;
    resp.respType = 'success';
    resp.msg = respMsgs.join(',');
    resp.data = respMsgs;
    return resp;
  }
  private async revertCronJob(daysRange: CronJobDaysRange) {
    const deleteResult: any = await this.modelModule[
      SeqModel.name.AgentDailyReport
    ].destroy({
      where: { createdDate: daysRange.now },
    });
    if (this.newCronJob && this.newCronJob.id) {
      this.newCronJob.status = CronJobStatus.Fail;
      this.newCronJob.lastModifiedDate = new Date();
      const updateFailResult: any = await this.modelModule[
        SeqModel.name.CronJob
      ].update(this.newCronJob, {
        fields: ['status', 'lastModifiedDate'],
        where: { id: this.newCronJob.id },
      });
    }
  }

  async connectContract() {
    logger.info('Starting to connect web 3 contract');
    const httpProvider = new Web3.providers.HttpProvider(
      this.foundationConfig.rpcHostHttp,
      foundationConst.web3webSocketDefaultOption,
    );
    this.sideChainClient = new EthClient(
      httpProvider,
      this.foundationConfig.chainId,
    );
    logger.info(
      `connecting to side chain at ${
        (this.sideChainClient.web3Client.currentProvider as any).url
      }.....`,
    );
    const chainId: any = await this.sideChainClient.web3Client.eth.getChainId();
    const sideChainWeb3Connected = httpProvider.connected;

    if (sideChainWeb3Connected) {
      logger.info(
        `connected to side chain (${chainId}) at ${
          (this.sideChainClient.web3Client.currentProvider as any).url
        }.....`,
      );
    }
  }
  async getAccumalativeAmount(daysRange: CronJobDaysRange) {
    let nextFunc = false;
    try {
      const sql = `   
                      DROP TABLE IF EXISTS temp_agent_node;
                      CREATE TEMP TABLE temp_agent_node
                      (
                        id bigint,
                        parent_agent_id  bigint,
                        agent_type smallint,
                        interest_percentage decimal,
                        fee_percentage  decimal,
                        name varchar(100),
                        amount decimal,
                        node varchar(1000)
                      );
                      with recursive cte as
                                            (
                                        select
                                          v.id,
                                          v.parent_agent_id ,
                                          v.agent_type,
                                          v.interest_percentage,
                                          v.fee_percentage,
                                          v."name" ,
                                          SUM(case when sell_token = 'USDM' then sell_amount else buy_amount end ) as amount,
                                          concat ('/',
                                          cast(v.id as varchar),
                                          '/' ) node
                                        from
                                          t_decats_agents v
                                        left join t_decats_transactions tdt on
                                          v.id = tdt.agent_id
                                          and tdt.created_date between  :dateFrom and :dateTo
                                        where
                                          parent_agent_id is null
                                        group by
                                          v.id
                                        union all
                                        select
                                          t2.id,
                                          t2.parent_agent_id,
                                          t2.agent_type,
                                          t2.interest_percentage,
                                          t2.fee_percentage,
                                          t2."name",
                                          t2."amount",
                                          concat (c."node",
                                          cast(t2.id as varchar),
                                          '/' ) node
                                        from
                                          (
                                          select
                                            v.id,
                                            v.parent_agent_id,
                                            v.agent_type,
                                            v.interest_percentage,
                                            v.fee_percentage,
                                            v."name",
                                            SUM(case when sell_token = 'USDM' then sell_amount else buy_amount end ) as amount
                                          from
                                            t_decats_agents v
                                          left join t_decats_transactions tdt on
                                            v.id = tdt.agent_id
                                            and tdt.created_date between  :dateFrom and :dateTo
                                          group by
                                            v.id) as t2
                                        join cte c on
                                          t2.parent_agent_id = c.id
                                            )
                      insert into temp_agent_node
                      select id,parent_agent_id ,agent_type ,interest_percentage,fee_percentage ,"name",coalesce(amount, 0) ,node from cte;
                      CREATE INDEX temp_agent_node_index_1
                        ON temp_agent_node
                        USING BTREE
                        (node);
                      CREATE INDEX temp_agent_node_index_2
                        ON temp_agent_node
                        USING BTREE
                        (id);
                      
                      
                      select
                      tda.id,
                      tda.address,
                      tda.parent_agent_id as "parentAgentId",
                      tda.agent_type as "agentType",
                      tda.interest_percentage "interestPercentage",
                      tda.fee_percentage "feePercentage",
                      tda."name",
                      MIN(c1.amount) as amount,	--self_amount
                      SUM(coalesce(c2.amount, 0)) as sub_amount,		--sub_agent_amount
                      MIN(c1.amount) + SUM(coalesce(c2.amount, 0)) "accumalativeUSDMAmt"
                    from
                      temp_agent_node c1
                    left outer join temp_agent_node c2 on
                      c1.node <> c2.node
                      and left(c2.node, LENGTH(c1.node)) = c1.node
                    inner join t_decats_agents tda on
                      tda.id = c1.id
                    group by
                      tda.id
                    order by
                      tda.id;
      `;
      const whereDateFrom = daysRange.dateStart;
      const whereDateTo = daysRange.dateEnd;
      const funcCall: any = await seq.sequelize.query(sql, {
        replacements: {
          dateFrom: whereDateFrom,
          dateTo: whereDateTo,
        },
        raw: false,
        type: QueryTypes.SELECT,
      });
      const funcResult = funcCall;
      if (funcResult.length > 0) {
        logger.info(
          `[Success] - getAccumalativeAmount, length ${funcResult.length}`,
        );
        nextFunc = true;
      } else {
        logger.error(`[Fail] - getAccumalativeAmount`);
        nextFunc = true;
      }
      return {
        isSuccess: nextFunc,
        reports: funcResult ? funcResult : [],
      };
    } catch (ex) {
      //await t.rollback();
      return {
        isSuccess: false,
        reports: [],
      };
    }
  }

  // async getAccumalativeAmount(
  //   daysRange: CronJobDaysRange,
  // ): Promise<AccumalativeAmountResult> {
  //   let nextFunc = false;
  //   const sql = `with recursive cte as
  //                (
  //                   select
  //                     v.id,
  //                     v.address ,
  //                     v.parent_agent_id ,
  //                     v.agent_type,
  //                     v.interest_percentage,
  //                     v.fee_percentage,
  //                     v."name" ,
  //                     SUM(case when sell_token = 'USDM' then sell_amount else buy_amount end ) as amount,
  //                     concat ('/',
  //                     cast(v.id as varchar),
  //                     '/' ) node
  //                   from
  //                     t_decats_agents v
  //                   left join t_decats_transactions tdt on
  //                     v.id = tdt.agent_id
  //                     and tdt.created_date between :dateFrom and :dateTo
  //                   where
  //                     parent_agent_id is null
  //                   group by
  //                     v.id
  //                   union all
  //                   select
  //                     t2.id,
  //                     t2.address,
  //                     t2.parent_agent_id,
  //                     t2.agent_type,
  //                     t2.interest_percentage,
  //                     t2.fee_percentage,
  //                     t2."name",
  //                     t2."amount",
  //                     concat (c."node",
  //                     cast(t2.id as varchar),
  //                     '/' ) node
  //                   from
  //                     (
  //                     select
  //                       v.id,
  //                       v.address,
  //                       v.parent_agent_id,
  //                       v.agent_type,
  //                       v.interest_percentage,
  //                       v.fee_percentage,
  //                       v."name",
  //                       SUM(case when sell_token = 'USDM' then sell_amount else buy_amount end ) as amount
  //                     from
  //                       t_decats_agents v
  //                     left join t_decats_transactions tdt on
  //                       v.id = tdt.agent_id
  //                       and tdt.created_date between :dateFrom and :dateTo
  //                     group by
  //                       v.id) as t2
  //                   join cte c on
  //                     t2.parent_agent_id = c.id
  //                 )
  //                   select
  //                       c1.id,
  //                       c1.address,
  //                       c1.node,
  //                       c1.parent_agent_id as "parentAgentId",
  //                       c1.agent_type as "agentType",
  //                       c1.interest_percentage as "interestPercentage",
  //                       c1.fee_percentage as "feePercentage",
  //                       c1."name",
  //                       coalesce(c1.amount, 0) as amount,
  //                       coalesce( coalesce(c1.amount,0) + SUM(coalesce(c2.amount, 0)), 0) "accumalativeUSDMAmt",
  //                       0 as "mstAmount",
  //                       0 as "commissionRate",
  //                       case when c1.agent_type = 2 then 0 else 100 end as "distMTokenRate",
  //                       0 as "distMSTTokenRate",
  //                       0 as "distType"
  //                     from
  //                       cte c1
  //                     left outer join cte c2 on
  //                       c1.node <> c2.node
  //                       and left(c2.node, LENGTH(c1.node)) = c1.node
  //                     group by
  //                       c1.id,
  //                       c1.node,
  //                       c1.address,
  //                       c1.agent_type,
  //                       c1.interest_percentage,
  //                       c1.fee_percentage,
  //                       c1.parent_agent_id,
  //                       c1."name",
  //                       c1.amount
  //                     order by
  //                       c1.id;
  //   `;
  //   const whereDateFrom = daysRange.dateStart;
  //   const whereDateTo = daysRange.dateEnd;
  //   const funcCall: any = await seq.sequelize.query(sql, {
  //     replacements: {
  //       dateFrom: whereDateFrom,
  //       dateTo: whereDateTo,
  //     },
  //   });
  //   const funcResult = funcCall[0];
  //   if (funcResult.length > 0) {
  //     logger.info(
  //       `[Success] - getAccumalativeAmount, length ${funcResult.length}`,
  //     );
  //     nextFunc = true;
  //   } else {
  //     logger.error(`[Fail] - getAccumalativeAmount`);
  //     nextFunc = true;
  //   }
  //   return {
  //     isSuccess: nextFunc,
  //     reports: funcResult ? funcResult : [],
  //   };
  // }
  private async fillInMstAmount() {
    let userStakedAmt: any = '';
    //const zeros = 10 ** decimals; //10 ^ decimals
    if (this.commissionRates.find((x) => x.agentType == AgentType.MST)) {
      const contractAddr =
        this.foundationConfig.smartcontract.MappedSwap[
          'OwnedUpgradeableProxy<Staking>'
        ].address;
      const abiItems: AbiItem[] = IStakingArtifact as AbiItem[];
      const tokenAddr: string =
        this.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<MST>']
          .address;
      const contract = new this.sideChainClient!.web3Client.eth.Contract(
        abiItems,
        contractAddr,
      ) as any;

      const stakingContract: IStaking = contract as any;
      for (let i = 0; i < this.commissionRates.length; i++) {
        if (this.commissionRates[i].agentType == AgentType.MST) {
          //For testing, uncomment in production
          userStakedAmt = null;
          userStakedAmt = (
            await stakingContract.methods
              .getUserStaking(tokenAddr, this.commissionRates[i].address)
              .call()
          ).totalStaked;
          logger.info(
            `Staked MST For (${this.commissionRates[i].id}) ${this.commissionRates[i].address} - ${userStakedAmt}`,
          );
          this.commissionRates[i].mstAmount = userStakedAmt;
          // this.commissionRates[i].mstAmount = 100000;
        }
      }
    }
  }
  async getCommissionRate(distType: AgentDailyReportType) {
    const rules: any = await this.modelModule[
      SeqModel.name.MSTDistRule
    ].findAll({
      order: [['grade', 'asc']],
    });
    this.commissionRates.forEach((x) => {
      x.distType = distType;
      if (x.agentType == AgentType.MST) {
        //let weekAmtRate = 0;
        //let mstAmtRate = 0;
        let foundWeekAmtRate = false;
        let foundMstAmtRate = false;
        let mstCommissionRule: MSTDistRule | null = null;
        let weekAmtRule: MSTDistRule | null = null;
        let chosenRule: MSTDistRule | null = null;
        let weekAmt: any = '';
        let holdMST: any = '';
        for (let i = 0; i < rules.length; i++) {
          weekAmt = rules[i].getDataValue('weekAmount');
          holdMST = rules[i].getDataValue('holdMST');
          //Loop through rules to found the greatest commission rate
          //from week accumulative amount
          if (!foundWeekAmtRate) {
            if (new Big(x.accumalativeUSDMAmt).gte(weekAmt)) {
              foundWeekAmtRate = true;
              weekAmtRule = JSONBig.parse(JSON.stringify(rules[i]));
              x.txFeeGrade = weekAmtRule!.grade;
              //weekAmtRate = Number(rules[i].commissionRate);
            }
          }
          //Loop through rules to found the greatest mst rate
          //from agent mst staked
          if (!foundMstAmtRate) {
            if (new Big(x.mstAmount).gte(holdMST)) {
              foundMstAmtRate = true;
              mstCommissionRule = JSONBig.parse(JSON.stringify(rules[i]));
              x.stakedMSTGrade = mstCommissionRule!.grade;
              //mstAmtRate = Number(rules[i].commissionRate);
            }
          }

          if (foundMstAmtRate && foundWeekAmtRate) {
            break;
          }
        }
        // If weekAmtRate>mstAmtRate, then use weekAmtRate as commissionRate,interestPercentage,feePercentage
        // Otherwise use mstAmtRate as commissionRate,interestPercentage,feePercentage
        if (!foundWeekAmtRate) {
          weekAmtRule = new MSTDistRule();
        }
        if (!foundMstAmtRate) {
          mstCommissionRule = new MSTDistRule();
        }
        chosenRule = new Big(weekAmtRule!.commissionRate).gt(
          new Big(mstCommissionRule!.commissionRate),
        )
          ? weekAmtRule
          : mstCommissionRule;
        x.commissionRate = new Big(chosenRule!.commissionRate).toString();
        x.distMTokenRate = new Big(chosenRule!.distMTokenRate).toString();
        x.distMSTTokenRate = new Big(chosenRule!.distMSTTokenRate).toString();
        //x.interestPercentage = x.commissionRate;
        //x.feePercentage = x.commissionRate;
        const percentage =
          distType == AgentDailyReportType.M
            ? x.distMTokenRate
            : x.distMSTTokenRate;
        x.interestPercentage = percentage;
        x.feePercentage = percentage;
        x.stakedMst = x.mstAmount ? x.mstAmount : '0';
        x.grade = chosenRule!.grade
          ? chosenRule!.grade
          : rules[rules.length - 1].grade; //default grade is 10
      }
    });
  }

  async fillInExchangeRate(
    tokens: DBModel.Token[],
  ): Promise<TokenWithMSTExchangeRate[]> {
    const tokenWithExchangeRate: TokenWithMSTExchangeRate[] = tokens as any;
    const usdm =
      this.foundationConfig.smartcontract.MappedSwap[`OwnedBeaconProxy<USDM>`];
    const ethm =
      this.foundationConfig.smartcontract.MappedSwap[`OwnedBeaconProxy<ETHM>`];
    const btcm =
      this.foundationConfig.smartcontract.MappedSwap[`OwnedBeaconProxy<BTCM>`];
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
    let prices: any[] = await this.modelModule[SeqModel.name.Prices].findAll(
      {},
    );
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
        const mTokenToUSDRateInHumanReadable = mTokenToUSDRateInDecimals.div(
          crytoDecimalNumber.BTCM,
        );
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
        const mTokenToUSDRateInHumanReadable = mTokenToUSDRateInDecimals.div(
          crytoDecimalNumber.ETHM,
        );
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
    return tokenWithExchangeRate;
  }
  async addTokenToEachAgent() {
    let tokens: any = await this.modelModule[SeqModel.name.Token].findAll({
      where: {
        name: {
          [Op.not]: 'MST',
        },
      },
    });
    tokens = JSON.parse(JSON.stringify(tokens));
    const tokensWithMSTExangeRate: TokenWithMSTExchangeRate[] =
      await this.fillInExchangeRate(tokens);
    const brandNewTokenAmts: TokenAmt[] = tokens.map(
      (x: TokenWithMSTExchangeRate) => {
        return {
          token: x.name,
          toUSDMExchangeRate: x.toUSDMExchangeRate,
          directUsedFee: 0,
          allSubAgentDirectUsedFee: 0,
          //Transaction fee
          turnOver: 0,
          directFee: 0,
          directFeeIncome: 0,
          allSubAgentFee: 0,
          allSubAgentOwnedFee: 0,
          allSubAgentFeeIncome: 0,
          allChildAgentFeeIncome: 0,
          //Interest
          directInterest: 0,
          directInterestIncome: 0,
          allSubAgentInterest: 0,
          allSubAgentOwnedInterest: 0,
          allSubAgentInterestIncome: 0,
          allChildAgentInterestIncome: 0,
          feeIncome: 0,
          netFeeIncome: 0,
          netAgentFeeIncome: 0,
          interestIncome: 0,
          netInterestIncome: 0,
          netAgentInterestIncome: 0,
          totalIncome: 0,
        };
      },
    );
    this.allTokens = tokens;
    this.commissionRates.forEach(
      (x) =>
        (x.tokenAmts = JSONBig.parse(JSONBig.stringify(brandNewTokenAmts))),
    );
  }

  async fillInDirectUsedFee() {
    const sql = ` select 
                      agent_id as "agentId", 
                      "name" as "token",
                      direct_used_fee as "amt"
                  from t_decats_tokens t_token 
                  left join 
                  (
                      select
                                      "token",
                                      agent_id,
                                      sum(case when balance >= 0 then 0 else balance * -1 end) as direct_used_fee
                      from
                                      t_decats_balances tdb
                      where
                                      tdb.customer_id in(
                          select
                                          id as customer_id
                          from
                                          t_decats_customers tdc

                      )
                      group by
                          "token",agent_id
                  ) direct_info on t_token."name"=direct_info."token" where direct_used_fee<>0 and  "name" <> 'MST'`;

    const directUsedFees: ReportDirectAmt[] = await seq.sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
    const nonZeroDirectUsedFees = directUsedFees.filter((x) => x.amt != 0);
    for (let i = 0; i < nonZeroDirectUsedFees.length; i++) {
      const reportOfAgent = this.commissionRates.find(
        (x) => x.id == nonZeroDirectUsedFees[i].agentId,
      );
      if (reportOfAgent) {
        const foundAmt = reportOfAgent.tokenAmts.find(
          (x) => x.token == nonZeroDirectUsedFees[i].token,
        );
        if (foundAmt) {
          foundAmt.directUsedFee = new Big(nonZeroDirectUsedFees[i].amt)
            .round()
            .toString();
        }
      }
    }
  }
  async fillInDirectFee(dayRange: CronJobDaysRange) {
    logger.info(
      `FillInDirectFee from ${dayRange.dateStart} - ${dayRange.dateEnd}`,
    );
    const txFeePercentage = 0.003;
    const sql = `
      select
        tdt.agent_id as "agentId",
        sell_token as "token",
        sum(sell_amount) as "turnOver",
        (sum(sell_amount) * ${txFeePercentage}) as "amt"
      from
        t_decats_transactions tdt
      inner join t_decats_agents a on
        a.id = tdt.agent_id
      where
        tdt.created_date::date between :dateFrom and :dateTo
      group by
        agent_id,
        sell_token
    `;

    const directFees: ReportDirectFee[] = await seq.sequelize.query(sql, {
      type: QueryTypes.SELECT,
      replacements: {
        dateFrom: dayRange.dateStart,
        dateTo: dayRange.dateEnd,
      },
    });
    const nonZeroFees = directFees.filter((x) => x.amt != 0);
    for (let i = 0; i < nonZeroFees.length; i++) {
      const reportOfAgent = this.commissionRates.find(
        (x) => x.id == nonZeroFees[i].agentId,
      );
      if (reportOfAgent) {
        const foundAmt = reportOfAgent.tokenAmts.find(
          (x) => x.token == nonZeroFees[i].token,
        );
        if (foundAmt) {
          foundAmt.turnOver = nonZeroFees[i].turnOver;
          foundAmt.directFee = new Big(nonZeroFees[i].amt).round().toString();
          foundAmt.directFeeIncome = new Big(foundAmt.directFee)
            .mul(new Big(reportOfAgent.feePercentage).div(100))
            .round()
            .toString();
        }
      }
    }
  }

  async fillInDirectInterest(dayRange: CronJobDaysRange) {
    logger.info(
      `FillInDirectFee from ${dayRange.dateStart} - ${dayRange.dateEnd}`,
    );
    const sql = `
                select 
                  agent_id as "agentId", 
                  SUM(interest) as "amt",
                  "token"  
                from t_decats_interest_histories tdih 
                where created_date::date between :dateFrom and :dateTo
                group by
                  agent_id,
                  "token" ;`;
    const directInterests: ReportDirectAmt[] = await seq.sequelize.query(sql, {
      type: QueryTypes.SELECT,
      replacements: {
        dateFrom: dayRange.dateStart,
        dateTo: dayRange.dateEnd,
      },
    });
    const nonZeroInterests = directInterests.filter((x) => x.amt != 0);
    for (let i = 0; i < nonZeroInterests.length; i++) {
      const reportOfAgent = this.commissionRates.find(
        (x) => x.id == nonZeroInterests[i].agentId,
      );
      if (reportOfAgent) {
        const foundAmt = reportOfAgent.tokenAmts.find(
          (x) => x.token == nonZeroInterests[i].token,
        );
        if (foundAmt) {
          foundAmt.directInterest = new Big(nonZeroInterests[i].amt)
            .round()
            .toString();
          foundAmt.directInterestIncome = new Big(foundAmt.directInterest)
            .mul(new Big(reportOfAgent.interestPercentage).div(100))
            .toString();
        }
      }
    }
  }
  async fillInDataForReports(
    distType: AgentDailyReportType,
    daysRange: CronJobDaysRange,
    insertPeriodicallyReport: boolean,
  ) {
    await this.assignMSTToUSDRate();
    await this.connectContract(); //Connect MST Contract
    await this.fillInMstAmount(); // Get MST staking amount
    await this.getCommissionRate(distType); // MST customer commission rate
    await this.addTokenToEachAgent();
    await this.fillInDirectUsedFee(); // fill funding used
    //Allow dateFrom and dateTo
    await this.fillInDirectFee(daysRange); // fill direct fee
    await this.fillInDirectInterest(daysRange); // fill direct interest

    //Build tree with default tree level
    const originalTree = TreeHelper.flattenToTree(
      this.commissionRates,
      'id',
      'children',
      'parentAgentId',
    );
    const token = ['USDM', 'ETHM', 'BTCM'];
    for (let i = 0; i < token.length; i++) {
      // fill in allAgentFee, allAgentInterest and allAgentFundingUsed before sorting by commission rate
      this.fillInSubAgentAmt(originalTree[0], token[i]);
    }
    const flatTree: AccumalativeAmount[] = TreeHelper.flatten(
      originalTree,
      'children',
    );

    //13. Filter out agentType=2 records from flatten array, named commissionArray
    const commissionArray: AccumalativeAmount[] = flatTree.filter(
      (x) => x.agentType == AgentType.MST,
    );
    const rootAgent: AccumalativeAmount | undefined = flatTree.find(
      (x) => x.parentAgentId == null,
    );
    if (rootAgent) {
      rootAgent.commissionRate = '100';
      commissionArray.push(rootAgent);
      //14. Flatten to commissionArray for a tree
      const commissionArrayTree = TreeHelper.flattenToTree(
        commissionArray,
        'id',
        'children',
        'parentAgentId',
      );
      //15. Traverse the tree to sort it by commission rate
      this.moveUpwards(commissionArrayTree[0], commissionArrayTree[0], null);
      //16. Move upwards based on commission rate
      const treeOfMSTAgents = commissionArrayTree[0];
      //17. Flatten to tree for commissionArray
      const flattenMSTAgents: AccumalativeAmount[] = TreeHelper.flatten(
        commissionArrayTree,
        'children',
      );
      //Replace each rows of commissionArray to the original array based on id
      for (let i = 0; i < flattenMSTAgents.length; i++) {
        for (let y = 0; y < flatTree.length; y++) {
          if (flatTree[y].id == flattenMSTAgents[i].id) {
            flatTree[y] = flattenMSTAgents[i];
            break;
          }
        }
      }
      //To tree again
      const finalTree = TreeHelper.flattenToTree(
        flatTree,
        'id',
        'children',
        'parentAgentId',
      );
      let interestPercentageSuccess = false;
      let feePercentageSuccess = false;
      this.validateNodeHierarchy(finalTree[0], null, 'interestPercentage');
      logger.info('Validate success for interestPercentage');
      interestPercentageSuccess = true;
      this.validateNodeHierarchy(finalTree[0], null, 'feePercentage');
      feePercentageSuccess = true;
      logger.info('Validate success for feePercentage');
      // console.log(flatTree.map((x) => x.id + ':' + x.feePercentage).join('|'));
      // calculate all again, after sorting the tree
      for (let i = 0; i < token.length; i++) {
        this.fillInSubAgentOwnedAmt(finalTree[0], null, token[i]);
      }

      const finalTreeFlatten: AccumalativeAmount[] = TreeHelper.flatten(
        finalTree,
        'children',
      );
      //let tokenAmt: any = '';
      const sorted: AccumalativeAmount[] = ArrayHelper.sortByKey(
        finalTreeFlatten,
        'id',
        'Number',
      );
      for (let i = 0; i < sorted.length; i++) {
        for (let y = 0; y < sorted[i].tokenAmts.length; y++) {
          const tokenAmt: TokenAmt = sorted[i].tokenAmts[y];
          // direct interest income
          tokenAmt.directInterestIncome = new Big(
            tokenAmt.directInterest as string,
          )
            .mul(new Big(Number(sorted[i].interestPercentage) / 100))
            .round()
            .toString();
          //  direct fee income
          tokenAmt.directFeeIncome = new Big(tokenAmt.directFee as string)
            .mul(new Big(Number(sorted[i].feePercentage) / 100))
            .round()
            .toString();

          // all subagent owned interest income
          tokenAmt.allSubAgentInterestIncome = new Big(
            tokenAmt.allSubAgentOwnedInterest as string,
          )
            .mul(new Big(Number(sorted[i].interestPercentage) / 100))
            .round()
            .toString();
          // all subagent owned agent fee income
          tokenAmt.allSubAgentFeeIncome = new Big(
            tokenAmt.allSubAgentOwnedFee as string,
          )
            .mul(new Big(Number(sorted[i].feePercentage) / 100))
            .round()
            .toString();
        }
      }
      let dbRecords = this.separateTokenIntoDbModelRows(
        finalTreeFlatten,
        daysRange,
      );
      dbRecords = calculateRootAgentIncome(dbRecords, false);
      dbRecords = ArrayHelper.sortByKey(dbRecords, 'id', 'Number');
      this.combineDbRecords = this.combineDbRecords.concat(dbRecords);
      if (distType == AgentDailyReportType.MST) {
        if (insertPeriodicallyReport) {
          await this.insertToPeriodicallyTable(this.combineDbRecords);
          logger.info(
            `Successfully insert to periodically table :
              [${this.combineDbRecords.map((x) => `${x.agentId}`).join(',')}]
              `,
          );
          logger.info('Creating new cron job');
          const newJob: any = {
            desc: `${this.funcMsg} ${daysRange.dateStart} - ${daysRange.dateEnd}`,
            extra: ``,
            createdDate: daysRange.now,
            dateFrom: daysRange.dateStart,
            dateTo: daysRange.dateEnd,
            status: CronJobStatus.Created, //Means haven' t approve
            lastModifiedDate: daysRange.dateEnd,
            cid: null,
            type: CronJobType.DailySettlement,
          };
          this.newCronJob = (await this.createNewCronJob(newJob)) as any;
          this.newCronJob = JSONBig.parse(JSONBig.stringify(this.newCronJob));
          logger.info(
            `New cron job generated (${this.newCronJob!.id}), ${newJob.desc}`,
          );
          await this.updateCronJobIdToAgentDailyReports(this.newCronJob!);
        } else {
          await this.insertToRealTimeTable(this.combineDbRecords);
          logger.info(
            `Successfully insert to real time table : 
              [${this.combineDbRecords.map((x) => `${x.agentId}`).join(',')}]
              `,
          );
        }
      }
    }
    logger.info(`[fillInDataForReports][Finished] `);
  }

  private async updateCronJobIdToAgentDailyReports(cronJob: CronJob) {
    const funcMsg = `[CommissionJobService][updateCronJobIdToAgentDailyReports]`;

    //Update cronjob status to processing. because we are about ot generate report
    const updateResult: any = await this.modelModule[
      SeqModel.name.AgentDailyReport
    ].update(
      { cronJobId: cronJob.id! },
      {
        fields: ['cronJobId', 'lastModifiedDate'],
        where: { createdDate: cronJob.createdDate },
      },
    );
    const isUpdateSuccess = updateResult[0] > 0 ? true : false;
    if (!isUpdateSuccess) {
      logger.error(funcMsg, { message: ' - fail' });
      throw new Error('Cannot update cron job id to agentDaily reports');
    }
  }

  validateNodeHierarchy(
    node: AccumalativeAmount,
    parent: AccumalativeAmount | null,
    fieldName: string,
  ) {
    if (node.children) {
      node.children.forEach((child) => {
        this.validateNodeHierarchy(child, node, fieldName);
      });
    }

    if (parent) {
      const childrenBetterThanParent = parent.children.filter((x) =>
        new Big(x[fieldName]).gt(new Big(parent[fieldName])),
      );
      if (childrenBetterThanParent.length > 0) {
        throw new Error(
          `Child node' s ${fieldName} (${childrenBetterThanParent
            .map((x) => `[${x.id} - ${x[fieldName]}]`)
            .join(', ')}) greater than parent ${fieldName} (${parent.id} - ${
            parent[fieldName]
          })`,
        );
      }
    }
  }

  // prettier-ignore
  fillInSubAgentAmt(
    r: AccumalativeAmount, //root
    token: string,
   
  ) {


    const tokenAmt:TokenAmt= r.tokenAmts.find(x=>x.token==token) as TokenAmt;
    if (r.children) {
      r.children.forEach((child) => {
        const accumulativeObj = this.fillInSubAgentAmt(child,token);
        tokenAmt.allSubAgentFee =new Big(tokenAmt.allSubAgentFee  as string).plus(new Big(accumulativeObj.allSubAgentFee as any)).toString();
        tokenAmt.allSubAgentInterest =new Big(tokenAmt.allSubAgentInterest  as string).plus(new Big(accumulativeObj.allSubAgentInterest as any)).toString();
        // funding used
        tokenAmt.allSubAgentDirectUsedFee =new Big(tokenAmt.allSubAgentDirectUsedFee as string).plus(new Big(accumulativeObj.allSubAgentDirectUsedFee as any)).toString();
      });
    }
    // finally, add direct fee and interest
    const lastObj = {
      allSubAgentFee :  new Big(tokenAmt!.allSubAgentFee  as string).plus(new Big(tokenAmt!.directFee  as string)),
      allSubAgentInterest :new Big(tokenAmt!.allSubAgentInterest as string).plus(new Big(tokenAmt!.directInterest  as string)), 
      allSubAgentDirectUsedFee : new Big(tokenAmt!.allSubAgentDirectUsedFee as string).plus(new Big(tokenAmt!.directUsedFee  as string)),
    };
    
    return lastObj;
}

  // prettier-ignore
  fillInSubAgentOwnedAmt(
  r: AccumalativeAmount, //root
  parent: AccumalativeAmount | null, //root,
  token: string,
) {
  const tokenAmt:TokenAmt= r.tokenAmts.find(x=>x.token==token) as TokenAmt;
  if (r.children) {
    r.children.forEach((child) => {
      const accumulativeObj = this.fillInSubAgentOwnedAmt(child,r,token);
    
      //Recursion over
      tokenAmt.allSubAgentOwnedFee = new Big(tokenAmt.allSubAgentOwnedFee as string).plus(new Big(accumulativeObj.allSubAgentOwnedFee)).toString();
      tokenAmt.allSubAgentOwnedInterest = new Big(tokenAmt.allSubAgentOwnedInterest as string).plus(new Big(accumulativeObj.allSubAgentOwnedInterest)).toString(); 
     
    });
  }
  if(parent){
    //calculate parent' s child income
    //Multiple child might use same parent, so need to sum from parent allChildAgentFeeIncome/allChildAgentInterestIncome
    //allChildAgentFeeIncome is each child' s (direct fee + subAgentFeeOwned) * (child' s fee percentage)
    //allChildAgentInterestIncome is each child' s (direct interest + subAgentInterestOwned) * (child' s fee percentage)
    
    const parentTokenAmt:TokenAmt= parent.tokenAmts.find(x=>x.token==token) as TokenAmt;
    //parentTokenAmt.allChildAgentFeeIncome= new Big(parentTokenAmt.allChildAgentFeeIncome as string).plus(new Big(tokenAmt.allSubAgentOwnedFee!).plus(new Big(tokenAmt.turnOver as string).mul(0.003)).mul(Number(r.feePercentage)/100)).toString();
   // parentTokenAmt.allChildAgentInterestIncome= new Big(parentTokenAmt.allChildAgentInterestIncome as string).plus(new Big(tokenAmt.allSubAgentOwnedInterest!).plus(new Big(tokenAmt.directInterest as string)).mul(Number(r.interestPercentage)/100)).toString();
    
    // Commission fee belongs to children
   

    parentTokenAmt.allChildAgentFeeIncome = new Big(parentTokenAmt.allChildAgentFeeIncome as string)
        .plus(
            new Big(tokenAmt.allSubAgentOwnedFee!)
              .plus(new Big(tokenAmt.directFee as string))
              .mul(Number(r.feePercentage)/100)
          ).toString();

    // Interest belongs to children
    parentTokenAmt.allChildAgentInterestIncome = new Big(parentTokenAmt.allChildAgentInterestIncome as string)
        .plus(
            new Big(tokenAmt.allSubAgentOwnedInterest!)
              .plus(new Big(tokenAmt.directInterest as string))
              .mul(Number(r.interestPercentage)/100)
          ).toString();
  }  
  // finally, add direct fee and interest
  const lastObj = {
    allSubAgentOwnedFee :  new Big(tokenAmt!.allSubAgentOwnedFee as string).plus(tokenAmt!.directFee as string).toString(),
    allSubAgentOwnedInterest :new Big(tokenAmt!.allSubAgentOwnedInterest as string).plus(tokenAmt!.directInterest as string).toString(),
  };
  return lastObj;
}

  async insertToPeriodicallyTable(dbRecords: DBModel.AgentDailyReport[]) {
    logger.info('[fillInDataForReports] - insertToPeriodicallyTable');
    const deepClone: DBModel.AgentDailyReport[] = JSONBig.parse(
      JSON.stringify(dbRecords),
    );
    //Insert by batch
    const chunks = ArrayHelper.splitInChunks(
      deepClone,
      globalVar.cronJobConfig.cronJob.chunks,
    );
    for (let i = 0; i < chunks.length; i++) {
      let t: any = null;
      try {
        t = await seq.sequelize.transaction();
        const createResult = await this.modelModule[
          SeqModel.name.AgentDailyReport
        ].bulkCreate(chunks[i]);
        await t.commit();
        logger.info(`Insert ${chunks[i].length} records`);
        t = null;
      } catch (e) {
        logger.error('Cannot insert to real time table');
        await t.rollback();
        throw e;
      }
    }
  }

  async insertToRealTimeTable(dbRecords: DBModel.AgentDailyReport[]) {
    logger.info('[fillInDataForReports] - insertToRealTimeTable');

    const deepClone: DBModel.AgentDailyReport[] = JSONBig.parse(
      JSON.stringify(dbRecords),
    );
    const createList: string[] = [];
    const deleteResult = await this.modelModule[
      SeqModel.name.AgentDailyReportRealTime
    ].destroy({ where: {} });
    const chunks = ArrayHelper.splitInChunks(
      deepClone,
      globalVar.cronJobConfig.cronJob.chunks,
    );

    for (let i = 0; i < chunks.length; i++) {
      let t: any = null;
      try {
        t = await seq.sequelize.transaction();
        const createResult = await this.modelModule[
          SeqModel.name.AgentDailyReportRealTime
        ].bulkCreate(chunks[i], { transaction: t });
        await t.commit();
        logger.info(`Insert ${chunks[i].length} records`);
        t = null;
      } catch (e) {
        logger.error('Cannot insert to real time table');
        await t.rollback();
        throw e;
      }
    }
  }
  // prettier-ignore
  moveUpwards(
    rootTree: AccumalativeAmount,
    node: AccumalativeAmount, //root
    parent: AccumalativeAmount | null, //root,
  ) {
    if (node.children) {
      node.children.forEach((child) => {
        this.moveUpwards(rootTree, child, node);
      });
    }
    if (parent) {
      if (new Big(node.commissionRate).gt(parent.commissionRate)) {
        parent.children = parent.children.filter((x) => x.id != node.id);
        const grandParent = TreeHelper.findNodeInTree(
          rootTree,
          'id',
          parent.parentAgentId,
          'children',
        );
        node.parentAgentId = grandParent.id;
        grandParent.children.push(node);
        this.moveUpwards(rootTree, node, grandParent);
      }
    }
  }

  getDayRange(createdDate: string): CronJobDaysRange {
    const now = createdDate;
    const distWeekDays =
      globalVar.cronJobConfig.cronJob.dailySettlement.distWeekDays;
    let todayWeekDay = moment(now).weekday();
    if (todayWeekDay == 0) {
      //0 is sunday
      todayWeekDay = 7;
    }
    let inTimeRange: any;
    for (let i = 0; i < distWeekDays.length; i++) {
      if (distWeekDays[i].indexOf(todayWeekDay) != -1) {
        inTimeRange = distWeekDays[i].sort();
        logger.info(
          `Found time range for weekday ${todayWeekDay} in [${inTimeRange.join(
            ',',
          )}]`,
        );
        break;
      }
    }
    if (!inTimeRange) {
      throw new Error(`Cannot find time range for weekday ${todayWeekDay}`);
    }
    const weekDayStartInRange = inTimeRange[0];
    const weekDayEndInRange = inTimeRange[inTimeRange.length - 1];
    const dateRangeStart: string = moment(now)
      .subtract(todayWeekDay - weekDayStartInRange, 'day')
      .format('YYYY-MM-DD');
    const dateRangeEnd: string = moment(now)
      .add(weekDayEndInRange - todayWeekDay, 'day')
      .format('YYYY-MM-DD');
    const dateStartInRange = moment(dateRangeStart)
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const dateTimeStart = moment(dateRangeStart)
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const dateTimeEnd: string = now;
    const yesterday: string = moment(now)
      .subtract(1, 'day')
      .format('YYYY-MM-DD');
    const dateRange = {
      now: now,
      inTimeRange: inTimeRange,
      weekDayStartInRange: weekDayStartInRange,
      weekDayEndInRange: weekDayEndInRange,
      dateStartInRange: dateStartInRange,
      dateEndInRange: dateRangeEnd,
      dateStart: dateTimeStart,
      dateEnd: dateTimeEnd,
      yesterday: yesterday,
      todayWeekDay: todayWeekDay,
    };

    return dateRange;
  }

  // prettier-ignore
  separateTokenIntoDbModelRows( 
  records: AccumalativeAmount[],
  daysRange:CronJobDaysRange,
): AgentDailyReport[] {
  const recordsToBeInserted: AgentDailyReport[] = [];
  let tokenAmt: TokenAmt;
  let record: AccumalativeAmount;
  let dbRecord: AgentDailyReport;
  let decimals=0;
  for (let i = 0; i < records.length; i++) {
    record = records[i];
    for (let y = 0; y < record.tokenAmts.length; y++) {
      tokenAmt = records[i].tokenAmts[y];
      decimals= crytoDecimalPlace[tokenAmt.token.toUpperCase()],
      dbRecord = {
        id: null,
        agentId: record.id,
        parentAgentId: record.parentAgentId,
        token: tokenAmt.token,
        feePercentage: record.feePercentage,
        interestPercentage: record.feePercentage,
        directUsedFee: tokenAmt.directUsedFee,
        allSubAgentDirectUsedFee: tokenAmt.allSubAgentDirectUsedFee,
        turnOver: tokenAmt.turnOver,
        directFee: tokenAmt.directFee,
        directFeeIncome: tokenAmt.directFeeIncome,
        allSubAgentFee: tokenAmt.allSubAgentFee,
        allSubAgentOwnedFee:tokenAmt.allSubAgentOwnedFee,
        allSubAgentFeeIncome: tokenAmt.allSubAgentFeeIncome,
        allChildAgentFeeIncome: new Big(tokenAmt.allChildAgentFeeIncome!).round().toString(), //Interest
        directInterest: tokenAmt.directInterest,
        directInterestIncome: tokenAmt.directInterestIncome,
        allSubAgentInterest: tokenAmt.allSubAgentInterest,
        allSubAgentOwnedInterest:tokenAmt.allSubAgentOwnedInterest,
        allSubAgentInterestIncome: tokenAmt.allSubAgentInterestIncome,
        allChildAgentInterestIncome:  new Big(tokenAmt.allChildAgentInterestIncome!).round().toString(), //Lump Sum
        feeIncome:0,      //Calculate after the above rounded
        netFeeIncome:0,//Calculate after the above rounded
        netAgentFeeIncome:0,//Calculate after the above rounded
        interestIncome:0,//Calculate after the above rounded
        netInterestIncome:0,//Calculate after the above rounded
        netAgentInterestIncome:0,//Calculate after the above rounded
        totalIncome:0,//Calculate after the above rounded
        distTokenInUSDM:0,//Need to 
        distMTokenRate:record.distMTokenRate as number,
        distMSTTokenRate:record.distMSTTokenRate as number,
        distToken:null,
        distType:record.distType,
        toUSDMExchangeRate:tokenAmt.toUSDMExchangeRate as string,
        mstToUSDMExchangeRate:null,
        dateEnd:daysRange.dateEnd as any,
        createdDate:daysRange.now as any,
        accumalativeUSDMAmt:record.accumalativeUSDMAmt as string,
        stakedMst: record.stakedMst,
        txFeeGrade:record.txFeeGrade?Number(record.txFeeGrade):null,
        stakedMSTGrade:record.stakedMSTGrade?Number(record.stakedMSTGrade):null,
        grade: record.grade?Number(record.grade):null,
        commissionRate: record.commissionRate,
        cronJobId:null,
        status: AgentDailyReportStatus.StatusPending,
      };

      // total agent income at current node
      dbRecord.feeIncome=new Big(dbRecord.allSubAgentFeeIncome!)
        .plus(new Big(dbRecord.directFeeIncome!))
        .toString();

      // net commission fee income
      dbRecord.netFeeIncome = new Big(dbRecord.feeIncome!)
        .minus(new Big(dbRecord.allChildAgentFeeIncome!))
        .toString();

      // net commission fee income contributed by agent
      dbRecord.netAgentFeeIncome = new Big(dbRecord.allSubAgentFeeIncome!)
        .minus(new Big(dbRecord.allChildAgentFeeIncome!))
        .toString();

      // total interest income at current node
      dbRecord.interestIncome = new Big(dbRecord.allSubAgentInterestIncome!)
        .plus(new Big(dbRecord.directInterestIncome!))
        .toString();

      // net interest income
      dbRecord.netInterestIncome=new Big(dbRecord.interestIncome!)
        .minus(new Big(dbRecord.allChildAgentInterestIncome!))
        .toString();

      // interest income contributed by agent
      dbRecord.netAgentInterestIncome = new Big(dbRecord.allSubAgentInterestIncome!)
        .minus(new Big(dbRecord.allChildAgentInterestIncome!))
        .toString();

      // total income
      dbRecord.totalIncome=new Big(dbRecord.netFeeIncome!)
        .plus(new Big(dbRecord.netInterestIncome!))
        .toString();
      // dist token
      dbRecord.distToken=dbRecord.distType==AgentDailyReportType.M?dbRecord.totalIncome:null;
      //Truncate
      dbRecord.totalIncome=new Big(dbRecord.totalIncome)
        .minus(new Big(dbRecord.totalIncome).mod(10 ** (decimals - 6)))
        .toString();
      
      const totalShare = new Big(dbRecord.totalIncome)
      .toString();

      if(totalShare!='0'){
        dbRecord.distTokenInUSDM = new Big(totalShare)
        .div(10 ** decimals)
        .mul(new Big(tokenAmt.toUSDMExchangeRate).div(10 ** 18))
        .toFixed(6)
        .replace('.', '');
      }
      //dbRecord.distToken=this.calDistToken(dbRecord)
      recordsToBeInserted.push(dbRecord);
    }
  }
  return recordsToBeInserted;
  }

  /**
   * Calculate and update distToken in table agent daily reports
   *
   * @param  cronJobId cronJobId from t_decats_cron_jobs
   * @param  mstToUSDMExchangeRate mstToUSDMExchangeRate from the cronJob
   * @param  t transaction throught out the commission generation
   */
}
