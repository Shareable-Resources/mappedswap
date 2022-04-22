import EncryptionDetailTool, {
  EncryMsg,
} from '../foundation/server/InputEncryptionKey';
import initDbDetail from '../foundation/sequlelize/initDbDetail';
import globalVar from './const/globalVar';
import logger from './util/ServiceLogger';
const encryptionDetailTool = new EncryptionDetailTool();
const initDB = new initDbDetail();

export async function enterPriKey() {
  let decryptSuccess = false;
  while (!decryptSuccess) {
    if (decryptSuccess) {
      break;
    }
    await encryptionDetailTool.encryptionKey();
    try {
      await initDB.initDbDetails(globalVar.decatsConfig);
      try {
        const seq = await import('../server/agent/sequelize');
        const service = await import('./2_StartService');
        await service.testDatabaseConnectionOk();
        decryptSuccess = true;
      } catch (ex) {
        console.log(ex);
        console.log(EncryMsg.failInitDb);
      }
    } catch (e) {
      console.log(EncryMsg.failKey);
    }
  }
  console.log(process.env.initDbMode);
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV == 'local') {
    if (process.env.initDbMode == 'report') {
      console.log('Reset DB(Report)');
      const service = await import('./ResetTableScriptForReport');
      await service.resetTable();
    } else {
      console.log('Reset DB');
      const service = await import('./ResetTableScript');
      await service.resetTable();
    }
  } else {
    logger.info(`Please init with local config`);
  }
}
