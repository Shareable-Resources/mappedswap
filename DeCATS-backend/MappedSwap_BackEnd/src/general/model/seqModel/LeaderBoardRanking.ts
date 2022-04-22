import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import LeaderBoardRanking from '../dbModel/LeaderBoardRanking';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default LeaderBoardRanking;

export interface LeaderBoardRankingModel
  extends Model<LeaderBoardRanking>,
    LeaderBoardRanking {}
export type LeaderBoardRankingStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): LeaderBoardRankingModel;
};
export function LeaderBoardRankingFactory(
  sequelize: Sequelize,
): LeaderBoardRankingStatic {
  return <LeaderBoardRankingStatic>sequelize.define(
    SeqModel.name.LeaderBoardRanking,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      customerId: {
        field: 'customer_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      netCastInUSDM: {
        field: 'net_cast_in_usdm',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      profitAndLoss: {
        field: 'profit_and_loss',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      ruleId: {
        field: 'rule_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['id'],
        },
      ],
    },
  );
}

export function LeaderBoardRankingAssociation(sequelize: any): void {
  const m: ModelCtors = sequelize.models;

  console.log('hello: ', m);
  m[SeqModel.name.LeaderBoardRule].hasMany(
    m[SeqModel.name.LeaderBoardRanking],
    {
      as: 'leaderBoardDetails',
      foreignKey: {
        name: 'id',
      },
      constraints: false,
    },
  );

  m[SeqModel.name.LeaderBoardRanking].belongsTo(
    m[SeqModel.name.LeaderBoardRule],
    {
      as: 'rule',
      foreignKey: {
        name: 'ruleId',
      },
      targetKey: 'id',
      constraints: false,
    },
  );

  // m[SeqModel.name.LeaderBoardRanking].hasMany(m[SeqModel.name.Customer], {
  //   as: 'leaderBoardRankingCustomer',
  //   foreignKey: {
  //     name: 'id',
  //   },
  // });
  // m[SeqModel.name.Customer].belongsTo(m[SeqModel.name.LeaderBoardRanking], {
  //   as: 'customerLeaderBoardRanking',
  //   foreignKey: {
  //     name: 'id',
  //   },
  //   targetKey: 'id',
  // });

  m[SeqModel.name.Customer].hasOne(m[SeqModel.name.LeaderBoardRanking], {
    as: 'customerLeaderboardRanking',
    foreignKey: {
      name: 'customerId',
    },
  });
  m[SeqModel.name.LeaderBoardRanking].belongsTo(m[SeqModel.name.Customer], {
    as: 'customer',
    foreignKey: {
      name: 'customerId',
    },
    targetKey: 'id',
  });
}
