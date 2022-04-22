import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import abi from '../../../abi/IPoolAgent.json';
import { IPoolAgent } from '../../../@types/IPoolAgent';
import winston from 'winston';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import globalVar from '../../const/globalVar';
import foundationConst from '../../../foundation/const/index';
import { EthClient } from '../ethereum/0_index';
import { logger } from 'handlebars';

export default async function callPool(
  customer_address: string,
  credit: any,
  newRiskLevel: number,
  newEnableStatus: number,
  newMode: number | string,
  newLeverage: number | string,
  logger: winston.Logger,
  //   newObj: DBModel.CustomerCreditUpdate,
) {
  // const RPC_HOST = globalVar.foundationConfig.rpcHost;
  const RPC_HOST = globalVar.foundationConfig.rpcHostHttp;
  // const POOL_ADDRESS = foundationConfig.smartcontract.MappedSwap.POOL_ADDRESS;
  const POOL_ADDRESS =
    globalVar.foundationConfig.smartcontract.MappedSwap[
      'OwnedUpgradeableProxy<Pool>'
    ].address;

  const web3 = new Web3(RPC_HOST);
  // const abiItems: AbiItem[] = abi['abi'] as AbiItem[];
  const abiItems: AbiItem[] = abi as AbiItem[];

  //   const service: Service = new Service();

  try {
    const fromWei = web3.utils.fromWei;

    const httpProvider = new Web3.providers.HttpProvider(
      globalVar.foundationConfig.rpcHostHttp,
      foundationConst.web3HttpProviderOption,
    );

    const ethClient = new EthClient(
      httpProvider,
      globalVar.foundationConfig.chainId,
    );

    const pool = new web3.eth.Contract(
      abiItems,
      POOL_ADDRESS,
    ) as any as IPoolAgent;

    // const web3Account = web3.eth.accounts.privateKeyToAccount('5555fe01770a5c6dc621f00465e6a0f76bbd4bc1edbde5f2c380fcb00f354b99');
    // const web3Account = web3.eth.accounts.privateKeyToAccount(
    //   config.poolContract.privateKeyToAccount,
    // );\
    const web3Account = web3.eth.accounts.privateKeyToAccount(
      // foundationConfig.smartcontract.MappedSwap.privateKeyToAccount,
      encryptionKey!,
    );

    logger.info(
      'customer_address: ' +
        customer_address +
        ', newMode: ' +
        newMode +
        ', newLeverage: ' +
        newLeverage +
        ', credit: ' +
        web3.utils.toBN(credit) +
        ', newRiskLevel: ' +
        newRiskLevel +
        ', newEnableStatus: ' +
        newEnableStatus,
    );

    const nonce = await ethClient.web3Client.eth.getTransactionCount(
      web3Account.address,
      'pending',
    );

    // const txnData = web3.eth.abi.encodeFunctionCall({
    //     name: "updateCustomerDetails",
    //     type: 'function',
    //     inputs:
    //         [
    //             {
    //             "name": "customer",
    //             "type": "address"
    //             },
    //             {
    //             "name": "newCredit",
    //             "type": "uint256"
    //             },
    //             {
    //             "name": "newRiskLevel",
    //             "type": "int256"
    //             },
    //             {
    //             "name": "newEnableStatus",
    //             "type": "bool"
    //             }
    //         ],
    // }, ["0x39EB6463871040f75C89C67ec1dFCB141C3da1cf", "100", "50", "true"]);
    // // }, [customer_address, newCredit, newRiskLevel, newEnableStatus]);

    // console.log(pool.methods);
    const tx = {
      // this could be provider.addresses[0] if it exists
      from: web3Account.address,
      // target address, this could be a smart contract address
      to: POOL_ADDRESS,
      gasPrice: '0x8F0D1800',
      // optional if you want to specify the gas limit
      gas: '0xAA690',
      // optional if you are invoking say a payable function
      value: '0x00',
      // this encodes the ABI of the method and the arguements
      // data: pool.methods.updateCustomerDetails("0x39EB6463871040f75C89C67ec1dFCB141C3da1cf", "100", "50", true).encodeABI(),
      data: pool.methods
        .updateCustomerDetails(
          customer_address,
          newMode,
          newLeverage,
          web3.utils.toBN(credit),
          newRiskLevel,
          newEnableStatus,
        )
        .encodeABI(),
      nonce: nonce,
      // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
    };

    // logger.info('tx');
    logger.info('tx.data: ' + tx.data);

    // const signTxResult: transactionHash = await web3Account.signTransaction(tx);
    const signTxResult: any = await web3Account.signTransaction(tx);
    logger.info(
      'signTxResult.transactionHash: ' + signTxResult.transactionHash,
    );

    // newObj.txHash = signTxResult.transactionHash;
    // await service.createCustomerCreditHistory(newObj, null);

    const myReceipt: any = await web3.eth
      .sendSignedTransaction(signTxResult.rawTransaction)
      .on('transactionHash', function (transactionHash) {
        logger.info('transactionHash: ' + transactionHash);
      })
      .on('receipt', function (receipt) {
        logger.info('receipt: ' + receipt.status);
        return receipt;
      });
    // .on('error', function (error) {
    //   // logger.error(error);
    //   throw error;
    // });

    return myReceipt;
    // return obj;
  } catch (e: any) {
    logger.error(e);
    return e;
  }
}

export async function getNonce() {
  const httpProvider = new Web3.providers.HttpProvider(
    globalVar.foundationConfig.rpcHostHttp,
    foundationConst.web3webSocketDefaultOption,
  );

  const ethClient = new EthClient(
    httpProvider,
    globalVar.foundationConfig.chainId,
  );

  const sideChainWeb3Account =
    ethClient.web3Client.eth.accounts.privateKeyToAccount(encryptionKey!);

  const nonce = await ethClient.web3Client.eth.getTransactionCount(
    sideChainWeb3Account.address,
    'pending',
  );

  return nonce;
}

export async function increaseNonce(nonce: any) {
  // nonce = nonce + 1;

  const sab = new SharedArrayBuffer(16);
  const ta = new Int32Array(sab);
  Atomics.add(ta, 0, nonce);
  Atomics.add(ta, 0, 1);
  Atomics.load(ta, 0);

  return ta[0];
}
