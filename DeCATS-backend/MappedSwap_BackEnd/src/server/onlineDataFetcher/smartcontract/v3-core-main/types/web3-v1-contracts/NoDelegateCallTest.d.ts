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

export interface NoDelegateCallTest extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): NoDelegateCallTest;
  clone(): NoDelegateCallTest;
  methods: {
    callsIntoNoDelegateCallFunction(): NonPayableTransactionObject<void>;

    canBeDelegateCalled(): NonPayableTransactionObject<string>;

    cannotBeDelegateCalled(): NonPayableTransactionObject<string>;

    getGasCostOfCanBeDelegateCalled(): NonPayableTransactionObject<string>;

    getGasCostOfCannotBeDelegateCalled(): NonPayableTransactionObject<string>;
  };
  events: {
    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };
}