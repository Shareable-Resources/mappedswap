import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import { Fetcher } from './Fetcher';
import logger from '../util/ServiceLogger';

/**
 * The Fetcher class declares the factory method that is supposed to return an
 * object of a Fetcher class. The Creator's subclasses usually provide the
 * implementation of this method.
 */
export default abstract class FactoryFetcher {
  /**
   * Note that the FetcherCreater may also provide some default implementation of the
   * factory method.
   */
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  public abstract create(
    ethereumClient: EthClient,
    sideChainClient: EthClient,
  ): Fetcher;

  public logDetails(): void {
    logger.info(`Name ${this.name}`);
  }
}
