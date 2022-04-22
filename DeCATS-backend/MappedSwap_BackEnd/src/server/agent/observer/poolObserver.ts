import Web3 from 'web3';
import abi from '../../../abi/IPoolAgent.json';
import { AbiItem } from 'web3-utils';
import { WarningResponseBase } from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { IPoolAgent } from '../../../@types/IPoolAgent';
import { EventData } from 'web3-eth-contract';
import { UpdateFunding } from '../../../@types/IPoolAgent';
import Service from '../service/CustomerService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import CommonObserver from './CommonObserver';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import logger from '../util/ServiceLogger';
import globalVar from '../const/globalVar';

export class PoolObserver extends CommonObserver {
  // RPC_HOST = config.poolContract.RPC_HOST;
  // DAI_ADDRESS = config.poolContract.DAI_ADDRESS;

  // web3 = new Web3(this.RPC_HOST);
  // abiItems: AbiItem[] = abi['abi'] as AbiItem[];

  RpcHost: string;
  PoolAddress: string;

  web3: any;
  abiItems: AbiItem[];

  constructor(ethClient: EthClient, private service: Service = new Service()) {
    super(ethClient);
    // this.RpcHost = globalVar.foundationConfig.rpcHost;
    this.RpcHost = globalVar.foundationConfig.rpcHostHttp;
    // this.PoolAddress = foundationConfig.smartcontract.MappedSwap.POOL_ADDRESS;
    this.PoolAddress =
      globalVar.foundationConfig.smartcontract.MappedSwap[
        'OwnedUpgradeableProxy<Pool>'
      ].address;
    this.web3 = new Web3(this.RpcHost);
    this.abiItems = abi as AbiItem[];
  }

  async proccessBlock(event: any) {
    logger.info("event.event: '" + event.event + "'");

    if (event.event == 'UpdateFunding') {
      const returnValues = event.returnValues;

      // DBModel.CustomerCreditUpdate CustomerCreditUpdate = new DBModel.CustomerCreditUpdate();
      const obj = new DBModel.CustomerCreditUpdate();
      obj.address = returnValues.customer.toLowerCase();
      obj.origCredit = returnValues.oldFunding;
      obj.credit = returnValues.newFunding;
      obj.txHash = event.transactionHash;

      logger.info("returnValues.customer: '" + returnValues.customer + "'");
      logger.info("returnValues.newCredit: '" + returnValues.newFunding + "'");
      logger.info("returnValues.oldCredit: '" + returnValues.oldFunding + "'");
      logger.info("returnValues.address: '" + returnValues.address + "'");

      // customer = returnValues.customer;
      // newCredit = returnValues.newCredit;
      // oldCredit = returnValues.oldCredit;

      // const isSuccess = await Service.updateCustomerCridit(obj);
      // const isSuccess = await this.service.updateCustomerCredit(obj, null);
    }
  }

  // async init_subscriber() {
  async startMonitoringSmartContract() {
    logger.info('[poolObserver] Starts monitoring block');

    try {
      const web3 = new Web3(this.RpcHost);

      // logger.info('after web3');

      // const abiItems: AbiItem[] = abi['abi'] as AbiItem[];
      const abiItems: AbiItem[] = abi as AbiItem[];
      // const pool = (new web3.eth.Contract(abi['abi'], DAI_ADDRESS) as any) as Pool

      // logger.info('after abiItems');

      const pool = new web3.eth.Contract(
        abiItems,
        this.PoolAddress,
      ) as any as IPoolAgent;
      logger.info('after pool');

      await pool.events
        .allEvents()
        .on('data', async (event: EventData) => {
          logger.info('dAppContract [data] 1', event);
          // await this.proccessBlock(event);
          await this.proccessBlock(event);
        })
        .on('changed', (event) => {
          logger.info('dAppContract [changed]', event);
        })
        .on('error', (event) => {
          logger.info('dAppContract [error]', event);
        })
        .on('connected', (event) => {
          logger.info('dAppContract [connected]', event);
        });

      await pool.events
        .UpdateFunding()
        .on('data', async (event: UpdateFunding) => {
          logger.info('dAppContract [data] 2', event);
          // await this.proccessBlock(event);
          await this.proccessBlock(event);
        });
    } catch (e: any) {
      new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message);
    }
  }
}
