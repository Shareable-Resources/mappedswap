import { Pool } from '@uniswap/v3-sdk';
import logger from '../util/ServiceLogger';
import {
  getNonce,
  increaseNonce,
} from '../../../foundation/utils/poolContract/Pool';

export let exportedNonce: any;

export class NonceLoader {
  async loadNonceIntoMemory() {
    logger.info(`Restarted before get nonce`);

    exportedNonce = await getNonce();

    logger.info(`Restart dApp with nonce ${exportedNonce}`);
  }
}

export async function addNonce() {
  exportedNonce = await increaseNonce(exportedNonce);
}
