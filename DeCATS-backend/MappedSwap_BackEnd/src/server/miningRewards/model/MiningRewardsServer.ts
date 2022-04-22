import winston from 'winston';
import { ServerBase } from '../../../foundation/server/ServerBase';
import { ServerConfigBase } from '../../../foundation/server/ServerConfigBase';
import logger from '../util/ServiceLogger';
import { RewardsLoader } from '../SystemTask/RewardsLoader';
//import { initMiningObserver } from '../observer/initMiningObserver';

export class miningRewardsServer extends ServerBase {
  rewardsLoader?: RewardsLoader;
  //observer?: initMiningObserver;

  logger?: winston.Logger; // you can import this logger by import or just use HelloWorldUserServer.logger by instance
  constructor(configBase: ServerConfigBase) {
    super(configBase);
    this.logger = logger;
  }
}
