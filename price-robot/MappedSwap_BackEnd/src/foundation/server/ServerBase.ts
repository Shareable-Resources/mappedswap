import { EthClient } from '../utils/ethereum/EthClient';
import { AuthClient } from '../old/AuthClient';
import express from 'express';
import { ServerConfigBase } from './ServerConfigBase';
import { Logger } from 'winston';
import Db from '../sequlelize';
import * as http from 'http';
export class ServerBase {
  configBase: ServerConfigBase;
  authClient?: AuthClient;
  logger?: Logger;
  server?: express.Express;
  httpServer?: http.Server;
  db?: Db;
  ethClient?: EthClient;

  public constructor(configBase: ServerConfigBase) {
    this.configBase = configBase;
  }

  protected setupRouter() {}
}
