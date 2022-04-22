/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type } from 'os';
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import { ids } from 'webpack';
import MiningRewardsDistribution from '../dbModel/MiningRewardsDistribution';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default MiningRewardsDistribution;

export interface MiningRewardsDistributionModel
  extends Model<MiningRewardsDistribution>,
    MiningRewardsDistribution {}
export type MiningRewardsDistributionStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): MiningRewardsDistributionModel;
};
export function MiningRewardsDistributionFactory(sequelize: Sequelize) {
  return <MiningRewardsDistributionStatic>sequelize.define(
    SeqModel.name.MiningRewardsDistribution,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
        comment: 'id (autoIncrement)',
      },
      jobId: {
        field: 'job_id',
        allowNull: false,
        type: DataTypes.BIGINT,
        comment: 'Commission job id',
      },
      status: {
        field: 'status',
        allowNull: false,
        type: DataTypes.SMALLINT,
        comment: 'NotAcquired = 0,Acquired = 10',
      },
      poolToken: {
        field: 'pool_token',
        allowNull: false,
        type: DataTypes.STRING,
      },
      address: {
        field: 'address',
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      amount: {
        field: 'amount',
        allowNull: true,
        type: DataTypes.DECIMAL,
      },
      UsdcAmount: {
        field: 'usdc_amount',
        allowNull: true,
        type: DataTypes.DECIMAL,
      },
      acquiredDate: {
        field: 'acquired_date',
        allowNull: true,
        type: DataTypes.BIGINT,
        comment: 'The date the agent got this commission',
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['id', 'job_id'],
        },
      ],
    },
  );
}

export function MiningRewardsDistributionAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
}
