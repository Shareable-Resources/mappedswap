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

export interface SqrtPriceMathTest extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): SqrtPriceMathTest;
  clone(): SqrtPriceMathTest;
  methods: {
    getAmount0Delta(
      sqrtLower: number | string | BN,
      sqrtUpper: number | string | BN,
      liquidity: number | string | BN,
      roundUp: boolean
    ): NonPayableTransactionObject<string>;

    getAmount1Delta(
      sqrtLower: number | string | BN,
      sqrtUpper: number | string | BN,
      liquidity: number | string | BN,
      roundUp: boolean
    ): NonPayableTransactionObject<string>;

    getGasCostOfGetAmount0Delta(
      sqrtLower: number | string | BN,
      sqrtUpper: number | string | BN,
      liquidity: number | string | BN,
      roundUp: boolean
    ): NonPayableTransactionObject<string>;

    getGasCostOfGetAmount1Delta(
      sqrtLower: number | string | BN,
      sqrtUpper: number | string | BN,
      liquidity: number | string | BN,
      roundUp: boolean
    ): NonPayableTransactionObject<string>;

    getGasCostOfGetNextSqrtPriceFromInput(
      sqrtP: number | string | BN,
      liquidity: number | string | BN,
      amountIn: number | string | BN,
      zeroForOne: boolean
    ): NonPayableTransactionObject<string>;

    getGasCostOfGetNextSqrtPriceFromOutput(
      sqrtP: number | string | BN,
      liquidity: number | string | BN,
      amountOut: number | string | BN,
      zeroForOne: boolean
    ): NonPayableTransactionObject<string>;

    getNextSqrtPriceFromInput(
      sqrtP: number | string | BN,
      liquidity: number | string | BN,
      amountIn: number | string | BN,
      zeroForOne: boolean
    ): NonPayableTransactionObject<string>;

    getNextSqrtPriceFromOutput(
      sqrtP: number | string | BN,
      liquidity: number | string | BN,
      amountOut: number | string | BN,
      zeroForOne: boolean
    ): NonPayableTransactionObject<string>;
  };
  events: {
    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };
}
