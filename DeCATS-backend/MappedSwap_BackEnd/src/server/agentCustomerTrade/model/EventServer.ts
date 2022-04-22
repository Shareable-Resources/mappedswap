import winston from 'winston';
import { ServerBase } from '../../../foundation/server/ServerBase';
import { ServerConfigBase } from '../../../foundation/server/ServerConfigBase';
import logger from '../util/ServiceLogger';
import schedule from 'node-schedule';
import moment from 'moment';
import globalVar from '../const/globalVar';
import _ from 'json-bigint';
import LeaderboardRankingService from '../service/LeaderboardRankingService';
import EventService from '../service/EventService';
import EventTradeVolumeService from '../service/EventTradeVolumeService';
import e from 'express';
//Add custom function or specific objects in here for this server
export class EventServer extends ServerBase {
  logger?: winston.Logger; // you can import this logger by import or just use HelloWorldUserServer.logger by instance

  leaderboardRankingService: LeaderboardRankingService;
  eventService: EventService;
  eventTradeVolumeService: EventTradeVolumeService;
  constructor(configBase: ServerConfigBase) {
    super(configBase);
    this.logger = logger;
    this.leaderboardRankingService = new LeaderboardRankingService();
    this.eventService = new EventService();
    this.eventTradeVolumeService = new EventTradeVolumeService();
  }

  /**
   * CronJob will run in a period of time based on cronFormat
   * CronFormat description : https://www.freeformatter.com/cron-expression-generator-quartz.html
   */
  async cronJob() {
    const cronJobs: string[] = [];
    const job = schedule.scheduleJob(
      '[EventServer][writeTop20Leaderboards]',
      globalVar.eventConfig.event.writeTop20Leaderboards,
      async () => {
        this.logCronJobStarts('[EventServer][writeTop20Leaderboards]');
        await this.leaderboardRankingService.writeTop20Leaderboards();
        this.logCronJobEnds('[EventServer][writeTop20Leaderboards]');
      },
    );
    const job2 = schedule.scheduleJob(
      '[EventServer][distributeTokens]',
      globalVar.eventConfig.event.distributeToken,
      async () => {
        this.logCronJobStarts('[EventServer][distributeTokens]');
        if (this.eventService.isDistributing) {
          logger.info('----Still distributing last round----');
        } else {
          logger.info('----Distribute new round----');
          await this.eventService.distributeTokens();
        }
        this.logCronJobEnds('[EventServer][distributeTokens]');
      },
    );
    //Please write your trade volume code in eventService.writeTradeVolume()
    const job3 = schedule.scheduleJob(
      '[EventServer][writeTradeVolume]',
      globalVar.eventConfig.event.writeTradeVolume,
      async () => {
        this.logCronJobStarts('[EventServer][writeTradeVolume]');
        if (this.eventTradeVolumeService.isRunning) {
          logger.info('----Still running last write----');
        } else {
          logger.info('----Writing new trade volume----');
          await this.eventTradeVolumeService.writeTradeVolume();
        }

        this.logCronJobEnds('[EventServer][writeTradeVolume]');
      },
    );
    for (const [key] of Object.entries(schedule.scheduledJobs)) {
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
