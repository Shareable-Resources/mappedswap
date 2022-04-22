import config from '../config/MerchantAdminServerConfig.json';
import { Options, Sequelize } from 'sequelize';
import * as SeqModel from '../model/SeqModel/0_index';
export class Db {
  sequelize: Sequelize;
  constructor() {
    const parsedConfig = config.sequelize as Options;
    parsedConfig.dialect = 'postgres';
    parsedConfig.hooks = {};
    this.sequelize = new Sequelize(
      config.sequelize.database,
      config.sequelize.username,
      config.sequelize.password,
      parsedConfig,
    );
    this.bindModelsToSeq();
    console.log(JSON.stringify(parsedConfig));
  }

  public async assertDatabaseConnectionOk() {
    console.log(`Checking database connection...`);
    try {
      await this.sequelize?.authenticate();
      console.log('Database connection OK!');
    } catch (error) {
      console.log('Unable to connect to the database:');
      console.log(error.message);
      process.exit(1);
    }
  }

  bindModelsToSeq() {
    SeqModel.factory.MerchantClientFactory(this.sequelize);
    SeqModel.factory.MerchantAdminFactory(this.sequelize);
    SeqModel.factory.DepositLedgerFactory(this.sequelize);
    //SeqModel.factory.TokenLedgerFactory(this.sequelize);
  }
}

const db = new Db();
export default db;
