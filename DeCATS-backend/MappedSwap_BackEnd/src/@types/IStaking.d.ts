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

export type AddLockedStaking = ContractEventLog<{
  tokenAddr: string;
  poolAddr: string;
  userAddr: string;
  amount: string;
  stakeTime: string;
  nodeID: string;
  unlockInterval: string;
  division: string;
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
}>;
export type OwnershipTransferred = ContractEventLog<{
  previousOwner: string;
  newOwner: string;
  0: string;
  1: string;
}>;
export type RedeemToken = ContractEventLog<{
  tokenAddr: string;
  userAddr: string;
  amount: string;
  0: string;
  1: string;
  2: string;
}>;
export type RequestRedemption = ContractEventLog<{
  tokenAddr: string;
  userAddr: string;
  amount: string;
  0: string;
  1: string;
  2: string;
}>;
export type StakeToken = ContractEventLog<{
  tokenAddr: string;
  userAddr: string;
  amount: string;
  0: string;
  1: string;
  2: string;
}>;

export interface IStaking extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): IStaking;
  clone(): IStaking;
  methods: {
    onTokenTransfer(
      from: string,
      amount: number | string | BN,
      data: string | number[]
    ): NonPayableTransactionObject<boolean>;

    onTransferReceived(
      operator: string,
      from: string,
      value: number | string | BN,
      data: string | number[]
    ): NonPayableTransactionObject<string>;

    owner(): NonPayableTransactionObject<string>;

    renounceOwnership(): NonPayableTransactionObject<void>;

    supportsInterface(
      interfaceId: string | number[]
    ): NonPayableTransactionObject<boolean>;

    tokenReceived(
      from: string,
      amount: number | string | BN,
      data: string | number[]
    ): NonPayableTransactionObject<void>;

    transferOwnership(newOwner: string): NonPayableTransactionObject<void>;

    initialize(
      _redeemWaitPeriod: number | string | BN
    ): NonPayableTransactionObject<void>;

    isTokenStakeable(tokenAddr: string): NonPayableTransactionObject<boolean>;

    setTokenStakeability(
      tokenAddr: string,
      stakeability: boolean
    ): NonPayableTransactionObject<void>;

    getRedeemWaitPeriod(): NonPayableTransactionObject<string>;

    setRedeemWaitPeriod(
      newRedeemWaitPeriod: number | string | BN
    ): NonPayableTransactionObject<void>;

    lockedStakingAdder(): NonPayableTransactionObject<string>;

    setLockedStakingAdder(adderAddr: string): NonPayableTransactionObject<void>;

    stakeToken(
      tokenAddr: string,
      amount: number | string | BN
    ): NonPayableTransactionObject<void>;

    addLockedStaking(
      tokenAddr: string,
      poolAddr: string,
      userAddr: string,
      amount: number | string | BN,
      stakeTime: number | string | BN,
      nodeID: number | string | BN,
      stakeHash: string | number[],
      unlockInterval: number | string | BN,
      division: number | string | BN
    ): NonPayableTransactionObject<void>;

    requestRedemption(
      tokenAddr: string,
      amount: number | string | BN
    ): NonPayableTransactionObject<void>;

    redeemToken(tokenAddr: string): NonPayableTransactionObject<void>;

    getPoolStaked(tokenAddr: string): NonPayableTransactionObject<string>;

    getUserStaking(
      tokenAddr: string,
      userAddr: string
    ): NonPayableTransactionObject<{
      totalStaked: string;
      freeStaking: string;
      lockedStakingLocked: string;
      lockedStakingUnlocked: string;
      lockedStakingRedeemable: string;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
    }>;

    getUserStakingDetails(
      tokenAddr: string,
      userAddr: string
    ): NonPayableTransactionObject<[string, string, string, string, string][]>;

    getUserRequestedToRedeem(
      tokenAddr: string,
      userAddr: string
    ): NonPayableTransactionObject<string>;

    getUserCanRedeemNow(
      tokenAddr: string,
      userAddr: string
    ): NonPayableTransactionObject<string>;

    getUserRedemptionDetails(
      tokenAddr: string,
      userAddr: string
    ): NonPayableTransactionObject<[string, string][]>;

    deposit(
      tokenAddr: string,
      amount: number | string | BN
    ): NonPayableTransactionObject<void>;
  };
  events: {
    AddLockedStaking(cb?: Callback<AddLockedStaking>): EventEmitter;
    AddLockedStaking(
      options?: EventOptions,
      cb?: Callback<AddLockedStaking>
    ): EventEmitter;

    OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter;
    OwnershipTransferred(
      options?: EventOptions,
      cb?: Callback<OwnershipTransferred>
    ): EventEmitter;

    RedeemToken(cb?: Callback<RedeemToken>): EventEmitter;
    RedeemToken(
      options?: EventOptions,
      cb?: Callback<RedeemToken>
    ): EventEmitter;

    RequestRedemption(cb?: Callback<RequestRedemption>): EventEmitter;
    RequestRedemption(
      options?: EventOptions,
      cb?: Callback<RequestRedemption>
    ): EventEmitter;

    StakeToken(cb?: Callback<StakeToken>): EventEmitter;
    StakeToken(options?: EventOptions, cb?: Callback<StakeToken>): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "AddLockedStaking", cb: Callback<AddLockedStaking>): void;
  once(
    event: "AddLockedStaking",
    options: EventOptions,
    cb: Callback<AddLockedStaking>
  ): void;

  once(event: "OwnershipTransferred", cb: Callback<OwnershipTransferred>): void;
  once(
    event: "OwnershipTransferred",
    options: EventOptions,
    cb: Callback<OwnershipTransferred>
  ): void;

  once(event: "RedeemToken", cb: Callback<RedeemToken>): void;
  once(
    event: "RedeemToken",
    options: EventOptions,
    cb: Callback<RedeemToken>
  ): void;

  once(event: "RequestRedemption", cb: Callback<RequestRedemption>): void;
  once(
    event: "RequestRedemption",
    options: EventOptions,
    cb: Callback<RequestRedemption>
  ): void;

  once(event: "StakeToken", cb: Callback<StakeToken>): void;
  once(
    event: "StakeToken",
    options: EventOptions,
    cb: Callback<StakeToken>
  ): void;
}