import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op } from 'sequelize';
import { ResponseBase } from '../../../foundation/server/ApiMessage';
import logger from '../util/ServiceLogger';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import { Mixed } from '../../../foundation/types/Mixed';
import { price } from '../SystemTask/PriceLoader';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import abi from '../../../abi/IPoolCustomer.json';
import { IPoolCustomer } from '../../../@types/IPoolCustomer';
import {
  crytoDecimalNumber,
  crytoDecimalPlace,
} from '../../../general/model/dbModel/Prices';
import { getPairListDecimalPlace } from '../../../foundation/server/CommonFunction';
import globalVar from '../const/globalVar';
// import { Contract } from 'web3-eth-contract';

const modelModule = seq.sequelize.models;
const usdmAddr =
  globalVar.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<USDM>']
    .address;
const btcmAddr =
  globalVar.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<BTCM>']
    .address;
const ethmAddr =
  globalVar.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<ETHM>']
    .address;

export enum CodeAddress {
  USDM = usdmAddr as any,
  BTCM = btcmAddr as any,
  ETHM = ethmAddr as any,
}

export default class Service implements CommonService {
  async getAll(): Promise<ResponseBase> {
    const funcMsg = `[PriceService][getAll]`;
    const resp = new ResponseBase();

    resp.data = price;
    resp.success = true;
    resp.msg = 'Record found';

    return resp;
  }

  async getPrice(): Promise<any[]> {
    const funcMsg = `[PriceService][getPrice]`;
    const priceList: any[] = [];

    // await this.getAll();

    try {
      const whereStatement: any = {};
      const getPriceAgentResult = await modelModule[
        SeqModel.name.Prices
      ].findAll({
        where: whereStatement,
        raw: true,
      });

      getPriceAgentResult.forEach(async (element) => {
        const decimalList = await getPairListDecimalPlace(element);

        const obj = {};
        obj['id'] = element['id'];
        obj['pairName'] = element['pairName'];
        obj['reserve0'] = element['reserve0'];
        obj['reserve1'] = element['reserve1'];
        obj['reserve0DecimalPlace'] = decimalList['reserve0DecimalPlace'];
        obj['reserve1DecimalPlace'] = decimalList['reserve1DecimalPlace'];
        obj['createdDate'] = element['createdDate'];

        // priceList.push(element);
        priceList.push(obj);
      });
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
    }

    return priceList;
  }

  async getPairInfo(query: any): Promise<any> {
    const funcMsg = `[PriceService][getPairInfo]`;
    const resp = new ResponseBase();
    const myMap = new Map();

    const usdmAddress = usdmAddr;
    const btcmAddress = btcmAddr;
    const ethmAddress = ethmAddr;

    try {
      logger.info('query.pairName: ' + query.pairName);
      const myReceipt: any = await call_iPoolCustomer(query.pairName);
      logger.info(myReceipt);

      // const list: number[] = [myReceipt.reserve0, myReceipt.reserve1];

      let result: Mixed = 0;
      let usdm: Mixed = 0;
      let coins: Mixed = 0;
      let token = '';
      let reserve0DecimalPlace: Mixed = 0;
      let reserve1DecimalPlace: Mixed = 0;

      if (myReceipt[3] == usdmAddress) {
        if (usdmAddress < myReceipt[4]) {
          usdm = myReceipt.reserve0 / crytoDecimalNumber.USDM;
          reserve0DecimalPlace = crytoDecimalPlace.USDM;

          if (myReceipt[4] == btcmAddress) {
            coins = myReceipt.reserve1 / crytoDecimalNumber.BTCM;
            reserve1DecimalPlace = crytoDecimalPlace.BTCM;
            token = 'btcm_reserve';
          } else if (myReceipt[4] == ethmAddress) {
            coins = myReceipt.reserve1 / crytoDecimalNumber.ETHM;
            reserve1DecimalPlace = crytoDecimalPlace.ETHM;
            token = 'ethm_reserve';
          }
        } else {
          usdm = myReceipt.reserve1 / crytoDecimalNumber.USDM;
          reserve1DecimalPlace = crytoDecimalPlace.USDM;

          if (myReceipt[4] == btcmAddress) {
            coins = myReceipt.reserve0 / crytoDecimalNumber.BTCM;
            reserve0DecimalPlace = crytoDecimalPlace.BTCM;
            token = 'btcm_reserve';
          } else if (myReceipt[4] == ethmAddress) {
            coins = myReceipt.reserve0 / crytoDecimalNumber.ETHM;
            reserve0DecimalPlace = crytoDecimalPlace.ETHM;
            token = 'ethm_reserve';
          }
        }
      } else {
        if (usdmAddress < myReceipt[3]) {
          usdm = myReceipt.reserve0 / crytoDecimalNumber.USDM;
          reserve0DecimalPlace = crytoDecimalPlace.USDM;

          if (myReceipt[3] == btcmAddress) {
            coins = myReceipt.reserve1 / crytoDecimalNumber.BTCM;
            reserve1DecimalPlace = crytoDecimalPlace.BTCM;
            token = 'btcm_reserve';
          } else if (myReceipt[3] == ethmAddress) {
            coins = myReceipt.reserve1 / crytoDecimalNumber.ETHM;
            reserve1DecimalPlace = crytoDecimalPlace.ETHM;
            token = 'ethm_reserve';
          }
        } else {
          usdm = myReceipt.reserve1 / crytoDecimalNumber.USDM;
          reserve1DecimalPlace = crytoDecimalPlace.USDM;

          if (myReceipt[3] == btcmAddress) {
            coins = myReceipt.reserve0 / crytoDecimalNumber.BTCM;
            reserve0DecimalPlace = crytoDecimalPlace.BTCM;
            token = 'btcm_reserve';
          } else if (myReceipt[3] == ethmAddress) {
            coins = myReceipt.reserve0 / crytoDecimalNumber.ETHM;
            reserve0DecimalPlace = crytoDecimalPlace.ETHM;
            token = 'ethm_reserve';
          }
        }
      }

      // if (myReceipt[1] == 'USDM') {
      //   usdm = myReceipt.reserve0 * crytoDecimalNumber.USDM;

      //   if (myReceipt[2] == 'BTCM') {
      //     coins = myReceipt.reserve1 * crytoDecimalNumber.BTCM;
      //     token = 'btcm_reserve';
      //   } else if (myReceipt[2] == 'ETHM') {
      //     coins = myReceipt.reserve1 * crytoDecimalNumber.ETHM;
      //     token = 'ethm_reserve';
      //   }
      // } else {
      //   usdm = myReceipt.reserve1 * crytoDecimalNumber.USDM;

      //   if (myReceipt[1] == 'BTCM') {
      //     coins = myReceipt.reserve0 * crytoDecimalNumber.BTCM;
      //     token = 'btcm_reserve';
      //   } else if (myReceipt[1] == 'ETHM') {
      //     coins = myReceipt.reserve0 * crytoDecimalNumber.ETHM;
      //     token = 'ethm_reserve';
      //   }
      // }

      result = usdm / coins;

      const obj = {};
      obj['pairName'] = query.pairName;
      obj['reserve0'] = myReceipt['reserve0'];
      obj['reserve1'] = myReceipt['reserve1'];
      obj['reserve0DecimalPlace'] = reserve0DecimalPlace;
      obj['reserve1DecimalPlace'] = reserve1DecimalPlace;
      // obj['usdm_reserve'] = usdm;
      // obj[token] = coins;
      obj['price'] = result;

      return obj;
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);

      resp.success = true;
      resp.msg = funcMsg + ' - fail ';
    }

    return resp;
  }

  async getAllBlockPrice(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const funcMsg = `[PriceService][getAllBlockPrice]`;

    const usdmAddress = usdmAddr;
    const btcmAddress = btcmAddr;
    const ethmAddress = ethmAddr;

    const whereStatement: any = {};

    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'pair_name',
      query.pairName,
    );

    if (query.dateFrom && query.dateTo) {
      //logger.info('query.dateFrom: ' + query.dateFrom.toString());
      //logger.info('query.dateTo: ' + query.dateTo.toString());

      whereStatement.createdDate = {
        [Op.between]: [query.dateFrom, query.dateTo],
        // [Op.between]: [new Date(query.dateFrom), new Date(query.dateTo)],
        // [Op.between]: [
        //   new Date(query.dateFrom + '+08:00'),
        //   new Date(query.dateTo + '+08:00'),
        // ],
      };
    } else if (query.dateFrom) {
      whereStatement.createdDate = {
        [Op.gte]: query.dateFrom,
      };
    } else if (query.dateTo) {
      whereStatement.createdDate = {
        [Op.lte]: query.dateTo + ' 23:59:59',
      };
    }

    // const getBlockPriceResult = await modelModule[
    //   SeqModel.name.BlockPrices
    // ].findAll({
    //   where: whereStatement,
    // });

    const results: any = await modelModule[
      SeqModel.name.BlockPrices
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });

    const decimalList = await getPairListDecimalPlace(query);

    const objList: Array<any> = new Array<any>();
    results.rows.forEach((element) => {
      // logger.info(element);

      const obj: any = {};
      obj['id'] = element['id'];
      obj['pairName'] = element['pairName'];
      obj['reserve0'] = element['reserve0'];
      obj['reserve1'] = element['reserve1'];
      obj['blockNo'] = element['blockNo'];
      obj['createdDate'] = element['createdDate'];
      obj['reserve0DecimalPlace'] = decimalList['reserve0DecimalPlace'];
      obj['reserve1DecimalPlace'] = decimalList['reserve1DecimalPlace'];

      objList.push(obj);
    });

    const returnObj: any = {};
    returnObj['count'] = results['count'];
    returnObj['rows'] = objList;

    // return results;
    return returnObj;
  }
}

export async function call_iPoolCustomer(pairName: string) {
  // const RPC_HOST = globalVar.foundationConfig.rpcHost;
  const RPC_HOST = globalVar.foundationConfig.rpcHostHttp;
  const POOL_ADDRESS =
    globalVar.foundationConfig.smartcontract.MappedSwap[
      'OwnedUpgradeableProxy<Pool>'
    ].address;

  const web3 = new Web3(RPC_HOST);
  // const abiItems: AbiItem[] = abi['abi'] as AbiItem[];
  const abiItems: AbiItem[] = abi as AbiItem[];

  const service: Service = new Service();

  try {
    const iPoolCustomer = new web3.eth.Contract(
      abiItems,
      POOL_ADDRESS,
    ) as any as IPoolCustomer;

    const contractJson = iPoolCustomer;
    const poolContract = new web3.eth.Contract(abiItems, POOL_ADDRESS);
    const pairInfo = await poolContract.methods.getPairInfo(pairName).call();

    return pairInfo;
  } catch (e: any) {
    logger.error(e);
    return e;
  }
}
