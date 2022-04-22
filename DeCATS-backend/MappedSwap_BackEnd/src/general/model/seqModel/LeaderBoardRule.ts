import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import LeaderBoardRule from '../dbModel/LeaderBoardRule';
import * as SeqModel from './0_index';
export default LeaderBoardRule;

export interface LeaderBoardRuleModel
  extends Model<LeaderBoardRule>,
    LeaderBoardRule {}
export type LeaderBoardRuleStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): LeaderBoardRuleModel;
};
export function LeaderBoardRuleFactory(
  sequelize: Sequelize,
): LeaderBoardRuleStatic {
  return <LeaderBoardRuleStatic>sequelize.define(
    SeqModel.name.LeaderBoardRule,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      rank: {
        field: 'rank',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
      percentageOfPrice: {
        field: 'percentage_of_price',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['rank'],
        },
      ],
    },
  );
}
