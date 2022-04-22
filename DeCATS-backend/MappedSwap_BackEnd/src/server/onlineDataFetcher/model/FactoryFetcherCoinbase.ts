import FactoryFetcher from './FactoryFetcher';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import { FetcherCoinbase } from '../fetcher/FetcherCoinbase';
/**
 * Concrete Creators override the factory method in order to change the
 * resulting product's type.
 */
export default class FactoryFetcherCoinbase extends FactoryFetcher {
  /**
   * Note that the signature of the method still uses the abstract product
   * type, even though the concrete product is actually returned from the
   * method. This way the Creator can stay independent of concrete product
   * classes.
   */
  constructor() {
    super('Coinbase Factory');
  }
  create(
    ethereumClient: EthClient,
    sideChainClient: EthClient,
  ): FetcherCoinbase {
    return new FetcherCoinbase(ethereumClient, sideChainClient);
  }
}
