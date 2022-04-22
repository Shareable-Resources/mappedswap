export default class CommonServerConfig {
  name: string;
  sequelize: {
    comment: string;
    database: string;
    username: string;
    password: string;
    host: string;
    type: string;
    port: number;
    schema: string;
    logging: boolean;
    timezone?: string;
  };
  express: {
    comment: string;
    port: number;
  };
  winston: {
    comment: string;
    console: boolean;
  };

  constructor() {
    this.name = 'CronJob';
    this.sequelize = {
      comment: '',
      database: '',
      username: '',
      password: '',
      host: '',
      type: '',
      port: 0,
      schema: '',
      logging: false,
    };
    this.express = {
      comment: '',
      port: 0,
    };
    this.winston = {
      comment: '',
      console: false,
    };
  }
}
