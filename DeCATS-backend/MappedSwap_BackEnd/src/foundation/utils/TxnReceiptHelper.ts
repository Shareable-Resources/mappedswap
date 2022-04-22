import { logger } from 'handlebars';
import Web3 from 'web3';
import { SignedTransaction } from 'web3-core';
import { AbiItem } from 'web3-utils';
export default class TxnReceiptHelper {
  static async decodeEvent(
    txHash: string,
    web3Client: Web3,
    eventAbiItem: AbiItem,
  ) {
    const txnReceipt = await web3Client.eth.getTransactionReceipt(txHash);
    let decodeData: any;
    for (let index = 0; index < txnReceipt.logs.length; index++) {
      const element = txnReceipt.logs[index];
      if (element.topics[0]) {
        const _encodeEventSignature =
          web3Client.eth.abi.encodeEventSignature(eventAbiItem);
        if (
          _encodeEventSignature === element.topics[0] &&
          eventAbiItem.name === eventAbiItem.name
        ) {
          decodeData = web3Client.eth.abi.decodeLog(
            eventAbiItem.inputs as any,
            element.data,
            element.topics.slice(1),
          );
        }

        if (eventAbiItem.name === eventAbiItem.name) {
          decodeData = web3Client.eth.abi.decodeLog(
            eventAbiItem.inputs as any,
            element.data,
            element.topics.slice(1),
          );
        }

        console.log(`decodeData: ${decodeData}`);
      }
    }
    if (decodeData) {
      return decodeData;
    } else {
      throw new Error('Cannot decode');
    }
  }

  static async getReceiptFromTxHash(txHash: string, web3Client: Web3) {
    const txnReceipt = await web3Client.eth.getTransactionReceipt(txHash);
    return txnReceipt;
  }
}
