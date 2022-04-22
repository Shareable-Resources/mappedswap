#!/usr/bin/env node

import seq from '../sequelize';
import moment from 'moment';
import * as SeqModel from '../model/SeqModel/0_index';
import * as DBModel from '../model/DBModel/0_index';
import { DepositLedgerStatus } from '../model/DBModel/DepositLedger';

async function reset() {
  const dateNow = new Date();
  await seq.assertDatabaseConnectionOk();
  const modelModule = seq.sequelize.models;
  await seq.sequelize.drop();
  await seq.sequelize.sync({ force: true });

  const dummyMerchantAdmins: DBModel.MerchantAdmin[] = [
    {
      operatorId: BigInt(1),
      merchantId: BigInt(1),
      username: 'MC1',
      email: 'abcdefg@gmail.com',
      passwordHash:
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
      status: 1,
      createdDate: dateNow,
      lastModifiedDate: dateNow,
    },
    {
      operatorId: BigInt(2),
      merchantId: BigInt(1),
      username: 'MC2',
      email: 'abcdefg2@gmail.com',
      passwordHash:
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
      status: 1,
      createdDate: dateNow,
      lastModifiedDate: dateNow,
    },
    {
      operatorId: BigInt(3),
      merchantId: BigInt(2),
      username: 'TC1',
      email: 'abcdefg3@gmail.com',
      passwordHash:
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
      status: 1,
      createdDate: dateNow,
      lastModifiedDate: dateNow,
    },
    {
      operatorId: BigInt(4),
      merchantId: BigInt(2),
      username: 'TC2',
      email: 'abcdefg4@gmail.com',
      passwordHash:
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
      status: 1,
      createdDate: dateNow,
      lastModifiedDate: dateNow,
    },
    {
      operatorId: BigInt(5),
      merchantId: BigInt(2),
      username: 'TC3',
      email: 'abcdefg5@gmail.com',
      passwordHash:
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
      status: 1,
      createdDate: dateNow,
      lastModifiedDate: dateNow,
    },
  ];

  const dummyUsers: DBModel.MerchantClient[] = [
    {
      id: null,
      username: 'user1',
      balance: BigInt(0),
      walletAddress: '',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: 1,
    },
    {
      id: null,
      username: 'user2',
      balance: BigInt(1500),
      walletAddress: '',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: 1,
    },
    {
      id: null,
      username: 'user3',
      balance: BigInt(0),
      walletAddress: '',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: 1,
    },
    {
      id: null,
      username: 'user4',
      balance: BigInt(0),
      walletAddress: '',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: 1,
    },
    {
      id: null,
      username: 'user5',
      balance: BigInt(0),
      walletAddress: '',
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: 1,
    },
  ];

  const dummyDeposits: DBModel.DepositLedger[] = [
    {
      txHash: '0x999999999989898989898989999999999999',
      fromWalletAddr: '0xfakeUserWalletAddr',
      fromAssetId: 'EUN',
      fromAssetAddr: '0xfakeEUNSmartContractAddr',
      fromAssetAmt: BigInt(20),
      toWalletAddr: '0xfakeChantWalletAddr',
      toTokenAmt: BigInt(500),
      rate: BigInt(1),
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: DepositLedgerStatus.DepositReceiptCollected,
      userId: BigInt(0),
      remarks: 'FAKE',
    },
    {
      txHash: '0x999999999989898989898989999999999998',
      fromWalletAddr: '0xfakeUserWalletAddr',
      fromAssetId: 'EUN',
      fromAssetAddr: '0xfakeEUNSmartContractAddr',
      fromAssetAmt: BigInt(20),
      toWalletAddr: '0xfakeChantWalletAddr',
      toTokenAmt: BigInt(500),
      rate: BigInt(1),
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: DepositLedgerStatus.DepositReceiptCollected,
      userId: BigInt(0),
      remarks: 'FAKE',
    },
    {
      txHash: '0x999999999989898989898989999999999997',
      fromWalletAddr: '0xfakeUserWalletAddr',
      fromAssetId: 'EUN',
      fromAssetAddr: '0xfakeEUNSmartContractAddr',
      fromAssetAmt: BigInt(20),
      toWalletAddr: '0xfakeChantWalletAddr',
      toTokenAmt: BigInt(250),
      rate: BigInt(1),
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: DepositLedgerStatus.DepositReceiptCollected,
      userId: BigInt(0),
      remarks: 'FAKE',
    },
    {
      txHash: '0x999999999989898989898989999999999996',
      fromWalletAddr: '0xfakeUserWalletAddr',
      fromAssetId: 'EUN',
      fromAssetAddr: '0xfakeEUNSmartContractAddr',
      fromAssetAmt: BigInt(20),
      toWalletAddr: '0xfakeChantWalletAddr',
      toTokenAmt: BigInt(150),
      rate: BigInt(1),
      createdDate: dateNow,
      lastModifiedDate: dateNow,
      status: DepositLedgerStatus.DepositReceiptCollected,
      userId: BigInt(0),
      remarks: 'FAKE',
    },
  ];
  await modelModule[SeqModel.name.MerchantAdmins].bulkCreate(
    dummyMerchantAdmins,
  );

  await modelModule[SeqModel.name.MerchantClient].bulkCreate(dummyUsers);
  await modelModule[SeqModel.name.DepositLedgers].bulkCreate(dummyDeposits);
  console.log('\x1b[36m%s\x1b[0m', 'Done!');
}

reset();
