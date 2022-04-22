#!/usr/bin/env node
import seq from './sequelize';
import * as SeqModel from './model/seqModel/0_index';
import * as DBModel from './model/dbModel/0_index';
import { TransactionStatus } from './model/dbModel/Transaction';
import {
  CustomerContractStatus,
  CustomerStatus,
} from './model/dbModel/Customer';
import { AgentStatus } from './model/dbModel/Agent';
import { BalanceStatus } from './model/dbModel/Balance';
import {
  BalanceHistoryStatus,
  BalanceHistoryTypes,
} from './model/dbModel/BalanceHistory';
import { PriceHistoryStatus } from './model/dbModel/PriceHistory';
import { CustomerCreditUpdateStatus } from './model/dbModel/CustomerCreditUpdate';
import { InterestHistoryStatus } from './model/dbModel/InterestHistory';
import PriceHistoryRef from './model/dbModel/PriceHistoryRef';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import sqlFuncs from './script/sqlFunctions/SQLFunctions';
import logger from './util/ServiceLogger';
import { CommissionJobStatus } from './model/dbModel/CommissionJob';
import { CommissionDistributionStatus } from './model/dbModel/CommissionDistribution';
import { CronJobStatus, CronJobType } from './model/dbModel/CronJob';
import globalVar from './const/globalVar';
import { ProfitDailyReport } from './model/dbModel/0_index';
import { EventDistType, EventStatus } from './model/dbModel/Event';
import Big from 'big.js';
import { EventParticipantStatus } from './model/dbModel/EventParticipant';
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

  //Agent
  const dummyAgents: DBModel.Agent[] = [
    {
      //1
      id: null,
      address: '0xabaf0503d06ac5d222653f3294a134db3ca98e29',
      name: '1',
      password:
        '0x48bed44d1bcd124a28c27f343a817e5f5243190d3c52bf347daf876de1dbbf77',
      email: '1@gmail.com',
      parentAgentId: null,
      interestPercentage: 100,
      feePercentage: 100,
      referralCodeId: null,
      fundingCodeId: null,
      agentType: 0,
      agentLevel: 0,
      createdDate: dateNow,
      createdById: 0,
      lastModifiedDate: dateNow,
      lastModifiedById: 0,
      status: AgentStatus.StatusActive,
      role: null,
      signData:
        '{"id":"39","address":"0xabaf0503d06ac5d222653f3294a134db3ca98e29"}',
      allowViewAgent: false,
      parentTree: [],
    },
    {
      //2
      id: null,
      address: '0x227460d406f0937ecd982b20cfff5a92e7fc4c2b',
      name: '2',
      password:
        '0x48bed44d1bcd124a28c27f343a817e5f5243190d3c52bf347daf876de1dbbf77',
      email: '2@gmail.com',
      parentAgentId: 1,
      interestPercentage: 100,
      feePercentage: 100,
      referralCodeId: null,
      fundingCodeId: null,
      agentType: 0,
      agentLevel: 0,
      createdDate: dateNow,
      createdById: 0,
      lastModifiedDate: dateNow,
      lastModifiedById: 0,
      status: AgentStatus.StatusActive,
      role: null,
      signData:
        '{"id":"4","address":"0x227460d406f0937ecd982b20cfff5a92e7fc4c2b"}',
      allowViewAgent: false,
      parentTree: [],
    },
    {
      //3
      id: null,
      address: '0xc316a94074fe5c387d6099e286e7f05a4dfc599f',
      name: '3',
      password:
        '0x48bed44d1bcd124a28c27f343a817e5f5243190d3c52bf347daf876de1dbbf77',
      email: '3@gmail.com',
      parentAgentId: 1,
      interestPercentage: 100,
      feePercentage: 100,
      referralCodeId: null,
      fundingCodeId: null,
      agentType: 0,
      agentLevel: 0,
      createdDate: dateNow,
      createdById: 0,
      lastModifiedDate: dateNow,
      lastModifiedById: 0,
      status: AgentStatus.StatusActive,
      role: null,
      signData:
        '{"id":"23","address":"0xc316a94074fe5c387d6099e286e7f05a4dfc599f"}',
      allowViewAgent: false,
      parentTree: [],
    },
    {
      //4
      id: null,
      address: '0xf4352e40e900207ce9fa992957d457be5423c812',
      name: '4',
      password:
        '0x48bed44d1bcd124a28c27f343a817e5f5243190d3c52bf347daf876de1dbbf77',
      email: '4@gmail.com',
      parentAgentId: 2,
      interestPercentage: 100,
      feePercentage: 100,
      referralCodeId: null,
      fundingCodeId: null,
      agentType: 0,
      agentLevel: 0,
      createdDate: dateNow,
      createdById: 0,
      lastModifiedDate: dateNow,
      lastModifiedById: 0,
      status: AgentStatus.StatusActive,
      role: null,
      signData:
        '{"id":"24","address":"0xf4352e40e900207ce9fa992957d457be5423c812"}',
      allowViewAgent: false,
      parentTree: [],
    },
    {
      //5
      id: null,
      address: '0x7b78b035b6511038b1e9d31240a253b0003783d2',
      name: '5',
      password:
        '0x48bed44d1bcd124a28c27f343a817e5f5243190d3c52bf347daf876de1dbbf77',
      email: '5@gmail.com',
      parentAgentId: 3,
      interestPercentage: 100,
      feePercentage: 100,
      referralCodeId: null,
      fundingCodeId: null,
      agentType: 0,
      agentLevel: 0,
      createdDate: dateNow,
      createdById: 0,
      lastModifiedDate: dateNow,
      lastModifiedById: 0,
      status: AgentStatus.StatusActive,
      role: null,
      signData:
        '{"id":"38","address":"0x7b78b035b6511038b1e9d31240a253b0003783d2"}',
      allowViewAgent: false,
      parentTree: [],
    },
    {
      //6
      id: null,
      address: '0xe62fB071848D892b01924A8f089555e898522Bf4',
      name: '6',
      password:
        '0x48bed44d1bcd124a28c27f343a817e5f5243190d3c52bf347daf876de1dbbf77',
      email: '6@gmail.com',
      parentAgentId: 4,
      interestPercentage: 100,
      feePercentage: 100,
      referralCodeId: null,
      fundingCodeId: null,
      agentType: 0,
      agentLevel: 0,
      createdDate: dateNow,
      createdById: 0,
      lastModifiedDate: dateNow,
      lastModifiedById: 0,
      status: AgentStatus.StatusActive,
      role: null,
      signData:
        '{"id":"37","address":"0xe62fb071848d892b01924a8f089555e898522bf4"}',
      allowViewAgent: false,
      parentTree: [],
    },
    {
      //7
      id: null,
      address: '0x4dfb6d6790054f3eb68324bc230e3104137ca8db',
      name: 'the verifier',
      password:
        '0x48bed44d1bcd124a28c27f343a817e5f5243190d3c52bf347daf876de1dbbf77',
      email: '7@gmail.com',
      parentAgentId: 5,
      interestPercentage: 100,
      feePercentage: 100,
      referralCodeId: null,
      fundingCodeId: null,
      agentType: 0,
      agentLevel: 0,
      createdDate: dateNow,
      createdById: 0,
      lastModifiedDate: dateNow,
      lastModifiedById: 0,
      status: AgentStatus.StatusActive,
      role: 'account',
      signData:
        '{"id":"2","address":"0x4dfb6d6790054f3eb68324bc230e3104137ca8db"}',
      allowViewAgent: false,
      parentTree: [],
    },
  ];
  const dummyTokens: DBModel.Token[] = [
    {
      id: null,
      name: 'BTCM',
      address:
        globalVar.foundationConfig.smartcontract.MappedSwap[
          'OwnedBeaconProxy<BTCM>'
        ].address,
      decimals: 18,
    },
    {
      id: null,
      name: 'ETHM',
      address:
        globalVar.foundationConfig.smartcontract.MappedSwap[
          'OwnedBeaconProxy<ETHM>'
        ].address,
      decimals: 18,
    },
    {
      id: null,
      name: 'USDM',
      address:
        globalVar.foundationConfig.smartcontract.MappedSwap[
          'OwnedBeaconProxy<USDM>'
        ].address,
      decimals: 6,
    },
  ];

  const dummyCustomers: DBModel.Customer[] = [
    {
      id: null,
      address: '0xd1abc154B43368b8B0B960fA9Ab84545cA1cf816',
      name: 'abc',
      agentId: 1,
      leverage: 10000,
      maxFunding: 2000000000 * 1000000,
      creditMode: 0,
      contractStatus: CustomerContractStatus.StatusEnabled,
      riskLevel: 100,
      fundingCodeId: 0,
      type: 0,
      createdDate: dateNow,
      createdById: null,
      lastModifiedDate: dateNow,
      lastModifiedById: null,
      status: CustomerStatus.StatusActive,
    },
    {
      id: null,
      address: '2x7D26e342DGe234324FEgfd345435gF34f4H4324341',
      name: 'abc',
      agentId: 2,
      leverage: 10000,
      maxFunding: 2000000000 * 1000000,
      creditMode: 0,
      contractStatus: CustomerContractStatus.StatusEnabled,
      riskLevel: 100,
      fundingCodeId: 0,
      type: 0,
      createdDate: dateNow,
      createdById: null,
      lastModifiedDate: dateNow,
      lastModifiedById: null,
      status: CustomerStatus.StatusActive,
    },
  ];
  const dummyCustomerCreditUpdates: DBModel.CustomerCreditUpdate[] = [
    {
      id: null,
      address: 'FAKE',
      customerId: 1,
      agentId: 1,
      origCredit: 0,
      credit: 1000,
      txHash: '0x12412151251241',
      txStatus: TransactionStatus.Confirmed,
      gasFee: 10,
      txTime: dateNow,
      createdDate: dateNow,
      createdById: null,
      lastModifiedDate: dateNow,
      lastModifiedById: null,
      status: CustomerCreditUpdateStatus.StatusActive,
    },
    {
      id: null,
      address: 'FAKE2',
      customerId: 1,
      agentId: 1,
      origCredit: 0,
      credit: 1000,
      txHash: '0x12412151251242',
      txStatus: TransactionStatus.Confirmed,
      gasFee: 10,
      txTime: dateNow,
      createdDate: dateNow,
      createdById: null,
      lastModifiedDate: dateNow,
      lastModifiedById: null,
      status: CustomerCreditUpdateStatus.StatusActive,
    },
    {
      id: null,
      address: 'FAKE3',
      customerId: 1,
      agentId: 1,
      origCredit: 0,
      credit: 1000,
      txHash: '0x12412151251243',
      txStatus: TransactionStatus.Confirmed,
      gasFee: 10,
      txTime: dateNow,
      createdDate: dateNow,
      createdById: null,
      lastModifiedDate: dateNow,
      lastModifiedById: null,
      status: CustomerCreditUpdateStatus.StatusActive,
    },
  ];
  //DApp
  const dummyAgentDailyReports: DBModel.AgentDailyReport[] = [];
  const dummyBalances: DBModel.Balance[] = [
    {
      id: null,
      address: '0xCustomer1Address',
      customerId: 1,
      agentId: 1,
      token: 'USDL',
      balance: 100,
      interest: 0,
      updateTime: dateNow,
      status: BalanceStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer1Address',
      customerId: 1,
      agentId: 1,
      token: 'BTCL',
      balance: 10,
      interest: 0,
      updateTime: dateNow,
      status: BalanceStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer1Address',
      customerId: 1,
      agentId: 1,
      token: 'ETHL',
      balance: -10,
      interest: 0,
      updateTime: dateNow,
      status: BalanceStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer2Address',
      customerId: 2,
      agentId: 1,
      token: 'USDL',
      balance: 500,
      interest: 0,
      updateTime: dateNow,
      status: BalanceStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer2Address',
      customerId: 2,
      agentId: 1,
      token: 'ETHL',
      balance: -50,
      interest: 0,
      updateTime: dateNow,
      status: BalanceStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer2Address',
      customerId: 2,
      agentId: 1,
      token: 'BTCL',
      balance: 50,
      interest: 0,
      updateTime: dateNow,
      status: BalanceStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer5Address',
      customerId: 5,
      agentId: 2,
      token: 'USDL',
      balance: 0,
      interest: 0,
      updateTime: dateNow,
      status: BalanceStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer5Address',
      customerId: 5,
      agentId: 2,
      token: 'ETHL',
      balance: -100,
      interest: 0,
      updateTime: dateNow,
      status: BalanceStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer5Address',
      customerId: 5,
      agentId: 2,
      token: 'BTCL',
      balance: 0,
      interest: 0,
      updateTime: dateNow,
      status: BalanceStatus.StatusCreated,
    },
  ];
  const dummyBalanceHistories: DBModel.BalanceHistory[] = [
    //USDL
    {
      id: null,
      address: '0xCustomer1Address',
      customerId: 1,
      agentId: 1,
      token: 'USDL',
      type: BalanceHistoryTypes.Deposit,
      amount: 20,
      balance: 20,
      updateTime: dateNow,
      txHash: '0xTxHash1',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer1Address',
      customerId: 1,
      agentId: 1,
      token: 'USDL',
      type: BalanceHistoryTypes.Deposit,
      amount: 50,
      balance: 70,
      updateTime: dateNow,
      txHash: '0xTxHash2',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer1Address',
      customerId: 1,
      agentId: 1,
      token: 'USDL',
      type: BalanceHistoryTypes.Deposit,
      amount: 50,
      balance: 120,
      updateTime: dateNow,
      txHash: '0xTxHash3',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer1Address',
      customerId: 1,
      agentId: 1,
      token: 'USDL',
      type: BalanceHistoryTypes.Withdraw,
      amount: -20,
      balance: 100,
      updateTime: dateNow,
      txHash: '0xTxHash4',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },
    //BTCL
    {
      id: null,
      address: '0xCustomer1Address',
      customerId: 1,
      agentId: 1,
      token: 'BTCL',
      type: BalanceHistoryTypes.Deposit,
      amount: 5,
      balance: 5,
      updateTime: dateNow,
      txHash: '0xTxHash5',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer1Address',
      customerId: 1,
      agentId: 1,
      token: 'BTCL',
      type: BalanceHistoryTypes.Deposit,
      amount: 5,
      balance: 10,
      updateTime: dateNow,
      txHash: '0xTxHash6',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },
    //ETHL
    {
      id: null,
      address: '0xCustomer1Address',
      customerId: 1,
      agentId: 1,
      token: 'ETHL',
      type: BalanceHistoryTypes.Deposit,
      amount: -10,
      balance: -10,
      updateTime: dateNow,
      txHash: '0xTxHash7',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },

    //USDL
    {
      id: null,
      address: '0xCustomer2Address',
      customerId: 2,
      agentId: 1,
      token: 'USDL',
      type: BalanceHistoryTypes.Deposit,
      amount: 500,
      balance: 500,
      updateTime: dateNow,
      txHash: '0xTxHash8',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer2Address',
      customerId: 2,
      agentId: 1,
      token: 'BTCL',
      type: BalanceHistoryTypes.Deposit,
      amount: 50,
      balance: 50,
      updateTime: dateNow,
      txHash: '0xTxHash9',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer2Address',
      customerId: 2,
      agentId: 1,
      token: 'ETHL',
      type: BalanceHistoryTypes.Withdraw,
      amount: -50,
      balance: -50,
      updateTime: dateNow,
      txHash: '0xTxHash10',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer5Address',
      customerId: 5,
      agentId: 2,
      token: 'ETHL',
      type: BalanceHistoryTypes.Withdraw,
      amount: -50,
      balance: -50,
      updateTime: dateNow,
      txHash: '0xTxHash10',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },
    {
      id: null,
      address: '0xCustomer5Address',
      customerId: 5,
      agentId: 2,
      token: 'ETHL',
      type: BalanceHistoryTypes.Withdraw,
      amount: -50,
      balance: -100,
      updateTime: dateNow,
      txHash: '0xTxHash10',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: BalanceHistoryStatus.StatusCreated,
    },
  ];
  const dummyInterests: DBModel.InterestHistory[] = [
    {
      id: null,
      address: '0xCustomer1Address',
      customerId: 1,
      agentId: 1,
      fromTime: dateNow,
      toTime: dateNow,
      token: 'USDL',
      amount: 0,
      rate: 0,
      interest: 40,
      totalInterest: 40,
      createdDate: testDate,
      lastModifiedDate: testDate,
      status: InterestHistoryStatus.StatusActive,
    },
    {
      id: null,
      address: '0xCustomer2Address',
      customerId: 2,
      agentId: 2,
      fromTime: dateNow,
      toTime: dateNow,
      token: 'USDL',
      amount: 0,
      rate: 0,
      interest: 50,
      totalInterest: 50,
      createdDate: testDate,
      lastModifiedDate: testDate,

      status: InterestHistoryStatus.StatusActive,
    },
    {
      id: null,
      address: '0xCustomer3Address',
      customerId: 3,
      agentId: 3,
      fromTime: dateNow,
      toTime: dateNow,
      token: 'USDL',
      amount: 0,
      rate: 0,
      interest: 30,
      totalInterest: 30,
      createdDate: testDate,
      lastModifiedDate: testDate,
      status: InterestHistoryStatus.StatusActive,
    },
    {
      id: null,
      address: '0xCustomer4Address',
      customerId: 4,
      agentId: 4,
      fromTime: dateNow,
      toTime: dateNow,
      token: 'USDL',
      amount: 0,
      rate: 0,
      interest: 20,
      totalInterest: 20,
      createdDate: testDate,
      lastModifiedDate: testDate,
      status: InterestHistoryStatus.StatusActive,
    },
  ];
  const dummyPriceHistories: DBModel.PriceHistory[] = [
    {
      id: null,
      pairName: 'ETHL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:48:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 0,
      close: 50,
      low: 25,
      high: 50,
      volume: 200,
      interval: 60,
    },
    {
      id: null,
      pairName: 'ETHL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:49:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 5,
      close: 100,
      low: 50,
      high: 100,
      volume: 300,
      interval: 60,
    },
    {
      id: null,
      pairName: 'ETHL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:50:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 10,
      close: 200,
      low: 100,
      high: 200,
      volume: 233,
      interval: 60,
    },
    {
      id: null,
      pairName: 'ETHL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:51:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 15,
      close: 200,
      low: 50,
      high: 250,
      volume: 1000,
      interval: 60,
    },
    {
      id: null,
      pairName: 'ETHL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:52:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 12,
      close: 100,
      low: 20,
      high: 275,
      volume: 2000,
      interval: 60,
    },
    {
      id: null,
      pairName: 'ETHL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:53:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 0,
      close: 50,
      low: 25,
      high: 50,
      volume: 200,
      interval: 60,
    },
    {
      id: null,
      pairName: 'ETHL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:54:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 5,
      close: 100,
      low: 50,
      high: 100,
      volume: 300,
      interval: 60,
    },
    {
      id: null,
      pairName: 'ETHL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:55:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 10,
      close: 200,
      low: 100,
      high: 200,
      volume: 233,
      interval: 60,
    },
    {
      id: null,
      pairName: 'ETHL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:56:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 15,
      close: 200,
      low: 50,
      high: 250,
      volume: 1000,
      interval: 60,
    },
    {
      id: null,
      pairName: 'ETHL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:57:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 12,
      close: 100,
      low: 20,
      high: 275,
      volume: 2000,
      interval: 60,
    },
    {
      id: null,
      pairName: 'BTCL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:48:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 0,
      close: 50,
      low: 25,
      high: 50,
      volume: 200,
      interval: 60,
    },
    {
      id: null,
      pairName: 'BTCL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:49:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 5,
      close: 100,
      low: 50,
      high: 100,
      volume: 300,
      interval: 60,
    },
    {
      id: null,
      pairName: 'BTCL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:50:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 200,
      close: 20,
      low: 1,
      high: 100,
      volume: 490,
      interval: 60,
    },
    {
      id: null,
      pairName: 'BTCL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:51:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 15,
      close: 200,
      low: 50,
      high: 250,
      volume: 1000,
      interval: 60,
    },
    {
      id: null,
      pairName: 'BTCL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:52:00'),
      status: PriceHistoryStatus.StatusPending,
      open: 12,
      close: 100,
      low: 20,
      high: 275,
      volume: 2000,
      interval: 60,
    },
  ];
  const dummyTransactions: DBModel.Transaction[] = [
    // {
    //   id: null,
    //   address: '0xCustomer1Address',
    //   customerId: 1,
    //   agentId: 1,
    //   sellToken: 'USDL',
    //   sellAmount: 40,
    //   buyToken: null,
    //   buyAmount: 0,
    //   txHash:
    //     '0x44cb9b4fa7bad9f781846619072bc1017d821fc77385f822ff080c461af32011',
    //   txTime: new Date('2021-09-07 18:15:43'),
    //   txStatus: TransactionStatus.StatusPending,
    //   gasFee: 0,
    //   blockHeight: 6556990,
    //   blockHash:
    //     '0xf6529d7bb7bc616eb98537cea372843721bdda8eeaba2929498ff6abe24d3940',
    //   createdDate: testDate,
    //   lastModifiedDate: testDate,
    // },
    // {
    //   id: null,
    //   address: '0xCustomer2Address',
    //   customerId: 2,
    //   agentId: 2,
    //   sellToken: 'USDL',
    //   sellAmount: 50,
    //   buyToken: null,
    //   buyAmount: 0,
    //   txHash:
    //     '0x44cb9b4fa7bad9f781846619072bc1017d821fc77385f822ff080c461af32012',
    //   txTime: new Date('2021-09-07 18:15:43'),
    //   txStatus: TransactionStatus.StatusPending,
    //   gasFee: 0,
    //   blockHeight: 6556990,
    //   blockHash:
    //     '0xf6529d7bb7bc616eb98537cea372843721bdda8eeaba2929498ff6abe24d3940',
    //   createdDate: testDate,
    //   lastModifiedDate: testDate,
    // },
    // {
    //   id: null,
    //   address: '0xCustomer3Address',
    //   customerId: 3,
    //   agentId: 3,
    //   sellToken: 'USDL',
    //   sellAmount: 30,
    //   buyToken: null,
    //   buyAmount: 0,
    //   txHash:
    //     '0x44cb9b4fa7bad9f781846619072bc1017d821fc77385f822ff080c461af32013',
    //   txTime: new Date('2021-09-07 18:15:43'),
    //   txStatus: TransactionStatus.StatusPending,
    //   gasFee: 0,
    //   blockHeight: 6556990,
    //   blockHash:
    //     '0xf6529d7bb7bc616eb98537cea372843721bdda8eeaba2929498ff6abe24d3940',
    //   createdDate: testDate,
    //   lastModifiedDate: testDate,
    // },
    // {
    //   id: null,
    //   address: '0xCustomer4Address',
    //   customerId: 4,
    //   agentId: 4,
    //   sellToken: 'USDL',
    //   sellAmount: 20,
    //   buyToken: null,
    //   buyAmount: 0,
    //   txHash:
    //     '0x44cb9b4fa7bad9f781846619072bc1017d821fc77385f822ff080c461af32014',
    //   txTime: new Date('2021-09-07 18:15:43'),
    //   txStatus: TransactionStatus.StatusPending,
    //   gasFee: 0,
    //   blockHeight: 6556990,
    //   blockHash:
    //     '0xf6529d7bb7bc616eb98537cea372843721bdda8eeaba2929498ff6abe24d3940',
    //   createdDate: testDate,
    //   lastModifiedDate: testDate,
    // },
  ];

  const dummyPRiceHistoriesRefs: DBModel.PriceHistoryRef[] = [];

  const dummyPrice: DBModel.Prices[] = [
    {
      pairName: 'ETHL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:48:00'),
    },
    {
      pairName: 'BTCL/USDL',
      reserve0: 1000186000000000000000000,
      reserve1: 3000648352544321,
      createdDate: new Date('2021-09-15 20:52:00'),
    },
  ];

  const dummyCronJobs: DBModel.CronJob[] = [
    {
      id: null,
      desc: '[CommissionJob] 2021-09-30 00:00:00 - 2021-09-30 23:59:59 [Sample] ',
      type: CronJobType.CommissionJob,
      extra: '',
      status: CronJobStatus.Finished,
      dateFrom: moment('2021-09-30').startOf('day').toDate(),
      dateTo: moment('2021-09-30').startOf('day').toDate(),
      mstToUSDMExchangeRate: 7150000,
      lastModifiedDate: moment('2021-09-30').startOf('day').toDate(),
      lastModifiedById: null,
      createdDate: moment('2021-09-30').startOf('day').toDate(),
    },
  ];

  const dummyCommissionJobs: DBModel.CommissionJob[] = [
    {
      createdDate: moment('2021-09-30').startOf('day').toDate(),
      dateFrom: moment('2021-09-30').startOf('day').toDate(),
      dateTo: moment('2021-09-30').endOf('day').toDate(),
      approvedById: null,
      approvedDate: null,
      lastModifiedById: null,
      lastModifiedDate: null,
      status: CommissionJobStatus.Approved,
      cronJobId: 1,
      roundId: null,
      remark: 'Sample Job only',
    },
    /*
    {
      createdDate: new Date(),
      dateFrom: moment('2021-01-29').startOf('day').toDate(),
      dateTo: moment('2021-02-12').startOf('day').toDate(),
      verifiedById: null,
      verifiedDate: null,
      approvedById: null,
      approvedDate: null,
      lastModifiedById: null,
      lastModifiedDate: null,
      status: CommissionJobStatus.Created,
      roundId: null,
      remark: 'Sample Job 2',
    },*/
  ];
  const dummyCommissionDistributions: DBModel.CommissionDistribution[] = [
    {
      jobId: 1,
      agentId: 1,
      status: CommissionDistributionStatus.NotAcquired,
      address: '',
      createdDate: new Date(),
      acquiredDate: null,
      txHash: null,
      txDate: null,
    },
    {
      jobId: 1,
      agentId: 2,
      address: '',
      status: CommissionDistributionStatus.NotAcquired,
      createdDate: new Date(),
      acquiredDate: null,
      txHash: null,
      txDate: null,
    },
    /*
    {
      jobId: 2,
      agentId: 1,
      status: CommissionDistributionStatus.NotAcquired,
      createdDate: new Date(),
      acquiredDate: null,
      txHash: null,
      txDate: null,
    },
    {
      jobId: 2,
      agentId: 2,
      status: CommissionDistributionStatus.NotAcquired,
      createdDate: new Date(),
      acquiredDate: null,
      txHash: null,
      txDate: null,
    },*/
  ];
  const dummyCommissionLedgers: DBModel.CommissionLedger[] = [
    {
      jobId: 1,
      token: 'USDM',
      agentId: 1,
      distCommission: 0,
      distCommissionInUSDM: 0,
      createdDate: moment('2021-01-14').startOf('day').toDate(),
    },
    {
      jobId: 1,
      token: 'BTCM',
      agentId: 1,
      distCommission: 3000,
      distCommissionInUSDM: 0,
      createdDate: moment('2021-01-14').startOf('day').toDate(),
    },
    {
      jobId: 1,
      token: 'ETHM',
      agentId: 1,
      distCommission: 1500,
      distCommissionInUSDM: 0,
      createdDate: moment('2021-01-14').startOf('day').toDate(),
    },
    {
      jobId: 1,
      token: 'USDM',
      agentId: 2,
      distCommission: 5000,
      distCommissionInUSDM: 0,
      createdDate: moment('2021-01-14').startOf('day').toDate(),
    },
    {
      jobId: 1,
      token: 'BTCM',
      agentId: 2,
      distCommission: 3000,
      distCommissionInUSDM: 0,
      createdDate: moment('2021-01-14').startOf('day').toDate(),
    },
    {
      jobId: 1,
      token: 'ETHM',
      agentId: 2,
      distCommission: 1500,
      distCommissionInUSDM: 0,
      createdDate: moment('2021-01-14').startOf('day').toDate(),
    },
    /*
    {
      id: 2,
      token: 'USDM',
      agentId: 1,
      currCommission: 1000,
      prevCommission: 999,
      distCommission: 1999,
      balance: 0,
      createdDate: moment('2021-01-29').startOf('day').toDate(),
      distJobId: null,
    },
    {
      id: 2,
      token: 'BTCM',
      agentId: 1,
      currCommission: 3000,
      prevCommission: 0,
      distCommission: 3000,
      balance: 0,
      createdDate: moment('2021-01-29').startOf('day').toDate(),
      distJobId: null, //1
    },
    {
      id: 2,
      token: 'ETHM',
      agentId: 1,
      currCommission: 4500,
      prevCommission: 0,
      distCommission: 4500,
      balance: 0,
      createdDate: moment('2021-01-29').startOf('day').toDate(),
      distJobId: null, //1
    },
    {
      id: 2,
      token: 'USDM',
      agentId: 2,
      currCommission: 4911,
      prevCommission: 0,
      distCommission: 4911,
      balance: 0,
      createdDate: moment('2021-01-29').startOf('day').toDate(),
      distJobId: null,
    },
    {
      id: 2,
      token: 'BTCM',
      agentId: 2,
      currCommission: 3000,
      prevCommission: 0,
      distCommission: 3000,
      balance: 0,
      createdDate: moment('2021-01-29').startOf('day').toDate(),
      distJobId: null, //1
    },
    {
      id: 2,
      token: 'ETHM',
      agentId: 2,
      currCommission: 4500,
      prevCommission: 0,
      distCommission: 4500,
      balance: 0,
      createdDate: moment('2021-01-29').startOf('day').toDate(),
      distJobId: null, //1
    },*/
  ];
  const dummyCommissionSummaries: DBModel.CommissionSummary[] = [
    {
      jobId: 1,
      token: 'USDM',
      distTotalCommission: 0,
      distTotalCommissionInUSDM: 0,
    },
    {
      jobId: 1,
      token: 'BTCM',
      distTotalCommission: 0,
      distTotalCommissionInUSDM: 0,
    },
    {
      jobId: 1,
      token: 'ETHM',
      distTotalCommission: 0,
      distTotalCommissionInUSDM: 0,
    },
    /*
    {
      id: 2,
      token: 'USDM',
      totalCommission: 6910,
    },
    {
      id: 2,
      token: 'BTCM',
      totalCommission: 6000,
    },
    {
      id: 2,
      token: 'ETHM',
      totalCommission: 9000,
    },*/
  ];

  const dummyEvents: DBModel.Event[] = [
    {
      id: null,
      code: 'EV-01',
      name: 'Get 12 MST based on certain conditions (Part 1)',
      createdDate: new Date(),
      status: EventStatus.Active,
      budget: null,
      quota: null,
      token: 'MST',
      distType: EventDistType.MST,
      createdById: new Big(0).toString(),
      lastModifiedById: new Big(0).toString(),
      lastModifiedDate: new Date(),
    },
  ];

  const dummyEventParticipants: DBModel.EventParticipant[] = [
    {
      id: null,
      eventId: '1',
      approvalId: '1',
      createdDate: new Date(),
      address: '0xd69e27c9f23861ebd1c081eb0afe17fbe983377b',
      amt: new Big(123).toString(),
      txHash: '0xsafasfsafsafasfsa',

      lastModifiedDate: new Date(),
      status: EventParticipantStatus.Pending,
      distedDate: new Date(),
      distedById: null,
    },
    {
      id: null,
      eventId: '1',
      approvalId: '1',
      createdDate: new Date(),
      address: '0x51e2dd0d7f8224413d9c1c6aa22582abedf23a39',
      amt: new Big(254).toString(),
      txHash: '0xsafasfsafsafasfsa2',
      lastModifiedDate: new Date(),
      status: EventParticipantStatus.Pending,
      distedDate: new Date(),
      distedById: null,
    },
  ];
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
  // await modelModule[SeqModel.name.InterestHistory].bulkCreate(dummyInterests);
  // await modelModule[SeqModel.name.PriceHistory].bulkCreate(dummyPriceHistories);
  // await modelModule[SeqModel.name.PriceHistoryRef].bulkCreate(
  //   dummyPRiceHistoriesRefs,
  // );
  // await modelModule[SeqModel.name.Stopout].bulkCreate(dummyStopouts);
  // await modelModule[SeqModel.name.Transaction].bulkCreate(dummyTransactions);
  // await modelModule[SeqModel.name.AgentDailyReport].bulkCreate(
  //   dummyAgentDailyReports,
  // );
  await modelModule[SeqModel.name.Token].bulkCreate(dummyTokens);
  await modelModule[SeqModel.name.CronJob].bulkCreate(dummyCronJobs);
  await modelModule[SeqModel.name.CommissionJob].bulkCreate(
    dummyCommissionJobs,
  );
  await modelModule[SeqModel.name.Event].bulkCreate(dummyEvents);
  await modelModule[SeqModel.name.EventParticipant].bulkCreate(
    dummyEventParticipants,
  );
  // await modelModule[SeqModel.name.EventParticipant].bulkCreate(
  //   dummyEventParticipants,
  // );
  // await modelModule[SeqModel.name.BalanceSnapshot].bulkCreate(
  //   dummyBalanceSnapshots,
  // );
  // await modelModule[SeqModel.name.ProfitDailyReport].bulkCreate(
  //   dummyProfitSummaries,
  // );
  //await modelModule[SeqModel.name.MSTDistRule].bulkCreate(dummyDistRuleMists);
  // await modelModule[SeqModel.name.Price].bulkCreate(dummyPrice);
  /*


  await modelModule[SeqModel.name.CommissionLedger].bulkCreate(
    dummyCommissionLedgers,
  );
  await modelModule[SeqModel.name.CommissionSummary].bulkCreate(
    dummyCommissionSummaries,
  );
  await modelModule[SeqModel.name.CommissionDistribution].bulkCreate(
    dummyCommissionDistributions,
  );*/
  //console.log by css

  await createSqlFunction();
  // await modelModule[SeqModel.name.Transaction].bulkCreate(dummyTransactions);
  console.log(
    '%c ----- Done creating dummy table and data for DB! ----- ',
    'color:green',
  );
}
