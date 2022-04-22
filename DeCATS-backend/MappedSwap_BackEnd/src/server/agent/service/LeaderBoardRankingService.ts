import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { LeaderBoardRanking } from '../../../general/model/dbModel/0_index';

const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  getAll = async (): Promise<LeaderBoardRanking[]> => {
    const funcMsg = `[LeaderBoardRankingService][getAll]`;
    const whereStatement: any = {};
    try {
      const result: LeaderBoardRanking[] = (await modelModule[
        SeqModel.name.LeaderBoardRanking
      ].findAll({
        where: whereStatement,
        include: [
          {
            model: modelModule[SeqModel.name.LeaderBoardRule],
            as: 'rule',
            required: true,
          },
        ],
      })) as unknown as LeaderBoardRanking[];
      return result;
    } catch (err) {
      throw new Error(`${funcMsg}: ${err}`);
    }
  };
}
