import { EthClient } from './../ethereum/EthClient';

import { Crypto } from './../crypto/Crypto';
import { ServerReturnCode } from './../ServerReturnCode';
import { AuthClient, IAuthConfig } from './../auth/AuthClient';
import fs from 'fs';
import express from 'express';
import { Sequelize } from 'sequelize';
import { ServerConfigBase } from './ServerConfigBase';
import Web3 from 'web3';
import { Logger } from 'winston';
import { Db } from '../../../server/merchant_admin_service/sequelize';
import * as http from 'http';
export class ServerBase {
  configBase: ServerConfigBase;
  authClient?: AuthClient;
  logger?: Logger;
  server?: express.Express;
  httpServer?: http.Server;
  db?: Db;
  ethClient?: Web3;

  public constructor(configBase: ServerConfigBase) {
    this.configBase = configBase;
  }

  public getSideChainEthClient(): EthClient {
    let ethClient: EthClient = new EthClient(
      this.configBase.getSideChainEthUrl(),
      this.configBase.ethClientChainID,
    );
    return ethClient;
  }

  protected setupRouter() {}
}
