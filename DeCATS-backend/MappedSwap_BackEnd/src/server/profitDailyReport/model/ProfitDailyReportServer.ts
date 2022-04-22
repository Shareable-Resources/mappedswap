import winston from 'winston';
import { ServerBase } from '../../../foundation/server/ServerBase';
import { ServerConfigBase } from '../../../foundation/server/ServerConfigBase';
import logger from '../util/ServiceLogger';
import schedule from 'node-schedule';
import moment from 'moment';
import ProfitDailyReportService, {
  getCurrPoolContractAmt,
  getCurrRajContractAmt,
} from '../service/ProfitDailyReportService';
import BalanceSnapshotService from '../service/BalanceSnapshotService';
import PairReportService from '../service/PairReportService';
import ProfitAndLossReportService from '../service/ProfitAndLossReportService';
import DailyStatisticReportService from '../service/DailyStatisticReportService';
import foundationConst from '../../../foundation/const/index';
import globalVar from '../const/globalVar';
import { getAllRelatedDate } from './ProfitReportDatesRange';
import { getBotCustomer } from '../util/BotCustomer';
import Web3 from 'web3';
import { EthClient } from '../../../foundation/utils/ethereum/EthClient';
import { ResponseBase } from '../../../foundation/server/ApiMessage';
import _ from 'json-bigint';
//Add custom function or specific objects in here for this server
export class ProfitDailyReportServer extends ServerBase {
  logger?: winston.Logger; // you can import this logger by import or just use HelloWorldUserServer.logger by instance
  profitDailyReportService: ProfitDailyReportService;
  balanceSnapShotService: BalanceSnapshotService;
  dailyStatisticReportService: DailyStatisticReportService;
  profitAndLossReportService: ProfitAndLossReportService;
  pairReportSerivce: PairReportService;
  sideChainClient?: EthClient; // mainnet/testnet/dev
  constructor(configBase: ServerConfigBase) {
    super(configBase);
    this.logger = logger;
    this.profitDailyReportService = new ProfitDailyReportService();
    this.balanceSnapShotService = new BalanceSnapshotService();
    this.dailyStatisticReportService = new DailyStatisticReportService();
    this.profitAndLossReportService = new ProfitAndLossReportService();
    this.pairReportSerivce = new PairReportService();
  }

  private async connectContract() {
    logger.info('Starting to connect web 3 contract');
    const httpProvider = new Web3.providers.HttpProvider(
      globalVar.foundationConfig.rpcHostHttp,
      foundationConst.web3HttpProviderOption,
    );
    this.sideChainClient = new EthClient(
      httpProvider,
      globalVar.foundationConfig.chainId,
    );
    logger.info(
      `connecting to side chain at ${
        (this.sideChainClient.web3Client.currentProvider as any).host
      }.....`,
    );
    try {
      if (httpProvider.connected) {
        logger.info(
          `connected to side chain at ${
            (this.sideChainClient.web3Client.currentProvider as any).host
          }.....`,
        );
      }
    } catch (ex) {
      logger.error(ex);
    }
  }
  /**
   * CronJob will run in a period of time based on cronFormat
   * CronFormat description : https://www.freeformatter.com/cron-expression-generator-quartz.html
   */
  async cronJob() {
    const cronJobs: string[] = [];
    const job = schedule.scheduleJob(
      '[ProfitDailyReportServer][create]',
      globalVar.profitDailyReportConfig.profitSummary.cronFormat,
      async () => {
        this.logCronJobStarts('[ProfitDailyReportServer][create]');
        await this.createDailyReport();
        this.logCronJobEnds('[ProfitDailyReportServer][create]');
      },
    );
    for (const [key] of Object.entries(schedule.scheduledJobs)) {
      cronJobs.push(key);
    }
    logger.info(`CronJob is ruinnging for : ${cronJobs.join(', ')}`);
  }

  async createDailyReport(createdDate?: string): Promise<ResponseBase> {
    createdDate = createdDate
      ? moment(createdDate).format('YYYY-MM-DD HH:mm:ss')
      : moment().format('YYYY-MM-DD HH:mm:ss');
    const dateRange = getAllRelatedDate(createdDate);
    //1. Contract data must be fresh, get from contract asap
    let rajContractAmts: any = null;
    let poolContractAmts: any = null;
    let retryTimes = 0;
    let contractSuccess = false;

    while (retryTimes < 20 && !contractSuccess) {
      try {
        await this.connectContract();
        rajContractAmts = await getCurrRajContractAmt(this.sideChainClient!);
        poolContractAmts = await getCurrPoolContractAmt(this.sideChainClient!);
        contractSuccess = true;
      } catch (ex) {
        logger.error(ex);
        retryTimes++;
        logger.error(`Fail on contract - Retry times : ${retryTimes}`);
      }
    }
    if (retryTimes >= 20) {
      logger.error(
        'Fail to get contract amts, proceed to other table creation',
      );
    }
    logger.info(`[Contract finished]Starts to generate reports`);

    const botCustomer = await getBotCustomer();
    //2. Create balanceSnapShot
    const respBalanceSnapShot = await this.balanceSnapShotService.create(
      dateRange,
    );
    // //3. Create profitDailyReport
    const respProfitDailyReport = await this.profitDailyReportService.create(
      dateRange,
      botCustomer,
      rajContractAmts,
      poolContractAmts,
    );
    // //4. Create pairReport
    const respPairReport = await this.pairReportSerivce.create(dateRange);
    //5. Create profitAndLossReport
    const respProfitAndLoss = await this.profitAndLossReportService.create(
      dateRange,
    );
    //6. Create dailyStatisticReport
    const respDailyStatistic = await this.dailyStatisticReportService.create(
      dateRange,
    );
    const allResps = [
      respBalanceSnapShot,
      respProfitDailyReport,
      respPairReport,
      respProfitAndLoss,
      respDailyStatistic,
    ];
    const failResult = allResps.filter((x) => !x.success);
    const resp = new ResponseBase();
    if (failResult.length > 0) {
      resp.msg = failResult.map((x) => x.msg).join('\n');
      logger.error(resp.msg);
      resp.success = false;
    } else {
      resp.msg = `Successfully create daily report on ${createdDate}`;
      logger.info(resp.msg);
      resp.success = true;
    }
    return resp;
  }

  private logCronJobStarts(name: string) {
    logger.info(
      `${name}.logCronJobStarts() starts to run at ${moment().format(
        'YYYY-MM-DD hh:mm:ss',
      )}`,
    );
  }

  private logCronJobEnds(name: string) {
    logger.info(
      `${name}.logCronJobEnds() ends to run at ${moment().format(
        'YYYY-MM-DD hh:mm:ss',
      )}`,
    );
  }
}
