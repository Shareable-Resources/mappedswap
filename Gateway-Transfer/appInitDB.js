const {CONSTANTS} = require("./utils/Constants");
const ENV = CONSTANTS.ENV;
console.info(`Start program in environment ${ENV}`);
const envFile = `.env.${ENV}`;
require('dotenv').config(envFile);

const util = require('./utils/utils');
const prompt = require('./utils/prompt');

let db;

const init = async () => {
  try {
    // prompt to get private key
    await prompt.getKey();

    await util.connectToPostgres(true);
  }
  catch(e) {
    console.log(e.message);
  }
}

init();