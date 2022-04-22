import winston, { config } from 'winston';
import { ServerBase } from '../../../foundation/server/ServerBase';
import { ServerConfigBase } from '../../../foundation/server/ServerConfigBase';
import { PoolObserver } from '../observer/poolObserver';
import logger from '../util/ServiceLogger';
import * as DBModel from '../../../general/model/dbModel/0_index';

export class AgentServer extends ServerBase {
  poolObserver?: PoolObserver;

  logger?: winston.Logger; // you can import this logger by import or just use HelloWorldUserServer.logger by instance

  constructor(configBase: ServerConfigBase) {
    super(configBase);
    this.logger = logger;
  }
}
