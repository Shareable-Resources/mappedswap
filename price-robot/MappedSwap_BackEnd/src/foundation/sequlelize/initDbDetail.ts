// import serverConfigJSON from '../../config/AgentServerConfig.json';
import { encryptionKey } from '../../foundation/server/InputEncryptionKey';
import ecsdaHelper from '../../foundation/utils/ecsda/ecdsa';

export let database: any;
export let username: any;
export let password: any;

export default class initDB {
  async initDbDetails(serverConfigJSON) {
    const serverConfig =
      serverConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];

    database = await ecsdaHelper.decryptByPrivateKey(
      encryptionKey!,
      serverConfig.sequelize.database,
    );
    username = await ecsdaHelper.decryptByPrivateKey(
      encryptionKey!,
      serverConfig.sequelize.username,
    );
    password = await ecsdaHelper.decryptByPrivateKey(
      encryptionKey!,
      serverConfig.sequelize.password,
    );
  }
}
