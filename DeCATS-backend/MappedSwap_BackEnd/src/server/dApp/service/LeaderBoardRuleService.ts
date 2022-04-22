import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { LeaderBoardRule } from '../../../general/model/dbModel/0_index';

const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(): Promise<LeaderBoardRule[]> {
    const funcMsg = `[LeaderBoardRuleSerivce][getAll]`;
    const whereStatement: any = {};
    try {
      const result: LeaderBoardRule[] = (await modelModule[
        SeqModel.name.LeaderBoardRule
      ].findAll({
        where: whereStatement,
        order: [['rank', 'asc']],
      })) as unknown as LeaderBoardRule[];
      return result;
    } catch (err) {
      throw new Error(`${funcMsg}: ${err}`);
    }
  }
}
