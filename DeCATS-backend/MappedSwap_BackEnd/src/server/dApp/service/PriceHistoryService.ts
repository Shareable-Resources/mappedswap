import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import logger from '../util/ServiceLogger';
import sequelize, { Op, Sequelize } from 'sequelize';
import KLineDataVolumeSum from '../model/KLineDataVolumeSum';
import { getPairListDecimalPlace } from '../../../foundation/server/CommonFunction';
import { ResponseBase } from '../../../foundation/server/ApiMessage';
import moment from 'moment';
import { kLineObj } from '../SystemTask/PriceLoader';
import globalVar from '../const/globalVar';

const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  // async getAll(query: any): Promise<any> {
  //   const funcMsg = `[PriceHistoryService][getAll]`;
  //   logger.info(funcMsg);
  //   const whereStatement = {};
  //   sequelizeHelper.where.pushExactItemIfNotNull(
  //     whereStatement,
  //     'interval',
  //     '60',
  //   );
  //   sequelizeHelper.where.pushExactItemIfNotNull(
  //     whereStatement,
  //     'pairName',
  //     query.pairName,
  //   );

  //   const records = await modelModule[
  //     SeqModel.name.PriceHistory
  //   ].findAndCountAll({
  //     limit: query.recordPerPage,
  //     offset: query.pageNo,
  //     where: whereStatement,
  //     order: [['id', 'DESC']],
  //   });

  //   const obj = {};
  //   records.rows.forEach(async (element) => {
  //     const decimalList = await getPairListDecimalPlace(element);

  //     obj['id'] = element['id'];
  //     obj['pairName'] = element['pairName'];
  //     obj['reserve0'] = element['reserve0'];
  //     obj['reserve1'] = element['reserve1'];
  //     obj['reserve0DecimalPlace'] = decimalList['reserve0_decimalPlace'];
  //     obj['reserve1DecimalPlace'] = decimalList['reserve1_decimalPlace'];
  //     obj['createdDate'] = element['createdDate'];
  //     obj['status'] = element['status'];
  //     obj['open'] = element['open'];
  //     obj['close'] = element['close'];
  //     obj['low'] = element['low'];
  //     obj['high'] = element['high'];
  //     obj['volume'] = element['volume'];
  //     obj['interval'] = element['interval'];
  //   });

  //   const returnObj = {};
  //   returnObj['count'] = records.count;
  //   returnObj['rows'] = obj;

  //   return returnObj;
  // }

  // prettier-ignore
  async getAll(query: any){
    return null;
  }

  async getKLineData(query: any): Promise<any> {
    const funcMsg = `[PriceHistoryService][getKLineData]`;

    const usdmAddress =
      globalVar.foundationConfig.smartcontract.MappedSwap[
        'OwnedBeaconProxy<USDM>'
      ].address;
    const btcmAddress =
      globalVar.foundationConfig.smartcontract.MappedSwap[
        'OwnedBeaconProxy<BTCM>'
      ].address;
    const ethmAddress =
      globalVar.foundationConfig.smartcontract.MappedSwap[
        'OwnedBeaconProxy<ETHM>'
      ].address;

    query.timeInterval = query.timeInterval ? query.timeInterval : 60;
    /*
    logger.info(funcMsg);
    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();

    if (!query.timeInterval) {
      query.timeInterval = 60;
    }
    whereStatement.push('interval = :interval', 'interval', query.timeInterval);
    if (query.toTime) {
      whereStatement.push(
        'created_date <= :toTime',
        'toTime',
        query.toTime,
      );
    }
    if (query.pairName) {
      whereStatement.push(
        'pair_name = :pairName',
        'pairName',
        query.pairName,
      );
    }
    const sql =`select pair_name, 
      to_timestamp(cast (EXTRACT(EPOCH FROM created_date)/:timeInterval as INTEGER) * :timeInterval) "created_date", 
      first("open") "open", 
      last("close") "close",
      max("high") "high", 
      min("low") "low",
      sum("volume") "volume"
      from t_decats_price_histories 
      ${whereStatement.toSql()} 
      group by pair_name, cast (EXTRACT(EPOCH FROM created_date)/:timeInterval as INTEGER) 
      order by created_date desc, pair_name
      limit 1000;`

    whereStatement.replacement.timeInterval=query.timeInterval
    const priceHistories: any[] = await seq.sequelize.query(
      sql,
      {
        replacements:whereStatement.replacement,
        type: QueryTypes.SELECT,
      }
    );*/
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'pairName',
      query.pairName,
    );
    if (query.toTime) {
      whereStatement.createdDate = {
        [Op.lte]: query.toTime,
      };
    }
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'interval',
      query.timeInterval,
    );

    const records: any[] = await modelModule[
      SeqModel.name.PriceHistory
    ].findAll({
      where: whereStatement,
      limit: 1000,
      order: [
        ['created_date', 'DESC'],
        ['pair_name', 'ASC'],
      ],
    });

    const decimalList = await getPairListDecimalPlace(query);

    const objList: Array<any> = new Array<any>();
    // objList.push(kLineObj.oneMintue['BTCMUSDM']);
    // objList.push(kLineObj.oneMintue[query.pairName.replace('/', '')]);
    objList.push(kLineObj[query.pairName]);
    records.forEach((element) => {
      const obj: any = {};

      obj['id'] = element['id'];
      obj['pairName'] = element['pairName'];
      obj['reserve0'] = element['reserve0'];
      obj['reserve1'] = element['reserve1'];
      obj['createdDate'] = element['createdDate'];
      obj['status'] = element['status'];
      obj['open'] = element['open'];
      obj['close'] = element['close'];
      obj['low'] = element['low'];
      obj['high'] = element['high'];
      obj['volume'] = element['volume'];
      obj['interval'] = element['interval'];
      // obj['reserve0DecimalPlace'] = reserve0DecimalPlace;
      // obj['reserve1DecimalPlace'] = reserve1DecimalPlace;
      obj['reserve0DecimalPlace'] = decimalList['reserve0DecimalPlace'];
      obj['reserve1DecimalPlace'] = decimalList['reserve1DecimalPlace'];

      objList.push(obj);
    });

    // return records;
    return objList;
  }

  async getKLineDataVolumeSum(query: any): Promise<KLineDataVolumeSum> {
    const funcMsg = `[PriceHistoryService][getKLineDataVolumeSum]`;
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'pairName',
      query.pairName,
    );
    const dateFrom = `${query.dateFrom} - interval '${query.duration} hours'`;
    const dateTo = `${query.dateFrom}`;
    whereStatement.createdDate = {
      [Op.between]: [sequelize.literal(dateFrom), sequelize.literal(dateTo)],
    };
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'interval',
      '60',
    );

    const duration = `'${query.duration} hours'`;
    const pairNameMsg = `'${query.pairName}'`;
    const records: any[] = await modelModule[
      SeqModel.name.PriceHistory
    ].findAll({
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('volume')), 'sumOfVolume'],
        [Sequelize.literal(dateFrom), 'dateFrom'],
        [Sequelize.literal(dateTo), 'dateTo'],
        [Sequelize.literal(duration), 'duration'],
        [Sequelize.literal(pairNameMsg), 'pairName'],
      ],
      where: whereStatement,
      group: ['pair_name'],
    });
    if (records[0]) {
      return records[0] as KLineDataVolumeSum;
    } else {
      return {
        sumOfVolume: 0,
        dateFrom: dateFrom,
        dateTo: dateTo,
        duration: `${query.duration} hours`,
        pairName: query.pairName,
      };
    }
  }

  async getHistoryPrice(query: any): Promise<any> {
    const funcMsg = `[PriceService][getHistoryPrice]`;
    const resp = new ResponseBase();

    const currentDate = moment().startOf('minute');
    const yesterdayDate = currentDate
      .subtract(1, 'day')
      .format('YYYY-MM-DD HH:mm');
    const yesterdayDatePlusMintues = currentDate
      .subtract(-1, 'minutes')
      .format('YYYY-MM-DD HH:mm');

    const usdmAddress =
      globalVar.foundationConfig.smartcontract.MappedSwap[
        'OwnedBeaconProxy<USDM>'
      ].address;
    const btcmAddress =
      globalVar.foundationConfig.smartcontract.MappedSwap[
        'OwnedBeaconProxy<BTCM>'
      ].address;
    const ethmAddress =
      globalVar.foundationConfig.smartcontract.MappedSwap[
        'OwnedBeaconProxy<ETHM>'
      ].address;

    try {
      const whereStatement: any = {};
      sequelizeHelper.where.pushExactItemIfNotNull(
        whereStatement,
        'pair_name',
        query.pairName,
      );
      if (!query.timeInterval) {
        whereStatement.createdDate = {
          [Op.between]: [yesterdayDate, yesterdayDatePlusMintues],
        };
        sequelizeHelper.where.pushExactItemIfNotNull(
          whereStatement,
          'interval',
          60,
        );
      } else {
        sequelizeHelper.where.pushExactItemIfNotNull(
          whereStatement,
          'interval',
          query.timeInterval,
        );
      }

      const results: any = await modelModule[
        SeqModel.name.PriceHistory
      ].findOne({
        where: whereStatement,
        limit: 1,
        // offset: query.pageNo * query.recordPerPage,
        order: [['id', 'DESC']],
      });

      const decimalList = await getPairListDecimalPlace(query);

      const obj: any = {};
      obj['id'] = results['id'];
      obj['pairName'] = results['pairName'];
      obj['reserve0'] = results['reserve0'];
      obj['reserve1'] = results['reserve1'];
      obj['createdDate'] = results['createdDate'];
      obj['status'] = results['status'];
      obj['open'] = results['open'];
      obj['close'] = results['close'];
      obj['low'] = results['low'];
      obj['high'] = results['high'];
      obj['volume'] = results['volume'];
      obj['interval'] = results['interval'];
      obj['reserve0DecimalPlace'] = decimalList['reserve0DecimalPlace'];
      obj['reserve1DecimalPlace'] = decimalList['reserve1DecimalPlace'];

      return obj;
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);

      resp.success = true;
      resp.msg = funcMsg + ' - fail ';
    }

    // return resp;
  }
}
