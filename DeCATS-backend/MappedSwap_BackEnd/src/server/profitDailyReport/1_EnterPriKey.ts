import EncryptionDetailTool, {
  EncryMsg,
} from '../../foundation/server/InputEncryptionKey';
import initDbDetail from '../../foundation/sequlelize/initDbDetail';
import globalVar from './const/globalVar';
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
      await initDB.initDbDetails(globalVar.profitDailyReportConfig);
      try {
        const seq = await import('./sequelize');
        const service = await import('./2_StartService');
        await service.testDatabaseConnectionOk();
        decryptSuccess = true;
      } catch (ex) {
        console.log(EncryMsg.failInitDb);
      }
    } catch (e) {
      console.log(EncryMsg.failKey);
    }
  }
  const service = await import('./2_StartService');
  await service.startService();
}
