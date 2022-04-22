import winston from 'winston';
import { ServerBase } from '../../../foundation/server/ServerBase';
import { ServerConfigBase } from '../../../foundation/server/ServerConfigBase';
import { PriceLoader } from '../SystemTask/PriceLoader';
import { NonceLoader } from '../SystemTask/NonceLoader';
import logger from '../util/ServiceLogger';

export class DAppServer extends ServerBase {
  priceLoader?: PriceLoader;
  nonceLoader?: NonceLoader;

  logger?: winston.Logger; // you can import this logger by import or just use HelloWorldUserServer.logger by instance
  constructor(configBase: ServerConfigBase) {
    super(configBase);
    this.logger = logger;
  }
}
