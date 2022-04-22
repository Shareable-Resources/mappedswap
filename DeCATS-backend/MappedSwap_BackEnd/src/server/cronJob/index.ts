//import Big from 'big.js';
import { initFoundationGlobalVar } from '../../foundation/const/globalVar';
import FoundationConfig from '../../foundation/model/FoundationConfig';
import { ConfigName, readFile } from '../../foundation/utils/ReadFileHelper';
import globalVar from './const/globalVar';
import CronJobServerConfig from './model/CronJobServerConfig';
//import { startService } from './2_StartService';
//import { enterPriKey } from './1_EnterPriKey';
let logger: any;

async function loadConfig() {
  const env = process.env.NODE_ENV;
  //Read Config First
  const readServerFileResult = await readFile(ConfigName.CronJob);
  const serviceConfig: CronJobServerConfig = readServerFileResult.data;
  const readFoundationFileResult = await readFile(ConfigName.Foundation);
  const foundationConfig: FoundationConfig = readFoundationFileResult.data;
  if (env) {
    globalVar.cronJobConfig = serviceConfig;
    globalVar.foundationConfig = foundationConfig;
    initFoundationGlobalVar(globalVar.foundationConfig);
    logger = await import('./util/ServiceLogger');
    logger.default.info(
      `Starting ${globalVar.cronJobConfig.name} Service with env [${env}]`,
    );
  } else {
    console.log(`No environment is supplied, please support enviroment`);
  }
}

(async () => {
  try {
    await loadConfig();
    const enterPriKey = await import('./1_EnterPriKey');
    await enterPriKey.enterPriKey();
  } catch (e) {
    console.log(JSON.stringify(e));
  }
})();
