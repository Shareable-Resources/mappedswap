import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import Service from '../service/PriceRefService';
import { Account } from 'web3-core';
import PriceRefService from '../service/PriceRefService';
import globalVar from '../const/globalVar';
import logger from '../util/ServiceLogger';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import PriceHistory from '../../../general/model/dbModel/PriceHistory';
import PriceHistoryRef from '../../../general/model/dbModel/PriceHistoryRef';
import AdjustItem, { AdjustItemWithPriceHistoryRef } from './AdjustItem';
import { FetcherType } from '../const/allFetchers';
export abstract class Fetcher {
  service: Service;
  ethereumEthClient: EthClient;
  sideChainClient: EthClient;
  sideChainWeb3Account: Account;
  sourceFrom: FetcherType;
  constructor(ethereumClient: EthClient, sideChainClient: EthClient) {
    this.service = new PriceRefService();
    //ethereum eth client
    this.ethereumEthClient = ethereumClient;
    this.sideChainClient = sideChainClient;

    this.sideChainWeb3Account =
      this.sideChainClient.web3Client.eth.accounts.privateKeyToAccount(
        encryptionKey!,
      );
    this.sourceFrom = FetcherType.unknown;
  }
  abstract fetch(): Promise<AdjustItemWithPriceHistoryRef[]>;
  abstract convertPriceToAdjustItem(obj: any): AdjustItemWithPriceHistoryRef;
}
