import seq from '../sequelize';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import logger from '../util/ServiceLogger';
import moment from 'moment';
import { Mixed } from '../../../foundation/types/Mixed';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import TxnReceiptHelper from '../../../foundation/utils/TxnReceiptHelper';
import { createdEventApi } from '../const';
import CronJob, { CronJobStatus } from '../../../general/model/dbModel/CronJob';
import sequelize, {
  JSONB,
  Op,
  QueryTypes,
  Sequelize,
  Transaction,
} from 'sequelize';
import JSONBig from 'json-bigint';
import Big from 'big.js';
import foundationConst from '../../../foundation/const/index';
import {
  AgentDailyReport,
  CommissionDistribution,
  CommissionLedger,
  CommissionSummary,
} from '../../../general/model/dbModel/0_index';
import PayoutArtifact from '../../../abi/Payout.json';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import globalVar from '../const/globalVar';
import IAgentDataArtifact from '../../../abi/IAgentData.json';
import TrueAgentData from '../model/TrueAgentData';
import CommissionJob from '../../../general/model/dbModel/CommissionJob';
import ParamPayoutUpdate from '../model/ParamPayoutUpdate';
import BN from 'bn.js';
import { CommissionDistributionStatus } from '../../../general/model/dbModel/CommissionDistribution';
import { crytoDecimalPlace } from '../../../general/model/dbModel/Prices';
import MstPrice, {
  MstPriceStatus,
} from '../../../general/model/dbModel/MstPrice';
import {
  AgentDailyReportStatus,
  AgentDailyReportType,
} from '../../../general/model/dbModel/AgentDailyReport';
import {
  AccumalativeAmount,
  CronJobDaysRange,
  TokenAmt,
} from '../model/DailySettlement';
import e from 'express';
import DailySettlementService from './DailySettlementService';
import { calculateRootAgentIncome } from '../util/CommonFunction';
const modelModule = seq.sequelize.models;
const foundationConfig = globalVar.foundationConfig;

export default class Service {
  funcMsg: string;
  sideChainClient?: EthClient; // mainnet/testnet/dev
  commissionJob: CommissionJob;
  paramUpdate: ParamPayoutUpdate;
  processing: boolean;
  mstToUSDRate: Mixed;
  constructor() {
    this.funcMsg = `[MonitorCronJobService][monitor]`;
    this.commissionJob = new CommissionJob();
    this.paramUpdate = {
      roundID: '',
      tokenList: [],
      agentPayoutList: [],
      summaries: [],
      distributions: [],
    };
    this.processing = false;
    this.mstToUSDRate = new Big(0).toString();
  }

  async monitor() {
    let t: sequelize.Transaction;

    logger.info('Monitoring cron job status');
    let cronJobs: CronJob[] = (await modelModule[SeqModel.name.CronJob].findAll(
      {
        where: {
          status: CronJobStatus.Processing,
          mstToUSDMExchangeRate: { [Op.ne]: null },
        },
      },
    )) as any;
    cronJobs = JSON.parse(JSON.stringify(cronJobs));
    if (cronJobs) {
      logger.info(`Found ${cronJobs.length} cronJobs`);
      if (!this.processing) {
        this.processing = true;
        for (let i = 0; i < cronJobs.length; i++) {
          await this.connectContract(); //Connect MST Contract
          t = await seq.sequelize.transaction(); //Each commission job will have individual commission job
          try {
            logger.info(
              `Generating commission job for cron job ${cronJobs[i].id}`,
            );
            await this.generateCommissionJob(cronJobs[i], t);
            await this.updateCronJobToFinished(cronJobs[i].id!, t);
            await t.commit();
          } catch (e) {
            logger.error('Cannot monitor cronJob');
            await t.rollback();
            logger.error(e);

            this.processing = false;
          }
        }
        this.processing = false;
      }
    } else {
      logger.info('No cronJob is found');
    }
  }

  private async generateCommissionJob(
    cronJob: CronJob,
    t: sequelize.Transaction,
  ) {
    this.refreshData();
    await this.calculateDistMSTToken(
      cronJob.id!,
      cronJob.mstToUSDMExchangeRate!.toString(),
      t,
    );
    this.commissionJob.ledgers = await this.generateLedgers(cronJob, t);
    this.paramUpdate = this.generateParamUpdate(this.commissionJob.ledgers!);
    const dateFrom = moment(cronJob.dateFrom).format('YYYY-MM-DD');
    const dateTo = moment(cronJob.dateTo).format('YYYY-MM-DD');
    //If no one has distribution, simply create empty commission job and update cronJob to finished status
    if (this.paramUpdate.agentPayoutList.length == 0) {
      logger.info('No one has distributions');
      await this.generateEmptyCommissionJob(dateFrom, dateTo, cronJob.id!, t);
    } else {
      logger.info('Someone has distributions');
      await this.verifySignData();
      await this.generateEmptyCommissionJob(dateFrom, dateTo, cronJob.id!, t);
      await this.payoutCreate(cronJob.id!, t);
    }
  }

  /**
   * Calculate and update distToken in table agent daily reports
   *
   * @param  cronJobId cronJobId from t_decats_cron_jobs
   * @param  mstToUSDMExchangeRate mstToUSDMExchangeRate from the cronJob
   * @param  t transaction throught out the commission generation
   */
  private async calculateDistMSTToken(
    cronJobId: string,
    mstToUSDMExchangeRate: string,
    t: Transaction,
  ) {
    let agentDailyReports: AgentDailyReport[] = (await modelModule[
      SeqModel.name.AgentDailyReport
    ].findAll({
      attributes: [
        'agentId',
        'token',
        'id',
        'totalIncome',
        'distType',
        'mstToUSDMExchangeRate',
        'distToken',
        'distTokenInUSDM',
      ],
      where: { cronJobId: cronJobId },
      transaction: t,
    })) as any;
    agentDailyReports = JSONBig.parse(JSONBig.stringify(agentDailyReports));

    const updateResults: any[] = [];
    for (let i = 0; i < agentDailyReports.length; i++) {
      const distMSTTokenUSDM = agentDailyReports[i].distTokenInUSDM!;
      agentDailyReports[i].mstToUSDMExchangeRate = mstToUSDMExchangeRate;
      if (agentDailyReports[i].distType == AgentDailyReportType.MST) {
        agentDailyReports[i].distToken = new Big(distMSTTokenUSDM)
          .div(10 ** crytoDecimalPlace.USDM)
          .div(
            new Big(agentDailyReports[i].mstToUSDMExchangeRate!).div(
              10 ** crytoDecimalPlace.USDM,
            ),
          )
          .toFixed(crytoDecimalPlace.MST)
          .replace('.', '');
        const truncate = new Big(agentDailyReports[i].distToken!)
          .mod(10 ** (crytoDecimalPlace.MST - crytoDecimalPlace.USDM))
          .toString();
        agentDailyReports[i].distToken = new Big(
          agentDailyReports[i].distToken!,
        )
          .minus(new Big(truncate))
          .toString();
      } else {
        agentDailyReports[i].distToken = agentDailyReports[i].totalIncome!;
      }
    }

    agentDailyReports = await calculateRootAgentIncome(agentDailyReports, true);
    for (let i = 0; i < agentDailyReports.length; i++) {
      const updateResult: AgentDailyReport[] = (await modelModule[
        SeqModel.name.AgentDailyReport
      ].update(agentDailyReports[i], {
        fields: [
          'agentId',
          'token',
          'distToken',
          'mstToUSDMExchangeRate',
          'distType',
          'lastModifiedDate',
        ],
        where: { id: agentDailyReports[i].id!.toString() },
        transaction: t,
      })) as any;
      updateResults.push({
        id: agentDailyReports[i].id,
        updateRows: updateResult[0],
      });
    }
    console.log(
      updateResults
        .map((x) => {
          return `[${x.id} - ${x.updateRows}]`;
        })
        .join(','),
    );

    if (updateResults.find((x) => x.updateRows == 0)) {
      throw new Error(
        '[calculateDistMSTToken] Agent daily reports is not updated ',
      );
    }
  }
  /**
   * Calculate root agent income.
   * Root agent MST income should be negative, since it is distributed
   * (Root agent MST income) will be shown as negative in agent daily reports, but count as 0 in commission_summaries, since it is not using in commission jobs
   * Root agent M token income should be the same as other agents calulation methods
   */
  calculateRootAgentIncome(dbRecords: AgentDailyReport[]) {
    for (let i = 0; i < dbRecords.length; i++) {
      //Root agent
      if (!dbRecords[i].parentAgentId) {
        const distMSTTokenOfSubAgents = dbRecords
          .filter(
            (x: AgentDailyReport) =>
              x.token == dbRecords[i].token &&
              x.agentId != dbRecords[i].agentId &&
              x.distType == dbRecords[i].distType,
          )
          .map((report) => {
            return {
              distToken: report.distToken,
              distTokenInUSDM: report.distTokenInUSDM,
            };
          });
        let sumOfDistToken = new Big(0);
        let sumOfDistTokenInUSDM = new Big(0);
        distMSTTokenOfSubAgents.forEach((x) => {
          sumOfDistToken = sumOfDistToken.plus(
            new Big(x.distToken!.toString()),
          );
          sumOfDistTokenInUSDM = sumOfDistTokenInUSDM.plus(
            new Big(x.distTokenInUSDM!.toString()),
          );
        });
        // So for MST, because it is expense, that' s why need to mul by -1
        if (dbRecords[i].distType == AgentDailyReportType.MST) {
          const distMSTToken = new Big(sumOfDistToken).mul(-1).toString();
          const distMSTTokenInUSDM = new Big(sumOfDistTokenInUSDM)
            .mul(-1)
            .toString();
          dbRecords[i].distToken = distMSTToken;
          dbRecords[i].distTokenInUSDM = distMSTTokenInUSDM;
        }
      }
    }

    return dbRecords;
  }

  private async assignMSTToUSDRate(t: Transaction) {
    const dbRecord: any = await modelModule[SeqModel.name.MstPrice].findOne({
      where: {
        status: MstPriceStatus.StatusActive,
      },
      transaction: t,
    });
    if (dbRecord) {
      const price: MstPrice = JSONBig.parse(JSONBig.stringify(dbRecord));
      this.mstToUSDRate = price.mstPrice;
    } else {
      throw new Error('Cannot find mstToUSDRate');
    }
  }
  /**
   * Update cronJob status to finished
   *
   * @param  cronJobId cronJobId from t_decats_cron_jobs
   * @param  t transaction throught out the commission generation
   */
  async updateCronJobToFinished(cronJobId: string, t: Transaction) {
    const funcMsg = `[CommissionJobService][updateCronJobToFinished]`;
    const cronJob = new CronJob();
    cronJob.id = cronJobId;
    cronJob.status = CronJobStatus.Finished;
    cronJob.lastModifiedDate = new Date();
    //Update cronjob status to processing. because we are about ot generate report
    const updateResult: any = await modelModule[SeqModel.name.CronJob].update(
      cronJob,
      {
        fields: ['status', 'lastModifiedDate'],
        where: { id: cronJob.id },
        transaction: t,
      },
    );
    const isUpdateSuccess = updateResult[0] > 0 ? true : false;
    if (!isUpdateSuccess) {
      logger.error(funcMsg, { message: ' - fail' });
      throw new Error('cannot update cron job status to finished');
    }
  }
  /**
   * Update round id to related commissionJob
   *
   * @param roundId roundID from [Payout] contract
   * @param  t transaction throught out the commission generation
   */
  async updateCommisionJobRoundId(roundId, t: Transaction) {
    const funcMsg = `[CommissionJobService][updateCronJobToFinished]`;
    this.commissionJob.roundId = roundId;
    const updateResult2: any = await modelModule[
      SeqModel.name.CommissionJob
    ].update(this.commissionJob, {
      fields: ['roundId', 'lastModifiedDate'],
      where: { id: this.commissionJob.id?.toString() },
      transaction: t,
    });
    const isUpdateSuccess = updateResult2[0] > 0 ? true : false;
    if (!isUpdateSuccess) {
      logger.error(funcMsg, { message: ' - fail' });
      throw new Error('cannot update cron job status to finished');
    }
  }

  /**
   * Connect to contract
   *
   */
  async connectContract() {
    logger.info('Starting to connect web 3 contract');
    const httpProvider = new Web3.providers.HttpProvider(
      foundationConfig.rpcHostHttp,
      foundationConst.web3webSocketDefaultOption,
    );
    this.sideChainClient = new EthClient(
      httpProvider,
      foundationConfig.chainId,
    );
    const chainId: any = await this.sideChainClient.web3Client.eth.getChainId();
    const sideChainWeb3Connected = httpProvider.connected;
    logger.info(
      `connecting to side chain (${chainId}) at ${
        (this.sideChainClient.web3Client.currentProvider as any).url
      }.....`,
    );
    if (sideChainWeb3Connected) {
      logger.info(
        `connected to side chain (${chainId}) at ${
          (this.sideChainClient.web3Client.currentProvider as any).url
        }.....`,
      );
    }
  }

  /**
   * Calculate commission_ledgers for each agent in t_decats_agent_daily_reports of the cronJob
   *
   * @param {Service} cronJob cronJob from t_decats_cron_jobs
   * @param {Service} t transaction throught out the commission generation
   */
  async generateLedgers(cronJob: CronJob, t: Transaction) {
    logger.info('[generateLedgers]', {
      message: `Generate commission job from [${cronJob.dateFrom}] - to:[${cronJob.dateTo}]`,
    });
    const funcCall: any = await seq.sequelize.query(
      `
                select
                            null as "jobId",
                            dayReport."token" as "token",
                            dayReport."agent_id" as "agentId",
                            tda."address" as address,
                            tda.sign_data as "signData",
                            dayReport."dist_token" as "distCommission",
                            dayReport."dist_token_in_usdm" as "distCommissionInUSDM",
                            :dateTo as "createdDate"
                        from
                            t_decats_agent_daily_reports  dayReport 
                        inner join t_decats_agents tda on
                            tda.id = dayReport."agent_id"
                    where dayReport.date_end = :dateTo and dayReport.dist_type='0'
                    union all
                    select
                    null as "jobId",
                    'MST' as "token",
                    dayReport."agent_id" as "agentId",
                    tda."address" as address,
                    tda.sign_data as "signData",
                    SUM(dist_token) "distCommission",
                    SUM(dist_token_in_usdm) "distCommissionInUSDM",
                    :dateTo as "createdDate"
                    from
                    t_decats_agent_daily_reports dayReport
                    inner join t_decats_agents tda on
                    tda.id = dayReport."agent_id"
                    where
                    dayReport.date_end = :dateTo and dayReport.dist_type='1'
                    group by
                    agent_id ,
                    address,
                    sign_data
                    order by
                    "agentId",
                    "token"

            `,
      {
        replacements: {
          dateTo: cronJob.dateTo,
        },
        type: QueryTypes.SELECT,
        transaction: t,
      },
    );
    const data = JSONBig.parse(JSON.stringify(funcCall));
    return data;
  }

  /**
   * Convert commission ledgers data to contract data for [Payout] smart contract
   *
   * @param data commission ledgers
   */
  generateParamUpdate(data: CommissionLedger[]) {
    // Check if there is dists, if no dists, do not create round
    let setOfAgents = Array.from(new Set(data.map((x) => x.agentId)));
    const noDistributionAgentId: Mixed[] = [];
    for (let i = 0; i < setOfAgents.length; i++) {
      const distributions = this.commissionJob.ledgers?.filter(
        (x) => x.agentId == setOfAgents[i],
      );

      const anyTokenHasDistribution = distributions?.find((x) =>
        new Big(x.distCommission).gt(0),
      );
      if (!anyTokenHasDistribution) {
        noDistributionAgentId.push(setOfAgents[i]);
      }
    }

    data = data.filter((x) => !noDistributionAgentId.includes(x.agentId));
    //Because root agent distCommision for MST is negative number, it should not be distributed
    data.forEach((x) => {
      x.distCommission = new Big(x.distCommission).gte(0)
        ? x.distCommission.toString()
        : '0';
    });
    data.forEach((x) => {
      x.distCommissionInUSDM = new Big(x.distCommissionInUSDM).gte(0)
        ? x.distCommissionInUSDM.toString()
        : '0';
    });
    setOfAgents = Array.from(new Set(data.map((x) => x.agentId)));
    const dateNow = new Date();
    const summaries: CommissionSummary[] = [];
    const setOfTokens = Array.from(new Set(data.map((x) => x.token)));
    const tokenList: any[] = Array.from(setOfTokens).sort();
    const distributions: CommissionDistribution[] = [];
    for (let i = 0; i < tokenList.length; i++) {
      tokenList[i] = {
        name: tokenList[i],
        addr: foundationConfig.smartcontract.MappedSwap[
          `OwnedBeaconProxy<${tokenList[i]}>`
        ].address,
        decimals: crytoDecimalPlace[tokenList[i].toUpperCase()],
      };
    }
    logger.info(`token list ${JSON.stringify(tokenList)}`);
    const agentPayoutList: [string, (number | string | BN)[]][] = [];

    for (let i = 0; i < setOfAgents.length; i++) {
      const recordsForAnAgent: CommissionLedger[] = data.filter(
        (x) => x.agentId == setOfAgents[i],
      );
      const address = (recordsForAnAgent[0] as any).address!;
      //negative numbers ignored
      const agentPayout: string[] = recordsForAnAgent.map((x) =>
        x.distCommission.toString(),
      );
      agentPayoutList.push([address, agentPayout]);
      (distributions as any).push({
        jobId: null,
        agentId: setOfAgents[i],
        status: CommissionDistributionStatus.Created,
        createdDate: dateNow,
        acquiredDate: null,
        txHash: null,
        txDate: null,
        address: address,
      });
    }
    data.reduce(function (res, value) {
      if (!res[value.token]) {
        res[value.token] = {
          token: value.token,
          distTotalCommission: 0,
          distTotalCommissionInUSDM: 0,
        };
        summaries.push(res[value.token]);
      }
      //res[value.token].distTotalCommission += Number(value.distCommission);
      res[value.token].distTotalCommission = new Big(
        res[value.token].distTotalCommission,
      )
        .plus(new Big(value.distCommission))
        .toString();
      res[value.token].distTotalCommissionInUSDM = new Big(
        res[value.token].distTotalCommissionInUSDM,
      )
        .plus(new Big(value.distCommissionInUSDM))
        .toString();
      return res;
    }, {});
    const paramUpdate: ParamPayoutUpdate = {
      roundID: '',
      tokenList: tokenList.map((x) => x.addr),
      agentPayoutList: agentPayoutList,
      summaries: summaries,
      distributions: distributions,
    };

    logger.info(`Token List: ${paramUpdate.tokenList.join(',')}`);
    logger.info(`Payout List: ${paramUpdate.agentPayoutList.join(',')}`);
    return paramUpdate;
  }
  /**
   * Refresh all data for insert and update to prevenet duplicate insert and update
   */
  async refreshData() {
    //Refresh commissionJob
    this.commissionJob = new CommissionJob();
    (this.commissionJob as any).id = null;
    this.commissionJob.distributions = [];
    this.commissionJob.summaries = [];
    this.commissionJob.ledgers = [];
    //Refresh paramUpdate
    this.paramUpdate = {
      roundID: '',
      tokenList: [],
      agentPayoutList: [],
      summaries: [],
      distributions: [],
    };
  }
  /**
   * Calculate and update distToken in table agent daily reports
   *
   * @param dateFrom dateFrom from t_decats_cron_jobs
   * @param dateTo dateTo from t_decats_cron_jobs
   * @param cronJobId cronJobId from t_decats_cron_jobs
   * @param t transaction throught out the commission generation
   */
  async generateEmptyCommissionJob(
    dateFrom: string,
    dateTo: string,
    cronJobId: string,
    t: Transaction,
  ) {
    const funcMsg = `[CommissionJobService][generateEmptyCommissionJob]`;
    try {
      const dateNow = moment().toDate();
      const distDesc =
        this.paramUpdate.distributions!.length > 0
          ? `Generated By System (${dateFrom} - ${dateTo}), disted`
          : `Generated By System (${dateFrom} - ${dateTo}), no distribution`;

      this.commissionJob.lastModifiedDate = dateNow;
      this.commissionJob.createdDate = dateNow;
      this.commissionJob.cronJobId = cronJobId;
      this.commissionJob.remark = distDesc;
      this.commissionJob.dateFrom = dateFrom as any;
      this.commissionJob.dateTo = dateTo as any;
      //2. commissionJobInsert
      const commissionJobInsert: any = await modelModule[
        SeqModel.name.CommissionJob
      ].create(this.commissionJob, {
        transaction: t,
      });
      this.commissionJob.id = commissionJobInsert.getDataValue('id');
      //3. commissionLedgers
      this.commissionJob.ledgers?.forEach((x) => {
        x.jobId = this.commissionJob.id!;
      });
      const commissionLedgerInsert: any = await modelModule[
        SeqModel.name.CommissionLedger
      ].bulkCreate(this.commissionJob.ledgers!, {
        transaction: t,
      });
      this.paramUpdate.summaries?.forEach((x) => {
        x.jobId = this.commissionJob.id!;
      });
      const commissionSummariesInsert: any = await modelModule[
        SeqModel.name.CommissionSummary
      ].bulkCreate(this.paramUpdate.summaries, {
        transaction: t,
      });

      this.paramUpdate.distributions?.forEach((x) => {
        x.jobId = this.commissionJob.id!;
      });
      const commissionDistsInsert: any = await modelModule[
        SeqModel.name.CommissionDistribution
      ].bulkCreate(this.paramUpdate.distributions, {
        transaction: t,
      });
    } catch (e) {
      logger.error(funcMsg, { message: ' - Fail' });
      throw e;
    }
  }
  /**
   * Verify if any agent has no sign data, or sign data not match AgentData sign data
   *
   */
  async verifySignData() {
    const abiItemsAgentData: AbiItem[] = IAgentDataArtifact as AbiItem[];

    const agentDataContract = new this.sideChainClient!.web3Client.eth.Contract(
      abiItemsAgentData,
      foundationConfig.smartcontract.MappedSwap[
        'OwnedUpgradeableProxy<AgentData>'
      ].address,
    ) as any;
    const trueData: TrueAgentData[] = []; //Save verfied data of agent form AgentData contract
    //Check if there is agent that does not have sign data
    const data = this.commissionJob.ledgers! as any[];
    const incorrectSignData = data.filter((x) => !x.signData);
    if (incorrectSignData.length > 0) {
      throw new Error(
        `Sign data of agent cannot by empty : (${[
          ...new Set(incorrectSignData.map((x) => x.address)),
        ].join(',')})`,
      );
    }
    //2. Verify agent address is actually in AgentData Contract
    // Also add newly agent to contract

    let agent;

    for (let i = 0; i < data.length; i++) {
      if (trueData.find((x) => x.address == data[i].address)) {
        logger.debug(
          `Already verified, skipping agent(${data[i].agentId}) ${data[i].address}`,
        );
        continue;
      } else {
        agent = data[i];
        const valString = Web3.utils.toHex(agent.signData);
        const isVerified = await agentDataContract.methods
          .verifyData(agent.address, valString)
          .call({});
        if (isVerified) {
          trueData.push({
            agentId: agent.agentId,
            address: agent.address,
            signData: agent.signData,
            isVerified: true,
          });
        } else {
          logger.error(`${agent.agentId} - ${agent.address} is not verified`);
          trueData.push({
            agentId: agent.agentId,
            address: agent.address,
            signData: agent.signData,
            isVerified: false,
          });
        }
      }
    }
    const nonVerifiedData = trueData.filter((x) => !x.isVerified);
    if (nonVerifiedData.length != 0) {
      throw new Error(
        `Critical error, agent data is not verified!!!!!!!!!!!!!!!! Please check database the agent address in database. Non verified data (${nonVerifiedData
          .map((x) => `${x.agentId} - ${x.address}`)
          .join(', ')})`,
      );
    } else {
      logger.info('All agents verified');
    }
  }
  /**
   * Create a round from [Payout] smart contract by [create] function
   *
   * @param cronJobId cronJobId
   * @param t transaction throught out the commission generation
   */
  async payoutCreate(cronJobId: string, t: Transaction) {
    const funcMsg = `[CommissionJobService][payoutCreate]`;
    logger.info(
      'All agents verified, Starts to generate round from smart contract!',
    );
    const abiItemsPayout: AbiItem[] = PayoutArtifact as AbiItem[];
    const payoutContract = new this.sideChainClient!.web3Client.eth.Contract(
      abiItemsPayout,
      foundationConfig.smartcontract.MappedSwap[
        'OwnedUpgradeableProxy<Payout>'
      ].address,
    ) as any;
    // 1. Starts to generate round from smart contract
    const web3 = new Web3(this.sideChainClient!.web3Client.currentProvider);
    const key = encryptionKey!;
    const commissionJobAccount = web3.eth.accounts.privateKeyToAccount(key);
    const payoutContractAddr =
      foundationConfig.smartcontract.MappedSwap['OwnedUpgradeableProxy<Payout>']
        .address;

    const tx: any = {
      from: commissionJobAccount.address,
      to: payoutContractAddr,
      gasPrice: '0x8F0D1800',
      gas: '0xAA690',
      data: payoutContract.methods.create().encodeABI(),
    };
    const esiGas = await this.sideChainClient!.web3Client.eth.estimateGas(tx);
    tx.gas = esiGas;
    const signTxResult: any = await commissionJobAccount.signTransaction(tx);

    const createRndTxResult: any =
      await this.sideChainClient!.web3Client.eth.sendSignedTransaction(
        signTxResult.rawTransaction,
      );
    const receipt = await TxnReceiptHelper.getReceiptFromTxHash(
      createRndTxResult.transactionHash,
      this.sideChainClient!.web3Client,
    );
    if (receipt.status) {
      logger.info(
        `[Payout].[create] success, txHash :${receipt.transactionHash}`,
      );
      const decodeData = await TxnReceiptHelper.decodeEvent(
        createRndTxResult.transactionHash,
        this.sideChainClient!.web3Client,
        createdEventApi,
      );
      await this.payoutUpdate(decodeData.roundID, cronJobId, t);
    } else {
      logger.error(funcMsg, { message: ' - fail' });
      throw new Error('[Payout].[create][Error]');
    }
  }
  /**
   * Update a round from [Payout] smart contract by [update] function
   * @param roundId roundId from previous [Payout][create] function
   * @param cronJobId cronJobId
   * @param t transaction throught out the commission generation
   */
  async payoutUpdate(roundId: string, cronJobId: string, t: Transaction) {
    const funcMsg = `[Payout].[update]`;
    await this.updateCommisionJobRoundId(roundId, t);
    const payoutList: any = this.paramUpdate.agentPayoutList;
    const payoutContractAddr =
      foundationConfig.smartcontract.MappedSwap['OwnedUpgradeableProxy<Payout>']
        .address;
    const abiItemsPayout: AbiItem[] = PayoutArtifact as AbiItem[];
    const payoutContract = new this.sideChainClient!.web3Client.eth.Contract(
      abiItemsPayout,
      foundationConfig.smartcontract.MappedSwap[
        'OwnedUpgradeableProxy<Payout>'
      ].address,
    ) as any;
    if (
      roundId &&
      this.paramUpdate.tokenList.length > 0 &&
      payoutList.length > 0
    ) {
      const web3Account =
        this.sideChainClient!.web3Client.eth.accounts.privateKeyToAccount(
          encryptionKey!,
        );

      const tx: any = {
        // this could be provider.addresses[0] if it exists
        from: web3Account.address,
        // target address, this could be a smart contract address
        to: payoutContractAddr,
        gasPrice: '0x8F0D1800',
        // optional if you want to specify the gas limit
        gas: '0xAA690',
        // optional if you are invoking say a payable function
        //value: '0x00',
        // this encodes the ABI of the method and the arguements
        // data: pool.methods.updateCustomerDetails("0x39EB6463871040f75C89C67ec1dFCB141C3da1cf", "100", "50", true).encodeABI(),
        data: payoutContract.methods
          .update(
            roundId,
            this.paramUpdate.tokenList,
            this.paramUpdate.agentPayoutList,
          )
          .encodeABI(),
        // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
      };
      const esiGas = await this.sideChainClient!.web3Client.eth.estimateGas(tx);
      tx.gas = esiGas;
      const signTxResult: any = await web3Account.signTransaction(tx);
      logger.info(signTxResult.transactionHash);
      const updateSignTxResult =
        await this.sideChainClient!.web3Client.eth.sendSignedTransaction(
          signTxResult.rawTransaction,
        );
      const receipt = await TxnReceiptHelper.getReceiptFromTxHash(
        updateSignTxResult.transactionHash,
        this.sideChainClient!.web3Client,
      );

      if (receipt.status) {
        logger.info(
          `[Payout].[update] success, txHash :${receipt.transactionHash}`,
        );
        await this.payoutUpdateFinish(roundId);
      } else {
        logger.error(funcMsg, { message: ' - fail' });
        throw new Error('[Payout].[update][Error]');
      }
    } else {
      logger.info(`Round(${roundId}) is created but no agent payout list`);
    }
  }
  /**
   * Finish a round from [Payout] smart contract by [updateFinish] function
   * @param roundId roundId from previous [Payout][create] function
   */
  async payoutUpdateFinish(roundId: string) {
    const payoutContractAddr =
      foundationConfig.smartcontract.MappedSwap['OwnedUpgradeableProxy<Payout>']
        .address;
    const abiItemsPayout: AbiItem[] = PayoutArtifact as AbiItem[];
    const payoutContract = new this.sideChainClient!.web3Client.eth.Contract(
      abiItemsPayout,
      foundationConfig.smartcontract.MappedSwap[
        'OwnedUpgradeableProxy<Payout>'
      ].address,
    ) as any;
    const web3Account =
      this.sideChainClient!.web3Client.eth.accounts.privateKeyToAccount(
        encryptionKey!,
      );
    const verifierAddress =
      foundationConfig.smartcontract.MappedSwap['verifierAddress'];
    const tx: any = {
      // this could be provider.addresses[0] if it exists
      from: web3Account.address,
      // target address, this could be a smart contract address
      to: payoutContractAddr,
      gasPrice: '0x8F0D1800',
      // optional if you want to specify the gas limit
      gas: '0xAA690',
      // optional if you are invoking say a payable function
      //value: '0x00',
      // this encodes the ABI of the method and the arguements
      // data: pool.methods.updateCustomerDetails("0x39EB6463871040f75C89C67ec1dFCB141C3da1cf", "100", "50", true).encodeABI(),
      data: payoutContract.methods
        .updateFinish(roundId, verifierAddress)
        .encodeABI(),
      // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
    };
    const esiGas = await this.sideChainClient!.web3Client.eth.estimateGas(tx);
    tx.gas = esiGas;
    const signTx: any = await web3Account.signTransaction(tx);
    const signTxResult: any =
      await this.sideChainClient!.web3Client.eth.sendSignedTransaction(
        signTx.rawTransaction,
      );
    const receipt = await TxnReceiptHelper.getReceiptFromTxHash(
      signTxResult.transactionHash,
      this.sideChainClient!.web3Client,
    );
    if (receipt.status) {
      logger.info(
        `[Payout].[updateFinish] success, txHash :${receipt.transactionHash}`,
      );
    } else {
      throw new Error('[Payout].[updateFinish][Error]');
    }
  }
}
