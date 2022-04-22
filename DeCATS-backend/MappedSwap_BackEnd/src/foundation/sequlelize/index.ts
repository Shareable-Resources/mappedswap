import { Dialect, Options, Sequelize } from 'sequelize';
import winston from 'winston';
import globalVar from '../const/globalVar';

export default abstract class Db {
  sequelize: Sequelize;
  logger: winston.Logger;
  constructor(
    config: any,
    dialect: Dialect | undefined,
    logger: winston.Logger,
  ) {
    this.logger = logger;
    const parsedConfig = config.sequelize as Options;
    parsedConfig.dialect = dialect;
    parsedConfig.dialectOptions = {
      supportBigNumbers: true,
      bigNumberStrings: true,
      application_name: config.name ? config.name : 'MappedSwap',
      // useUTC: true, // for reading from database
      options: {
        // useUTC: true, // for reading from database
        // requestTimeout: 90000,
        appName: config.name ? config.name : 'MappedSwap',
      },
    };
    parsedConfig.hooks = {};
    parsedConfig.pool = {
      max: 20,
    };

    //This control whehter sql should be exported to console and file
    if (config.sequelize.logging) {
      parsedConfig.logging = (msg) => {
        this.logger.debug(msg);
      };
    } else {
      parsedConfig.logging = false;
    }
    this.sequelize = new Sequelize(
      // config.sequelize.database,
      // config.sequelize.username,
      // config.sequelize.password,
      globalVar.dbConnection.database,
      // this.decrypt(config.sequelize.database),
      globalVar.dbConnection.username,
      // await this.decrypt(config.sequelize.username),
      globalVar.dbConnection.password,
      // await this.decrypt(config.sequelize.password),
      parsedConfig,
    );

    this.bindModelsToSeq();
    this.setupRelationshipToSeq();
  }

  public async assertDatabaseConnectionOk() {
    try {
      await this.sequelize?.authenticate();
    } catch (error) {
      this.logger.error(error);
      process.exit(1);
    }
  }

  public async testDatabaseConnectionOk() {
    await this.sequelize?.authenticate();
  }

  abstract bindModelsToSeq();

  abstract setupRelationshipToSeq();

  // decrypt(base64String: string): any {
  //   const encryptionType = 'aes-256-cbc';
  //   const encryptionEncoding = 'base64';
  //   const bufferEncryption = 'utf-8';

  //   //logger.info('process.argv[2]: ' + process.argv[2]);
  //   //logger.info('process.argv[3]: ' + process.argv[3]);
  //   // logger.info('encryptionKey: ' + encryptionKey);
  //   // logger.info('encryptionIV: ' + encryptionIV);

  //   // const aesKey = process.argv[2];
  //   // const aesIV = process.argv[3];
  //   let aesKey = '';
  //   if (!encryptionKey) {
  //     aesKey = process.argv[2];
  //   } else {
  //     aesKey = encryptionKey;
  //   }
  //   let aesIV = encryptionIV;
  //   if (!encryptionIV) {
  //     aesIV = process.argv[3];
  //   } else {
  //     aesIV = encryptionIV;
  //   }

  //   const buff = Buffer.from(base64String, encryptionEncoding);
  //   const key = Buffer.from(aesKey!, bufferEncryption);
  //   const iv = Buffer.from(aesIV!, bufferEncryption);
  //   const decipher = crypto.createDecipheriv(encryptionType, key, iv);
  //   // const deciphered = decipher.update(buff) + decipher.final();
  //   const deciphered = Buffer.concat([decipher.update(buff), decipher.final()]);
  //   return JSON.parse(deciphered.toString());
  // }
}
