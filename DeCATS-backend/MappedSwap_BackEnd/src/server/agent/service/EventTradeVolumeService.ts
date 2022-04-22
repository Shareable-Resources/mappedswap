import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op } from 'sequelize';
import moment from 'moment';
import { Customer } from '../../../general/model/dbModel/0_index';
import globalVar from '../const/globalVar';
const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getAll(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatement: any = {};
    const dateFrom = query.dateFrom
      ? moment.utc(query.dateFrom, 'YYYY-MM-DD').startOf('day').toDate()
      : undefined;
    const dateTo = query.dateTo
      ? moment.utc(query.dateTo, 'YYYY-MM-DD').endOf('day').toDate()
      : undefined;

    if (dateFrom && dateTo) {
      whereStatement.acheivedDate = {
        [Op.between]: [dateFrom, dateTo],
      };
    } else if (dateFrom) {
      whereStatement.acheivedDate = {
        [Op.gte]: dateFrom,
      };
    } else if (dateTo) {
      whereStatement.acheivedDate = {
        [Op.lte]: dateTo,
      };
    }
    let botCustomer: Customer = (await modelModule[
      SeqModel.name.Customer
    ].findOne({
      where: {
        address: {
          [Op.iLike]: `%${globalVar.foundationConfig.smartcontract.MappedSwap['OwnedUpgradeableProxy<PriceAdjust>'].address}%`,
        },
      },
    })) as any;
    if (!botCustomer) {
      throw new Error('Bot customer does not exists');
    }
    botCustomer = JSON.parse(JSON.stringify(botCustomer));
    const botId = botCustomer.id;
    whereStatement.customerId = {
      [Op.ne]: botId,
    };
    const results: any = await modelModule[
      SeqModel.name.EventTradeVolume
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['acheived_date', 'desc']],
    });
    return results;
  }
}
