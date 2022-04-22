import { Fetcher } from './Fetcher';
import FactoryFetcher from './FactoryFetcher';
import { FetcherUniswap } from '../fetcher/FetcherUniswap';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
/**
 * Concrete Creators override the factory method in order to change the
 * resulting product's type.
 */
export default class FactoryFetcherUniswap extends FactoryFetcher {
  /**
   * Note that the signature of the method still uses the abstract product
   * type, even though the concrete product is actually returned from the
   * method. This way the Creator can stay independent of concrete product
   * classes.
   */
  constructor() {
    super('Uniswap Factory');
  }
  create(
    ethereumClient: EthClient,
    sideChainClient: EthClient,
  ): FetcherUniswap {
    return new FetcherUniswap(ethereumClient, sideChainClient);
  }
}
