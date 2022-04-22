import Web3 from 'web3';
import winston from 'winston';

const BlockChainHelper = {
  logRevertReason(e: Error | any, logger: winston.Logger) {
    if (
      e.message &&
      e.message.includes('Transaction has been reverted by the EVM')
    ) {
      logger.info(
        `[RevertReason] ${Web3.utils.hexToAscii(e.receipt.revertReason)}`,
      );
    }
  },
};

export default BlockChainHelper;
