/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import CommissionLedger from '../dbModel/CommissionLedger';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default CommissionLedger;

export interface CommissionLedgerModel
  extends Model<CommissionLedger>,
    CommissionLedger {}
export type CommissionLedgerStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): CommissionLedgerModel;
};
export function CommissionLedgerFactory(sequelize: Sequelize) {
  return <CommissionLedgerStatic>sequelize.define(
    SeqModel.name.CommissionLedger,
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
      token: {
        field: 'token',
        allowNull: false,
        type: DataTypes.STRING(64),
        comment: 'Mapped Swap token name',
      },
      agentId: {
        field: 'agent_id',
        allowNull: false,
        type: DataTypes.BIGINT,
        comment: 'the agent who own this ledger',
      },
      distCommission: {
        field: 'dist_commission',
        allowNull: false,
        type: DataTypes.DECIMAL,
        comment: 'how much commissions this job will distributed',
      },
      distCommissionInUSDM: {
        field: 'dist_commission_in_usdm',
        allowNull: false,
        type: DataTypes.DECIMAL,
        comment: 'how much commissions(in usdm) this job will distributed',
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
        comment: 'create date',
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['job_id', 'token', 'agent_id'],
        },
      ],
    },
  );
}

export function CommissionLedgerAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
  //CommissionLedger.id
  //CommissionLedgerCreditUpdate.CommissionLedger_id

  m[SeqModel.name.Agent].hasOne(m[SeqModel.name.CommissionLedger], {
    as: 'ledgerAgent',
    foreignKey: {
      name: 'agentId',
    },
  });
  m[SeqModel.name.CommissionLedger].belongsTo(m[SeqModel.name.Agent], {
    as: 'agent',
    foreignKey: {
      name: 'agentId',
    },
    targetKey: 'id',
  });
}
