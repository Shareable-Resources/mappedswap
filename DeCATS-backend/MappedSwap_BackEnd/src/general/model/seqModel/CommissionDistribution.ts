/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type } from 'os';
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import CommissionDistribution from '../dbModel/CommissionDistribution';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default CommissionDistribution;

export interface CommissionDistributionModel
  extends Model<CommissionDistribution>,
    CommissionDistribution {}
export type CommissionDistributionStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): CommissionDistributionModel;
};
export function CommissionDistributionFactory(sequelize: Sequelize) {
  return <CommissionDistributionStatic>sequelize.define(
    SeqModel.name.CommissionDistribution,
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
      agentId: {
        field: 'agent_id',
        allowNull: false,
        type: DataTypes.BIGINT,
        comment: 'Agent id',
      },
      address: {
        field: 'address',
        allowNull: false,
        type: DataTypes.STRING(50),
        comment: 'Wallet address of the agent',
      },
      status: {
        field: 'status',
        allowNull: false,
        type: DataTypes.SMALLINT,
        comment: 'NotAcquired = 0,Acquired = 10',
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
      },
      acquiredDate: {
        field: 'acquired_date',
        allowNull: true,
        type: DataTypes.DATE,
        comment: 'The date the agent got this commission',
      },
      txHash: {
        field: 'tx_hash',
        allowNull: true,
        type: DataTypes.STRING(255),
        comment:
          'The txHash from blockchain when the agent got this commission',
      },
      txDate: {
        field: 'tx_date',
        allowNull: true,
        type: DataTypes.DATE,
        comment:
          'The txDate from blockchain when the agent got this commission',
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['job_id', 'agent_id'],
        },
      ],
    },
  );
}

export function CommissionDistributionAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
  m[SeqModel.name.Agent].hasOne(m[SeqModel.name.CommissionDistribution], {
    as: 'distAgent2',
    foreignKey: {
      name: 'agentId',
    },
  });
  m[SeqModel.name.CommissionDistribution].belongsTo(m[SeqModel.name.Agent], {
    as: 'agent',
    foreignKey: {
      name: 'agentId',
    },
    targetKey: 'id',
  });
}
