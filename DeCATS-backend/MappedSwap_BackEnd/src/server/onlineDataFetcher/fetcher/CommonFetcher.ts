import { EthClient } from '../../../foundation/utils/ethereum/0_index';

abstract class CommonFetcher {
  protected abstract subscribe(event?: any): void;
  ethClient: EthClient;
  blocksRead: number[];
  constructor(ethClient: EthClient) {
    this.ethClient = ethClient;
    this.blocksRead = [];
  }
}

export default CommonFetcher;
