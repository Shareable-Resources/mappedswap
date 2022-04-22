/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type } from 'os';
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import MiningRewards from '../dbModel/MiningRewards';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default MiningRewards;

export interface MiningRewardsModel
  extends Model<MiningRewards>,
    MiningRewards {}
export type MiningRewardsStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): MiningRewardsModel;
};
export function MiningRewardsFactory(sequelize: Sequelize) {
  return <MiningRewardsStatic>sequelize.define(
    SeqModel.name.MiningRewards,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
        comment: 'id (autoIncrement)',
      },
      dateFrom: {
        field: 'date_from',
        allowNull: false,
        type: DataTypes.DATE,
      },
      dateTo: {
        field: 'date_to',
        allowNull: false,
        type: DataTypes.DATE,
      },
      roundId: {
        field: 'round_id',
        allowNull: false,
        type: DataTypes.BIGINT,
        comment: 'Commission job id',
      },
      poolToken: {
        field: 'pool_token',
        allowNull: false,
        type: DataTypes.STRING,
      },
      approvedById: {
        field: 'approved_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
        comment: 'who approve this job',
      },
      approvedDate: {
        field: 'approved_date',
        allowNull: true,
        type: DataTypes.DATE,
        comment: 'approve date',
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
      },
      lastModifiedDate: {
        field: 'last_modified_date',
        allowNull: true,
        type: DataTypes.DATE,
      },
      lastModifiedById: {
        field: 'last_modified_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
        comment: 'who last modify this job',
      },
      status: {
        field: 'status',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
      exchangeRate: {
        field: 'exchange_rate',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      mstExchangeRate: {
        field: 'mst_exchange_rate',
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
          fields: ['id'],
        },
      ],
    },
  );
}

export function MiningRewardsAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;

  m[SeqModel.name.MiningRewards].hasMany(
    m[SeqModel.name.MiningRewardsDistribution],
    {
      // onDelete: 'CASCADE',
      as: 'rewardsDetails',
      foreignKey: {
        name: 'jobId',
      },
      constraints: false,
    },
  );
  m[SeqModel.name.MiningRewardsDistribution].belongsTo(
    m[SeqModel.name.MiningRewards],
    {
      as: 'parentRewards',
      foreignKey: {
        name: 'id',
        allowNull: true,
      },
      targetKey: 'id',
      constraints: false,
    },
  );
}
