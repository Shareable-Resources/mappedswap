#!/usr/bin/env node
import seq from '../sequelize';
import * as SeqModel from '../model/seqModel/0_index';
import * as DBModel from '../model/dbModel/0_index';
import PriceHistoryRef from '../model/dbModel/PriceHistoryRef';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import sqlFuncs from './sqlFunctions/SQLFunctions';
import logger from '../util/ServiceLogger';
import foundationConfigJSON from '../../config/FoundationConfig.json';
const foundationConfig =
  foundationConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];
export async function createSqlFunction(): Promise<void> {
  for (let i = 0; i < sqlFuncs.length; i++) {
    try {
      await seq.sequelize.query(sqlFuncs[i].sql);
    } catch (e) {
      logger.error(e);
    }
  }
}
export async function removeSqlFunction(): Promise<void> {
  for (let i = 0; i < sqlFuncs.length; i++) {
    try {
      await seq.sequelize.query(`DROP FUNCTION IF EXISTS ${sqlFuncs[i].name};`);
    } catch (e) {
      logger.error(e);
    }
  }
}
export async function resetTable(): Promise<void> {
  console.log('seq: ', seq);
  const dateNow = new Date();
  const testDate = moment('2021-09-11').startOf('day').toDate();
  await seq.assertDatabaseConnectionOk();
  const modelModule = seq.sequelize.models;
  await removeSqlFunction();
  await seq.sequelize.drop();
  await seq.sequelize.sync({ force: true });
  const dummyPrices: DBModel.Prices[] = [
    {
      pairName: 'ETHM/USDM',
      reserve0: '9086175534189845267823773',
      reserve1: '36226355949503108',
      createdDate: new Date(),
    },
    {
      pairName: 'BTCM/USDM',
      reserve0: '492033094183621870992750',
      reserve1: '23431875995413998',
      createdDate: new Date(),
    },
  ];

  const dummyPRiceHistoriesRefs: DBModel.PriceHistoryRef[] = [];

  const dummyPrice: DBModel.Prices[] = [];

  //Insert------------------------
  //Agent

  //await modelModule[SeqModel.name.Agent].bulkCreate(dummyAgents);
  // await modelModule[SeqModel.name.Customer].bulkCreate(dummyCustomers);
  // await modelModule[SeqModel.name.CustomerCreditUpdate].bulkCreate(
  //   dummyCustomerCreditUpdates,
  // );

  // //DApp
  // await modelModule[SeqModel.name.Balance].bulkCreate(dummyBalances);
  // await modelModule[SeqModel.name.BalanceHistory].bulkCreate(
  //   dummyBalanceHistories,
  // );
  // await modelModule[SeqModel.name.PriceHistory].bulkCreate(dummyPriceHistories);
  // await modelModule[SeqModel.name.PriceHistoryRef].bulkCreate(
  //   dummyPRiceHistoriesRefs,
  // );
  // await modelModule[SeqModel.name.Stopout].bulkCreate(dummyStopouts);
  await modelModule[SeqModel.name.Prices].bulkCreate(dummyPrices);
  // await modelModule[SeqModel.name.AgentDailyReport].bulkCreate(
  //   dummyAgentDailyReports,
  // );

  // await modelModule[SeqModel.name.Price].bulkCreate(dummyPrice);
  /*


  await modelModule[SeqModel.name.CommisionLedger].bulkCreate(
    dummyCommisionLedgers,
  );
  await modelModule[SeqModel.name.CommisionSummary].bulkCreate(
    dummyCommisionSummaries,
  );
  await modelModule[SeqModel.name.CommisionDistribution].bulkCreate(
    dummyCommisionDistributions,
  );*/
  //console.log by css
  await createSqlFunction();
  // await modelModule[SeqModel.name.Transaction].bulkCreate(dummyTransactions);
  console.log(
    '%c ----- Done creating dummy table and data for DB! ----- ',
    'color:green',
  );
}
