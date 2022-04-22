import winston from 'winston';
import { ServerBase } from '../../../foundation/server/ServerBase';
import { ServerConfigBase } from '../../../foundation/server/ServerConfigBase';
import logger from '../util/ServiceLogger';
import schedule from 'node-schedule';
import moment from 'moment';
import globalVar from '../const/globalVar';
import DailySettlementService from '../service/DailySettlementService';
import MonitorCronJobService from '../service/MonitorCronJobService';
import { AgentType } from '../../../general/model/dbModel/Agent';
//Add custom function or specific objects in here for this server
export class CronJobServer extends ServerBase {
  logger?: winston.Logger; // you can import this logger by import or just use HelloWorldUserServer.logger by instance
  dailySettlementService: DailySettlementService | null = null;
  monitorCronJobService: MonitorCronJobService | null = null;
  constructor(configBase: ServerConfigBase) {
    super(configBase);
    this.logger = logger;
  }
  /**
   * CronJob will run in a period of time based on cronFormat
   * CronFormat description : https://www.freeformatter.com/cron-expression-generator-quartz.html
   */
  async cronJob() {
    let query: any = {};
    const job = schedule.scheduleJob(
      '[DailySettlement][createRealTimeOrInsert]',
      globalVar.cronJobConfig.cronJob.dailySettlement.cronFormat.realTime,
      async () => {
        this.logCronJobStarts('[DailySettlement][createRealTimeOrInsert]');
        if (!this.dailySettlementService) {
          this.dailySettlementService = new DailySettlementService();
          query = {
            createdDate: moment().format('YYYY-MM-DD HH:mm:ss'),
          };
          try {
            await this.dailySettlementService.createRealTimeOrInsert(query);
          } catch (ex) {
            logger.error('Cannot cronJob');
            logger.error(ex);
            // null to release memory
            this.dailySettlementService = null;
          }
          // null to release memory
          this.dailySettlementService = null;
        } else {
          logger.info(
            `Last [DailySettlement][createRealTimeOrInsert] is still running for ${query.createdDate}`,
          );
        }
        this.logCronJobEnds('[DailySettlement][createRealTimeOrInsert]');
      },
    );
    const job2 = schedule.scheduleJob(
      '[DailySettlement][monitorCronJobStatus]',
      globalVar.cronJobConfig.cronJob.dailySettlement.cronFormat.monitorCronJob,

      async () => {
        this.logCronJobStarts('[DailySettlement][monitorCronJobStatus]');

        if (!this.monitorCronJobService) {
          try {
            this.monitorCronJobService = new MonitorCronJobService();
            await this.monitorCronJobService.monitor();
          } catch (ex) {
            logger.error(ex);
            // null to release memory
            this.monitorCronJobService = null;
          }
          // null to release memory
          this.monitorCronJobService = null;
        } else {
          logger.info(
            `Last [DailySettlement][monitorCronJobStatus] is still running for ${query.createdDate}`,
          );
        }
        this.logCronJobEnds('[DailySettlement][monitorCronJobStatus]');
      },
    );

    const cronJobs: string[] = [];
    for (const [key, value] of Object.entries(schedule.scheduledJobs)) {
      cronJobs.push(key);
    }
    logger.info(`CronJob is ruinnging for : ${cronJobs.join(', ')}`);
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
