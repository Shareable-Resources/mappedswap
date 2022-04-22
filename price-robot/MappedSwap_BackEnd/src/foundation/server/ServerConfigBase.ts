import { IAuthConfig } from '../old/AuthClient';

export class ServerConfigBase implements IAuthConfig {
  abiJsonPath: string = '';

  logFilePath: string = '';
  serviceId: number = 0;
  groupId: number = 0;
  configServerIP: string = '';
  configServerPort: number = 0;

  dbServerIP: string = '';
  dbServerPort: number = 5432;
  dbUserName: string = '';
  dbPassword: string = '';
  dbDatabaseName: string = '';
  dbSchemaName: string = '';
  dbAesKey: string = '';

  ethClientProtocol: string = '';
  ethClientIP: string = '';
  ethClientPort: number = 8545;
  ethClientChainID: number = 0;

  authServerIp: string = '';
  authServerPort: number = 0;
  privateKey: string = '';
  authPath: string = '';

  httpServerIP: string = '';
  httpServerPort: number = 0;

  retryCount: number = 3;
  retryInterval: number = 1000;

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
    let url: string = `${this.ethClientProtocol}://${this.ethClientIP}:${this.ethClientPort}`;
    return url;
  }
}
