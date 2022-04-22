// if (!process.env.NODE_ENV) {
//   throw new Error("NODE_ENV NOT SET!");
//   return;
// }

const {CONSTANTS} = require("./utils/Constants");
const ENV = CONSTANTS.ENV;
console.info(`Start program in environment ${ENV}`);
const envFile = `.env.${ENV}`;
require('dotenv').config(envFile);

const CONFIG = require('./utils/ConfigLoader')(ENV);
const axios = require('axios');
const prompt = require('./utils/prompt');
// const Sequelize = require('sequelize');

const util = require('./utils/utils');
const TransferHistoryService = require('./services/TransferHistoryService');
const TransferEunRewardService = require('./services/TransferEunRewardService');

const Web3 = require('web3');
const BN = Web3.utils.BN;

const POLLING_INTERVAL = CONFIG.pollingInterval;
const POLLING_LIMIT = CONFIG.pollingLimit;

let db;
let transferHistoryService;
let transferEunRewardService;
let latestSeqNo = 0;

const init = async () => {
  try {
    // prompt to get private key
    const key = await prompt.getKey();

    db = await util.connectToPostgres();
    transferHistoryService = new TransferHistoryService(db);
    transferEunRewardService = new TransferEunRewardService(db);

    await start();
  }
  catch(e) {
    console.log(e.message);
  }
}

const start = async () => {
  try {
    latestSeqNo = await transferHistoryService.findLatestSeqNo();
    // console.log(latestSeqNo);
    
    const poll = async() => { 
      let startTime = new Date();
      // check transactons need to be resent
      await resendTransactions();
      // poll confirmed transactions
      let transferRecords = await pollTransactions();
      let elapsed = new Date().getTime() - startTime;
      let timeout = 0;
      if(transferRecords < POLLING_LIMIT && elapsed < POLLING_INTERVAL){
        timeout =  POLLING_INTERVAL - elapsed;
      }
      setTimeout(poll, timeout);
    };
    poll();

    // util.tranfer({symbol: 'USDM', amount: "10", tag: "0xC0C0A43D2819eFca5a2774F9Efcb1F60Ff9873D9" });
    // await getData();
    // latestSeqNo += 5
    // await getData();
    // latestSeqNo += 5
    // await getData();
  }
  catch(e) {
    console.error("error", e);
  }
}

const pollTransactions = async () => {  
  let records = 0;
  try {
    //const response = await axios.get(`http://localhost:3001?startingSeqNo=${seqNo}&limit=${LIMIT}`)
    let startingSeqNo = latestSeqNo;
    console.log(`query from startingSeqNo = ${startingSeqNo}`);
    // get data from api
    const pollUrl = `${CONFIG.pollingApi}/transactions?startingSeqNo=${latestSeqNo + 1}&limit=${POLLING_LIMIT}`;
    console.info(`Polling data from ${pollUrl}`);
    const response = await axios.get(pollUrl,
      { 
        headers: {'X-API-Key' : CONFIG.pollingApiKey}
      }
    );

    // if (response.data && response.data.meta.hasNext) {
    //   latestSeqNo = response.data.meta.nextSeqNo;
    // }

    console.log(">>", response.data.data);
    records = response.data.data.length;
    // console.log(records);
    
    if (records) {
      // loop through api
      for(let i = 0; i < records; i++){
        let deposit = response.data.data[i];
        if(deposit.seqNo > latestSeqNo){
          latestSeqNo = deposit.seqNo;
        }

        // Transfer deposit amount
        const transferStatus = await transferHistoryService.transferDeposit(deposit);
        
        // EUN rewards
        if(transferStatus){
          let address = deposit.tag;
          await transferEunRewardService.rewardEun(address);
        }
      }
    }
  } catch (err) {
    console.log(err.message);
  }
  return records;

}

const resendTransactions = async () => {
  
}

init();
