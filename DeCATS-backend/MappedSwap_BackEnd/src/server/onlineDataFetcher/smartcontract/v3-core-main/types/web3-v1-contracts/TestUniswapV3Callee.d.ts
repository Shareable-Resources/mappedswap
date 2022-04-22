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

export type FlashCallback = ContractEventLog<{
  fee0: string;
  fee1: string;
  0: string;
  1: string;
}>;
export type MintCallback = ContractEventLog<{
  amount0Owed: string;
  amount1Owed: string;
  0: string;
  1: string;
}>;
export type SwapCallback = ContractEventLog<{
  amount0Delta: string;
  amount1Delta: string;
  0: string;
  1: string;
}>;

export interface TestUniswapV3Callee extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): TestUniswapV3Callee;
  clone(): TestUniswapV3Callee;
  methods: {
    flash(
      pool: string,
      recipient: string,
      amount0: number | string | BN,
      amount1: number | string | BN,
      pay0: number | string | BN,
      pay1: number | string | BN
    ): NonPayableTransactionObject<void>;

    mint(
      pool: string,
      recipient: string,
      tickLower: number | string | BN,
      tickUpper: number | string | BN,
      amount: number | string | BN
    ): NonPayableTransactionObject<void>;

    swap0ForExact1(
      pool: string,
      amount1Out: number | string | BN,
      recipient: string,
      sqrtPriceLimitX96: number | string | BN
    ): NonPayableTransactionObject<void>;

    swap1ForExact0(
      pool: string,
      amount0Out: number | string | BN,
      recipient: string,
      sqrtPriceLimitX96: number | string | BN
    ): NonPayableTransactionObject<void>;

    swapExact0For1(
      pool: string,
      amount0In: number | string | BN,
      recipient: string,
      sqrtPriceLimitX96: number | string | BN
    ): NonPayableTransactionObject<void>;

    swapExact1For0(
      pool: string,
      amount1In: number | string | BN,
      recipient: string,
      sqrtPriceLimitX96: number | string | BN
    ): NonPayableTransactionObject<void>;

    swapToHigherSqrtPrice(
      pool: string,
      sqrtPriceX96: number | string | BN,
      recipient: string
    ): NonPayableTransactionObject<void>;

    swapToLowerSqrtPrice(
      pool: string,
      sqrtPriceX96: number | string | BN,
      recipient: string
    ): NonPayableTransactionObject<void>;

    uniswapV3FlashCallback(
      fee0: number | string | BN,
      fee1: number | string | BN,
      data: string | number[]
    ): NonPayableTransactionObject<void>;

    uniswapV3MintCallback(
      amount0Owed: number | string | BN,
      amount1Owed: number | string | BN,
      data: string | number[]
    ): NonPayableTransactionObject<void>;

    uniswapV3SwapCallback(
      amount0Delta: number | string | BN,
      amount1Delta: number | string | BN,
      data: string | number[]
    ): NonPayableTransactionObject<void>;
  };
  events: {
    FlashCallback(cb?: Callback<FlashCallback>): EventEmitter;
    FlashCallback(
      options?: EventOptions,
      cb?: Callback<FlashCallback>
    ): EventEmitter;

    MintCallback(cb?: Callback<MintCallback>): EventEmitter;
    MintCallback(
      options?: EventOptions,
      cb?: Callback<MintCallback>
    ): EventEmitter;

    SwapCallback(cb?: Callback<SwapCallback>): EventEmitter;
    SwapCallback(
      options?: EventOptions,
      cb?: Callback<SwapCallback>
    ): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "FlashCallback", cb: Callback<FlashCallback>): void;
  once(
    event: "FlashCallback",
    options: EventOptions,
    cb: Callback<FlashCallback>
  ): void;

  once(event: "MintCallback", cb: Callback<MintCallback>): void;
  once(
    event: "MintCallback",
    options: EventOptions,
    cb: Callback<MintCallback>
  ): void;

  once(event: "SwapCallback", cb: Callback<SwapCallback>): void;
  once(
    event: "SwapCallback",
    options: EventOptions,
    cb: Callback<SwapCallback>
  ): void;
}
