/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import StakeRewards from '../dbModel/StakeRewards';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default StakeRewards;

export interface StakeRewardsModel extends Model<StakeRewards>, StakeRewards {}
export type StakeRewardsStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): StakeRewardsModel;
};
export function StakeRewardsFactory(sequelize: Sequelize) {
  return <StakeRewardsStatic>sequelize.define(
    SeqModel.name.StakeRewards,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      address: {
        field: 'address',
        allowNull: false,
        type: DataTypes.STRING(50),
      },
      poolToken: {
        field: 'pool_token',
        allowNull: false,
        type: DataTypes.STRING,
      },
      stakeAmount: {
        field: 'stake_amount',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      stakeRewardsAmount: {
        field: 'stake_rewards_amount',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      stakeTime: {
        field: 'stake_time',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      nodeID: {
        field: 'node_id',
        allowNull: false,
        type: DataTypes.STRING,
      },
      stakeHash: {
        field: 'stake_hash',
        allowNull: false,
        type: DataTypes.STRING,
      },
      blockNumber: {
        field: 'block_number',
        allowNull: false,
        type: DataTypes.STRING,
      },
      status: {
        field: 'status',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
      createdDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        field: 'created_date',
      },
      lastModifiedDate: {
        field: 'last_modified_date',
        allowNull: true,
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [],
    },
  );
}

export function StakeRewardsAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
}
