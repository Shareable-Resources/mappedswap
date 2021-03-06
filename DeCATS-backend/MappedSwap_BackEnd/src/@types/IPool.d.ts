/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type Buy = ContractEventLog<{
  customer: string;
  pairName: string;
  tokenNameBuy: string;
  amountBuy: string;
  newBalanceBuy: string;
  amountSell: string;
  newBalanceSell: string;
  isStopout: boolean;
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: boolean;
}>;
export type IncreaseBalance = ContractEventLog<{
  customer: string;
  tokenName: string;
  amount: string;
  newBalance: string;
  0: string;
  1: string;
  2: string;
  3: string;
}>;
export type Interest = ContractEventLog<{
  customer: string;
  beginTime: string;
  endTime: string;
  tokenNames: string[];
  realizedBalances: string[];
  interests: string[];
  0: string;
  1: string;
  2: string;
  3: string[];
  4: string[];
  5: string[];
}>;
export type Loss = ContractEventLog<{
  customer: string;
  amount: string;
  cumulativeLoss: string;
  0: string;
  1: string;
  2: string;
}>;
export type Sell = ContractEventLog<{
  customer: string;
  pairName: string;
  tokenNameSell: string;
  amountSell: string;
  newBalanceSell: string;
  amountBuy: string;
  newBalanceBuy: string;
  isStopout: boolean;
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: boolean;
}>;
export type Stopout = ContractEventLog<{
  customer: string;
  stopoutEquity: string;
  stopoutFunding: string;
  finalBalance: string;
  0: string;
  1: string;
  2: string;
  3: string;
}>;
export type UpdateFunding = ContractEventLog<{
  customer: string;
  oldFunding: string;
  newFunding: string;
  0: string;
  1: string;
  2: string;
}>;
export type UpdateLeverage = ContractEventLog<{
  customer: string;
  oldLeverage: string;
  newLeverage: string;
  0: string;
  1: string;
  2: string;
}>;
export type UpdateMode = ContractEventLog<{
  customer: string;
  oldMode: string;
  newMode: string;
  0: string;
  1: string;
  2: string;
}>;
export type UpdatePairEnableStatus = ContractEventLog<{
  pairName: string;
  oldEnableStatus: boolean;
  newEnableStatus: boolean;
  0: string;
  1: boolean;
  2: boolean;
}>;
export type UpdateRiskLevel = ContractEventLog<{
  customer: string;
  oldRiskLevel: string;
  newRiskLevel: string;
  0: string;
  1: string;
  2: string;
}>;
export type UpdateStatus = ContractEventLog<{
  customer: string;
  oldStatus: string;
  newStatus: string;
  0: string;
  1: string;
  2: string;
}>;
export type UpdateTokenEffectiveDecimal = ContractEventLog<{
  tokenName: string;
  oldEffectiveDecimal: string;
  newEffectiveDecimal: string;
  0: string;
  1: string;
  2: string;
}>;
export type UpdateTokenInterestRate = ContractEventLog<{
  tokenName: string;
  oldInterestRate: string;
  oldEffectiveTime: string;
  newInterestRate: string;
  newEffectiveTime: string;
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
}>;
export type Withdraw = ContractEventLog<{
  customer: string;
  tokenName: string;
  amount: string;
  newBalance: string;
  0: string;
  1: string;
  2: string;
  3: string;
}>;

export interface IPool extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): IPool;
  clone(): IPool;
  methods: {
    addPair(
      tokenAName: string,
      tokenBName: string
    ): NonPayableTransactionObject<void>;

    addPoolCompensation(
      amount: number | string | BN
    ): NonPayableTransactionObject<void>;

    addPoolFunding(
      tokenName: string,
      amount: number | string | BN
    ): NonPayableTransactionObject<void>;

    addToken(
      tokenName: string,
      tokenAddr: string,
      interestRate: number | string | BN
    ): NonPayableTransactionObject<void>;

    buy(
      customer: string,
      pairName: string,
      tokenNameBuy: string,
      amountBuy: number | string | BN,
      amountSellMax: number | string | BN,
      deadline: number | string | BN
    ): NonPayableTransactionObject<void>;

    getAgents(): NonPayableTransactionObject<string[]>;

    getAllPairs(): NonPayableTransactionObject<string[]>;

    getAllTokens(): NonPayableTransactionObject<string[]>;

    getAllowance(tokenName: string): NonPayableTransactionObject<string>;

    getApprovers(): NonPayableTransactionObject<string[]>;

    getBackends(): NonPayableTransactionObject<string[]>;

    getCumulativeCompensation(): NonPayableTransactionObject<string>;

    getCumulativeLoss(): NonPayableTransactionObject<string>;

    getCustomerInfo(
      customer: string
    ): NonPayableTransactionObject<
      [
        [string, string, [string, string][], string, string][],
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string
      ]
    >;

    getDeployers(): NonPayableTransactionObject<string[]>;

    getManagementContract(): NonPayableTransactionObject<string>;

    getManagers(): NonPayableTransactionObject<string[]>;

    getOwner(): NonPayableTransactionObject<string>;

    getPairInfo(
      pairName: string
    ): NonPayableTransactionObject<
      [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        boolean
      ]
    >;

    getReferenceToken(): NonPayableTransactionObject<string>;

    getRouter(): NonPayableTransactionObject<string>;

    getTokenInfo(
      tokenName: string
    ): NonPayableTransactionObject<[string, [string, string][], string]>;

    getTokenInterestHistory(
      tokenName: string,
      limit: number | string | BN
    ): NonPayableTransactionObject<[string, string][]>;

    grantAgent(agentAddr: string): NonPayableTransactionObject<void>;

    grantApprover(approverAddr: string): NonPayableTransactionObject<void>;

    grantBackend(backendAddr: string): NonPayableTransactionObject<void>;

    grantDeployer(deployerAddr: string): NonPayableTransactionObject<void>;

    grantManager(managerAddr: string): NonPayableTransactionObject<void>;

    initialize(
      _router: string,
      _refToken: string
    ): NonPayableTransactionObject<void>;

    removePair(pairName: string): NonPayableTransactionObject<void>;

    removeToken(tokenName: string): NonPayableTransactionObject<void>;

    revokeAgent(agentAddr: string): NonPayableTransactionObject<void>;

    revokeApprover(approverAddr: string): NonPayableTransactionObject<void>;

    revokeBackend(backendAddr: string): NonPayableTransactionObject<void>;

    revokeDeployer(deployerAddr: string): NonPayableTransactionObject<void>;

    revokeManager(managerAddr: string): NonPayableTransactionObject<void>;

    sell(
      customer: string,
      pairName: string,
      tokenNameSell: string,
      amountSell: number | string | BN,
      amountBuyMin: number | string | BN,
      deadline: number | string | BN
    ): NonPayableTransactionObject<void>;

    setManagementContract(
      newManagementContract: string
    ): NonPayableTransactionObject<void>;

    stopout(customer: string): NonPayableTransactionObject<void>;

    supportsInterface(
      interfaceId: string | number[]
    ): NonPayableTransactionObject<boolean>;

    tokenReceived(
      from: string,
      amount: number | string | BN,
      data: string | number[]
    ): NonPayableTransactionObject<void>;

    transferOwnership(newOwner: string): NonPayableTransactionObject<void>;

    updateAllowance(
      tokenName: string,
      newAllowance: number | string | BN
    ): NonPayableTransactionObject<void>;

    updateCustomerDetails(
      customer: string,
      newMode: number | string | BN,
      newLeverage: number | string | BN,
      newFunding: number | string | BN,
      newRiskLevel: number | string | BN,
      newStatus: number | string | BN
    ): NonPayableTransactionObject<void>;

    updatePairEnableStatus(
      pairName: string,
      newEnableStatus: boolean
    ): NonPayableTransactionObject<void>;

    updateTokenEffectiveDecimal(
      tokenName: string,
      newEffectiveDecimal: number | string | BN
    ): NonPayableTransactionObject<void>;

    updateTokenInterestRate(
      tokenName: string,
      newInterestRate: number | string | BN
    ): NonPayableTransactionObject<void>;

    withdraw(
      tokenName: string,
      amount: number | string | BN
    ): NonPayableTransactionObject<void>;

    withdrawTo(
      toCustomer: string,
      tokenName: string,
      amount: number | string | BN
    ): NonPayableTransactionObject<void>;
  };
  events: {
    Buy(cb?: Callback<Buy>): EventEmitter;
    Buy(options?: EventOptions, cb?: Callback<Buy>): EventEmitter;

    IncreaseBalance(cb?: Callback<IncreaseBalance>): EventEmitter;
    IncreaseBalance(
      options?: EventOptions,
      cb?: Callback<IncreaseBalance>
    ): EventEmitter;

    Interest(cb?: Callback<Interest>): EventEmitter;
    Interest(options?: EventOptions, cb?: Callback<Interest>): EventEmitter;

    Loss(cb?: Callback<Loss>): EventEmitter;
    Loss(options?: EventOptions, cb?: Callback<Loss>): EventEmitter;

    Sell(cb?: Callback<Sell>): EventEmitter;
    Sell(options?: EventOptions, cb?: Callback<Sell>): EventEmitter;

    Stopout(cb?: Callback<Stopout>): EventEmitter;
    Stopout(options?: EventOptions, cb?: Callback<Stopout>): EventEmitter;

    UpdateFunding(cb?: Callback<UpdateFunding>): EventEmitter;
    UpdateFunding(
      options?: EventOptions,
      cb?: Callback<UpdateFunding>
    ): EventEmitter;

    UpdateLeverage(cb?: Callback<UpdateLeverage>): EventEmitter;
    UpdateLeverage(
      options?: EventOptions,
      cb?: Callback<UpdateLeverage>
    ): EventEmitter;

    UpdateMode(cb?: Callback<UpdateMode>): EventEmitter;
    UpdateMode(options?: EventOptions, cb?: Callback<UpdateMode>): EventEmitter;

    UpdatePairEnableStatus(cb?: Callback<UpdatePairEnableStatus>): EventEmitter;
    UpdatePairEnableStatus(
      options?: EventOptions,
      cb?: Callback<UpdatePairEnableStatus>
    ): EventEmitter;

    UpdateRiskLevel(cb?: Callback<UpdateRiskLevel>): EventEmitter;
    UpdateRiskLevel(
      options?: EventOptions,
      cb?: Callback<UpdateRiskLevel>
    ): EventEmitter;

    UpdateStatus(cb?: Callback<UpdateStatus>): EventEmitter;
    UpdateStatus(
      options?: EventOptions,
      cb?: Callback<UpdateStatus>
    ): EventEmitter;

    UpdateTokenEffectiveDecimal(
      cb?: Callback<UpdateTokenEffectiveDecimal>
    ): EventEmitter;
    UpdateTokenEffectiveDecimal(
      options?: EventOptions,
      cb?: Callback<UpdateTokenEffectiveDecimal>
    ): EventEmitter;

    UpdateTokenInterestRate(
      cb?: Callback<UpdateTokenInterestRate>
    ): EventEmitter;
    UpdateTokenInterestRate(
      options?: EventOptions,
      cb?: Callback<UpdateTokenInterestRate>
    ): EventEmitter;

    Withdraw(cb?: Callback<Withdraw>): EventEmitter;
    Withdraw(options?: EventOptions, cb?: Callback<Withdraw>): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "Buy", cb: Callback<Buy>): void;
  once(event: "Buy", options: EventOptions, cb: Callback<Buy>): void;

  once(event: "IncreaseBalance", cb: Callback<IncreaseBalance>): void;
  once(
    event: "IncreaseBalance",
    options: EventOptions,
    cb: Callback<IncreaseBalance>
  ): void;

  once(event: "Interest", cb: Callback<Interest>): void;
  once(event: "Interest", options: EventOptions, cb: Callback<Interest>): void;

  once(event: "Loss", cb: Callback<Loss>): void;
  once(event: "Loss", options: EventOptions, cb: Callback<Loss>): void;

  once(event: "Sell", cb: Callback<Sell>): void;
  once(event: "Sell", options: EventOptions, cb: Callback<Sell>): void;

  once(event: "Stopout", cb: Callback<Stopout>): void;
  once(event: "Stopout", options: EventOptions, cb: Callback<Stopout>): void;

  once(event: "UpdateFunding", cb: Callback<UpdateFunding>): void;
  once(
    event: "UpdateFunding",
    options: EventOptions,
    cb: Callback<UpdateFunding>
  ): void;

  once(event: "UpdateLeverage", cb: Callback<UpdateLeverage>): void;
  once(
    event: "UpdateLeverage",
    options: EventOptions,
    cb: Callback<UpdateLeverage>
  ): void;

  once(event: "UpdateMode", cb: Callback<UpdateMode>): void;
  once(
    event: "UpdateMode",
    options: EventOptions,
    cb: Callback<UpdateMode>
  ): void;

  once(
    event: "UpdatePairEnableStatus",
    cb: Callback<UpdatePairEnableStatus>
  ): void;
  once(
    event: "UpdatePairEnableStatus",
    options: EventOptions,
    cb: Callback<UpdatePairEnableStatus>
  ): void;

  once(event: "UpdateRiskLevel", cb: Callback<UpdateRiskLevel>): void;
  once(
    event: "UpdateRiskLevel",
    options: EventOptions,
    cb: Callback<UpdateRiskLevel>
  ): void;

  once(event: "UpdateStatus", cb: Callback<UpdateStatus>): void;
  once(
    event: "UpdateStatus",
    options: EventOptions,
    cb: Callback<UpdateStatus>
  ): void;

  once(
    event: "UpdateTokenEffectiveDecimal",
    cb: Callback<UpdateTokenEffectiveDecimal>
  ): void;
  once(
    event: "UpdateTokenEffectiveDecimal",
    options: EventOptions,
    cb: Callback<UpdateTokenEffectiveDecimal>
  ): void;

  once(
    event: "UpdateTokenInterestRate",
    cb: Callback<UpdateTokenInterestRate>
  ): void;
  once(
    event: "UpdateTokenInterestRate",
    options: EventOptions,
    cb: Callback<UpdateTokenInterestRate>
  ): void;

  once(event: "Withdraw", cb: Callback<Withdraw>): void;
  once(event: "Withdraw", options: EventOptions, cb: Callback<Withdraw>): void;
}
