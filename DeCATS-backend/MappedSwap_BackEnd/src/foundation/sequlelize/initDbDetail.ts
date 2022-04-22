import { encryptionKey } from '../../foundation/server/InputEncryptionKey';
import ecsdaHelper from '../../foundation/utils/ecsda/ecdsa';
import { initDBConnection } from '../const/globalVar';
export default class initDB {
  async initDbDetails(serverConfig: any) {
    // const database = await ecsdaHelper.decryptByPrivateKey(
    //   encryptionKey!,
    //   serverConfig.sequelize.database,
    // );
    // const username = await ecsdaHelper.decryptByPrivateKey(
    //   encryptionKey!,
    //   serverConfig.sequelize.username,
    // );
    const database = serverConfig.sequelize.database;
    const username = serverConfig.sequelize.username;
    const password = await ecsdaHelper.decryptByPrivateKey(
      encryptionKey!,
      serverConfig.sequelize.password,
    );
    initDBConnection({
      database: database,
      username: username,
      password: password,
    });
  }
}
