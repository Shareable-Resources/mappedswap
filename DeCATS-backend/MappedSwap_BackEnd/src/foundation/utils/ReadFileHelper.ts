import fs, { promises as fsPromise } from 'fs';
import logger from './ServiceLogger';

export enum ConfigName {
  Agent = 'AgentServerConfig',
  CronJob = 'CronJobServerConfig',
  DApp = 'DAppServerConfig',
  MappedSwap = 'MappedSwapConfig',
  Foundation = 'FoundationConfig',
  MiningRewards = 'MiningRewardsServerConfig',
  OnlineDataFetcher = 'OnlineDataFetcherConfig',
  Ethereum = 'EthereumConfig',
  ProfitDailyReport = 'ProfitDailyReportConfig',
  Event = 'EventConfig',
}

export async function readFile(nameOfServerConfig: ConfigName) {
  const currWorkDir = process.cwd();
  const env = process.env.NODE_ENV;
  const path = `${currWorkDir}/config/${env}/${nameOfServerConfig}.json`;
  logger.info(`Getting config from ${path}`);
  let jsonFile: any;
  let jsonData: any;

  if (fs.existsSync(path)) {
    jsonFile = await fsPromise.readFile(path, 'binary');
    jsonData = Buffer.from(jsonFile);
  } else {
    throw new Error(`File cannot be found,[${nameOfServerConfig}] (${path})`);
  }

  return {
    path: path,
    data: JSON.parse(jsonData),
  };
}
