import winston from 'winston';
import { ServerBase } from '../../../foundation/server/ServerBase';
import { ServerConfigBase } from '../../../foundation/server/ServerConfigBase';
import logger from '../util/serviceLogger';
import { UniSwapFetcher } from '../fetcher/UniSwapFetcher';
import { EthClient } from '../../../foundation/utils/ethereum/EthClient';
export class OnlineDataFetcher extends ServerBase {
  logger?: winston.Logger; // you can import this logger by import
  uniswapFetcher?: UniSwapFetcher;
  ethereumETHClient?: EthClient;
  constructor(configBase: ServerConfigBase) {
    super(configBase);
    this.logger = logger;
  }
}
