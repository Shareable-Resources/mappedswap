// import { resetTable } from './ResetTableScript';
import serverConfigJSON from '../../config/OnlineDataFetcherConfig.json';
import EncryptionDetailTool from '../../foundation/server/InputEncryptionKey';
import initDbDetail from '../../foundation/sequlelize/initDbDetail';

console.log('Creating Script');

const encryptionDetailTool = new EncryptionDetailTool();
const initDB = new initDbDetail();

export async function initPassword() {
  let decryptSuccess = false;

  while (!decryptSuccess) {
    if (decryptSuccess) {
      break;
    }
    await encryptionDetailTool.encryptionKey();

    try {
      await initDB.initDbDetails(serverConfigJSON);

      try {
        // const seq = await import('./sequelize');

        // const index = await import('./init');
        // await index.testDatabaseConnectionOk();

        decryptSuccess = true;
      } catch (ex) {
        console.log('Login Failed, please input Encryption key again');
      }
    } catch (e) {
      console.log('Encryption key incorrect, please try again');
    }
  }

  //   const index = await import('./init');
  //   index.init();
  const resetTable = await import('./ResetTableScript');
  resetTable.resetTable();
}

initPassword();
