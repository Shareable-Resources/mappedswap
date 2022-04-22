import { IAuthConfig } from '../old/AuthClient';

export class ServerConfigBase implements IAuthConfig {
  abiJsonPath = '';
  logFilePath = '';
  serviceId = 0;
  groupId = 0;
  configServerIP = '';
  configServerPort = 0;

  dbServerIP = '';
  dbServerPort = 5432;
  dbUserName = '';
  dbPassword = '';
  dbDatabaseName = '';
  dbSchemaName = '';
  dbAesKey = '';

  ethClientProtocol = '';
  ethClientIP = '';
  ethClientPort = 8545;
  ethClientChainID = 0;

  authServerIp = '';
  authServerPort = 0;
  privateKey = '';
  authPath = '';

  httpServerIP = '';
  httpServerPort = 0;

  retryCount = 3;
  retryInterval = 1000;

  public getAuthIp(): string {
    return this.authServerIp;
  }

  public getAuthPort(): number {
    return this.authServerPort;
  }
  public getServiceId(): number {
    return this.serviceId;
  }

  public getPrivateKey(): string {
    return this.privateKey;
  }

  public getAuthPath(): string {
    return this.authPath;
  }

  public getSideChainEthUrl(): string {
    const url = `${this.ethClientProtocol}://${this.ethClientIP}:${this.ethClientPort}`;
    return url;
  }
}
