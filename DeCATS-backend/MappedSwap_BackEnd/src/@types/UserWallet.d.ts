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

export type Confirmation = ContractEventLog<{
  sender: string;
  transactionId: string;
  0: string;
  1: string;
}>;
export type Deposit = ContractEventLog<{
  sender: string;
  value: string;
  0: string;
  1: string;
}>;
export type Event = ContractEventLog<{
  0: string;
}>;
export type Execution = ContractEventLog<{
  transactionId: string;
  0: string;
}>;
export type ExecutionFailure = ContractEventLog<{
  transactionId: string;
  0: string;
}>;
export type OwnerAdded = ContractEventLog<{
  owner: string;
  0: string;
}>;
export type OwnerRemoved = ContractEventLog<{
  owner: string;
  0: string;
}>;
export type OwnershipTransferred = ContractEventLog<{
  previousOwner: string;
  newOwner: string;
  0: string;
  1: string;
}>;
export type ReaderAdded = ContractEventLog<{
  reader: string;
  0: string;
}>;
export type ReaderRemoved = ContractEventLog<{
  reader: string;
  0: string;
}>;
export type Rejection = ContractEventLog<{
  sender: string;
  transactionId: string;
  0: string;
  1: string;
}>;
export type RequirementChange = ContractEventLog<{
  required: string;
  0: string;
}>;
export type Revocation = ContractEventLog<{
  sender: string;
  transactionId: string;
  0: string;
  1: string;
}>;
export type Submission = ContractEventLog<{
  transactionId: string;
  0: string;
}>;
export type TopUpPaymentWalletEvent = ContractEventLog<{
  dest: string;
  targetGasWei: string;
  gasTransferred: string;
  0: string;
  1: string;
  2: string;
}>;
export type TransferEvent = ContractEventLog<{
  transactionId: string;
  dest: string;
  assetName: string;
  amount: string;
  0: string;
  1: string;
  2: string;
  3: string;
}>;
export type TransferRequestEvent = ContractEventLog<{
  transactionId: string;
  dest: string;
  assetName: string;
  amount: string;
  0: string;
  1: string;
  2: string;
  3: string;
}>;
export type WithdrawRequestEvent = ContractEventLog<{
  dest: string;
  withdrawAmount: string;
  assetName: string;
  amountWithFee: string;
  0: string;
  1: string;
  2: string;
  3: string;
}>;
export type WriterAdded = ContractEventLog<{
  writer: string;
  0: string;
}>;
export type WriterRemoved = ContractEventLog<{
  writer: string;
  0: string;
}>;

export interface UserWallet extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): UserWallet;
  clone(): UserWallet;
  methods: {
    MAX_OWNER_COUNT(): NonPayableTransactionObject<string>;

    TranList(arg0: number | string | BN): NonPayableTransactionObject<string>;

    addOwner(newOwner: string): NonPayableTransactionObject<void>;

    addReader(newReader: string): NonPayableTransactionObject<void>;

    addWalletOperator(operatorAddr: string): NonPayableTransactionObject<void>;

    addWriter(newWriter: string): NonPayableTransactionObject<void>;

    /**
     * Allows to change the number of required confirmations. Transaction has to be sent by wallet.
     * @param _required Number of required confirmations.
     */
    changeRequirement(
      _required: number | string | BN
    ): NonPayableTransactionObject<void>;

    /**
     * Allows an owner to confirm a transaction.
     * @param transactionId Transaction ID.
     */
    confirmTransaction(
      transactionId: number | string | BN
    ): NonPayableTransactionObject<void>;

    confirmations(
      arg0: number | string | BN,
      arg1: string
    ): NonPayableTransactionObject<boolean>;

    getConfirmationCount(
      transactionId: number | string | BN
    ): NonPayableTransactionObject<string>;

    getConfirmations(
      transactionId: number | string | BN
    ): NonPayableTransactionObject<string[]>;

    getOwnerCount(): NonPayableTransactionObject<string>;

    getOwners(): NonPayableTransactionObject<string[]>;

    getReaderList(): NonPayableTransactionObject<string[]>;

    getTransactionCount(
      pending: boolean,
      executed: boolean
    ): NonPayableTransactionObject<string>;

    getTransactionIds(
      from: number | string | BN,
      to: number | string | BN,
      pending: boolean,
      executed: boolean
    ): NonPayableTransactionObject<string[]>;

    getWalletOperatorList(): NonPayableTransactionObject<string[]>;

    getWalletOwner(): NonPayableTransactionObject<string>;

    getWriterList(): NonPayableTransactionObject<string[]>;

    /**
     * Returns the confirmation status of a transaction.
     * @param transactionId Transaction ID.
     */
    isConfirmed(
      transactionId: number | string | BN
    ): NonPayableTransactionObject<boolean>;

    isOwner(addr: string): NonPayableTransactionObject<boolean>;

    isRejected(
      transId: number | string | BN
    ): NonPayableTransactionObject<boolean>;

    isWriter(addr: string): NonPayableTransactionObject<boolean>;

    miscellaneousData(
      arg0: number | string | BN,
      arg1: string
    ): NonPayableTransactionObject<string>;

    rejectTransaction(
      transId: number | string | BN
    ): NonPayableTransactionObject<void>;

    removeOwner(owner: string): NonPayableTransactionObject<void>;

    removeWalletOperator(
      operatorAddr: string
    ): NonPayableTransactionObject<void>;

    removerReader(existingReader: string): NonPayableTransactionObject<void>;

    removerWriter(existingWriter: string): NonPayableTransactionObject<void>;

    /**
     * Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner.     * NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.
     */
    renounceOwnership(): NonPayableTransactionObject<void>;

    required(): NonPayableTransactionObject<string>;

    /**
     * Allows an owner to revoke a confirmation for a transaction.
     * @param transactionId Transaction ID.
     */
    revokeConfirmation(
      transactionId: number | string | BN
    ): NonPayableTransactionObject<void>;

    setWalletOwner(addr: string): NonPayableTransactionObject<void>;

    toBytes(a: string): NonPayableTransactionObject<string>;

    transactionCount(): NonPayableTransactionObject<string>;

    transactions(arg0: number | string | BN): NonPayableTransactionObject<{
      transId: string;
      isDirectInvokeData: boolean;
      destination: string;
      value: string;
      data: string;
      timestamp: string;
      blockNumber: string;
      executed: boolean;
      rejected: boolean;
      0: string;
      1: boolean;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: boolean;
      8: boolean;
    }>;

    walletOperatorList(
      arg0: number | string | BN
    ): NonPayableTransactionObject<string>;

    walletOwner(): NonPayableTransactionObject<string>;

    setInternalSmartContractConfig(
      addr: string
    ): NonPayableTransactionObject<void>;

    requestTransfer(
      dest: string,
      assetName: string,
      amount: number | string | BN
    ): NonPayableTransactionObject<void>;

    getGasFeeWalletAddress(): NonPayableTransactionObject<string>;

    verifySignature(
      hash: string | number[],
      signature: string | number[]
    ): NonPayableTransactionObject<string>;

    submitWithdraw(
      dest: string,
      withdrawAmount: number | string | BN,
      amountWithFee: number | string | BN,
      assetName: string
    ): NonPayableTransactionObject<void>;

    directTopUpPaymentWallet(
      targetGasWei: number | string | BN,
      gasLimit: number | string | BN
    ): NonPayableTransactionObject<void>;

    topUpPaymentWallet(
      paymentWalletAddr: string,
      targetGasWei: number | string | BN,
      signature: string | number[]
    ): NonPayableTransactionObject<void>;

    getWalletOwnerBalance(): NonPayableTransactionObject<string>;

    invokeSmartContract(
      scAddr: string,
      eun: number | string | BN,
      inputArg: string | number[]
    ): NonPayableTransactionObject<void>;
  };
  events: {
    Confirmation(cb?: Callback<Confirmation>): EventEmitter;
    Confirmation(
      options?: EventOptions,
      cb?: Callback<Confirmation>
    ): EventEmitter;

    Deposit(cb?: Callback<Deposit>): EventEmitter;
    Deposit(options?: EventOptions, cb?: Callback<Deposit>): EventEmitter;

    Event(cb?: Callback<Event>): EventEmitter;
    Event(options?: EventOptions, cb?: Callback<Event>): EventEmitter;

    Execution(cb?: Callback<Execution>): EventEmitter;
    Execution(options?: EventOptions, cb?: Callback<Execution>): EventEmitter;

    ExecutionFailure(cb?: Callback<ExecutionFailure>): EventEmitter;
    ExecutionFailure(
      options?: EventOptions,
      cb?: Callback<ExecutionFailure>
    ): EventEmitter;

    OwnerAdded(cb?: Callback<OwnerAdded>): EventEmitter;
    OwnerAdded(options?: EventOptions, cb?: Callback<OwnerAdded>): EventEmitter;

    OwnerRemoved(cb?: Callback<OwnerRemoved>): EventEmitter;
    OwnerRemoved(
      options?: EventOptions,
      cb?: Callback<OwnerRemoved>
    ): EventEmitter;

    OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter;
    OwnershipTransferred(
      options?: EventOptions,
      cb?: Callback<OwnershipTransferred>
    ): EventEmitter;

    ReaderAdded(cb?: Callback<ReaderAdded>): EventEmitter;
    ReaderAdded(
      options?: EventOptions,
      cb?: Callback<ReaderAdded>
    ): EventEmitter;

    ReaderRemoved(cb?: Callback<ReaderRemoved>): EventEmitter;
    ReaderRemoved(
      options?: EventOptions,
      cb?: Callback<ReaderRemoved>
    ): EventEmitter;

    Rejection(cb?: Callback<Rejection>): EventEmitter;
    Rejection(options?: EventOptions, cb?: Callback<Rejection>): EventEmitter;

    RequirementChange(cb?: Callback<RequirementChange>): EventEmitter;
    RequirementChange(
      options?: EventOptions,
      cb?: Callback<RequirementChange>
    ): EventEmitter;

    Revocation(cb?: Callback<Revocation>): EventEmitter;
    Revocation(options?: EventOptions, cb?: Callback<Revocation>): EventEmitter;

    Submission(cb?: Callback<Submission>): EventEmitter;
    Submission(options?: EventOptions, cb?: Callback<Submission>): EventEmitter;

    TopUpPaymentWalletEvent(
      cb?: Callback<TopUpPaymentWalletEvent>
    ): EventEmitter;
    TopUpPaymentWalletEvent(
      options?: EventOptions,
      cb?: Callback<TopUpPaymentWalletEvent>
    ): EventEmitter;

    TransferEvent(cb?: Callback<TransferEvent>): EventEmitter;
    TransferEvent(
      options?: EventOptions,
      cb?: Callback<TransferEvent>
    ): EventEmitter;

    TransferRequestEvent(cb?: Callback<TransferRequestEvent>): EventEmitter;
    TransferRequestEvent(
      options?: EventOptions,
      cb?: Callback<TransferRequestEvent>
    ): EventEmitter;

    WithdrawRequestEvent(cb?: Callback<WithdrawRequestEvent>): EventEmitter;
    WithdrawRequestEvent(
      options?: EventOptions,
      cb?: Callback<WithdrawRequestEvent>
    ): EventEmitter;

    WriterAdded(cb?: Callback<WriterAdded>): EventEmitter;
    WriterAdded(
      options?: EventOptions,
      cb?: Callback<WriterAdded>
    ): EventEmitter;

    WriterRemoved(cb?: Callback<WriterRemoved>): EventEmitter;
    WriterRemoved(
      options?: EventOptions,
      cb?: Callback<WriterRemoved>
    ): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "Confirmation", cb: Callback<Confirmation>): void;
  once(
    event: "Confirmation",
    options: EventOptions,
    cb: Callback<Confirmation>
  ): void;

  once(event: "Deposit", cb: Callback<Deposit>): void;
  once(event: "Deposit", options: EventOptions, cb: Callback<Deposit>): void;

  once(event: "Event", cb: Callback<Event>): void;
  once(event: "Event", options: EventOptions, cb: Callback<Event>): void;

  once(event: "Execution", cb: Callback<Execution>): void;
  once(
    event: "Execution",
    options: EventOptions,
    cb: Callback<Execution>
  ): void;

  once(event: "ExecutionFailure", cb: Callback<ExecutionFailure>): void;
  once(
    event: "ExecutionFailure",
    options: EventOptions,
    cb: Callback<ExecutionFailure>
  ): void;

  once(event: "OwnerAdded", cb: Callback<OwnerAdded>): void;
  once(
    event: "OwnerAdded",
    options: EventOptions,
    cb: Callback<OwnerAdded>
  ): void;

  once(event: "OwnerRemoved", cb: Callback<OwnerRemoved>): void;
  once(
    event: "OwnerRemoved",
    options: EventOptions,
    cb: Callback<OwnerRemoved>
  ): void;

  once(event: "OwnershipTransferred", cb: Callback<OwnershipTransferred>): void;
  once(
    event: "OwnershipTransferred",
    options: EventOptions,
    cb: Callback<OwnershipTransferred>
  ): void;

  once(event: "ReaderAdded", cb: Callback<ReaderAdded>): void;
  once(
    event: "ReaderAdded",
    options: EventOptions,
    cb: Callback<ReaderAdded>
  ): void;

  once(event: "ReaderRemoved", cb: Callback<ReaderRemoved>): void;
  once(
    event: "ReaderRemoved",
    options: EventOptions,
    cb: Callback<ReaderRemoved>
  ): void;

  once(event: "Rejection", cb: Callback<Rejection>): void;
  once(
    event: "Rejection",
    options: EventOptions,
    cb: Callback<Rejection>
  ): void;

  once(event: "RequirementChange", cb: Callback<RequirementChange>): void;
  once(
    event: "RequirementChange",
    options: EventOptions,
    cb: Callback<RequirementChange>
  ): void;

  once(event: "Revocation", cb: Callback<Revocation>): void;
  once(
    event: "Revocation",
    options: EventOptions,
    cb: Callback<Revocation>
  ): void;

  once(event: "Submission", cb: Callback<Submission>): void;
  once(
    event: "Submission",
    options: EventOptions,
    cb: Callback<Submission>
  ): void;

  once(
    event: "TopUpPaymentWalletEvent",
    cb: Callback<TopUpPaymentWalletEvent>
  ): void;
  once(
    event: "TopUpPaymentWalletEvent",
    options: EventOptions,
    cb: Callback<TopUpPaymentWalletEvent>
  ): void;

  once(event: "TransferEvent", cb: Callback<TransferEvent>): void;
  once(
    event: "TransferEvent",
    options: EventOptions,
    cb: Callback<TransferEvent>
  ): void;

  once(event: "TransferRequestEvent", cb: Callback<TransferRequestEvent>): void;
  once(
    event: "TransferRequestEvent",
    options: EventOptions,
    cb: Callback<TransferRequestEvent>
  ): void;

  once(event: "WithdrawRequestEvent", cb: Callback<WithdrawRequestEvent>): void;
  once(
    event: "WithdrawRequestEvent",
    options: EventOptions,
    cb: Callback<WithdrawRequestEvent>
  ): void;

  once(event: "WriterAdded", cb: Callback<WriterAdded>): void;
  once(
    event: "WriterAdded",
    options: EventOptions,
    cb: Callback<WriterAdded>
  ): void;

  once(event: "WriterRemoved", cb: Callback<WriterRemoved>): void;
  once(
    event: "WriterRemoved",
    options: EventOptions,
    cb: Callback<WriterRemoved>
  ): void;
}
