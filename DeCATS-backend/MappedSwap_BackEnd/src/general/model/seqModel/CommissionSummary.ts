/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type } from 'os';
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import CommissionSummary from '../dbModel/CommissionSummary';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default CommissionSummary;

export interface CommissionSummaryModel
  extends Model<CommissionSummary>,
    CommissionSummary {}
export type CommissionSummaryStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): CommissionSummaryModel;
};
export function CommissionSummaryFactory(sequelize: Sequelize) {
  return <CommissionSummaryStatic>sequelize.define(
    SeqModel.name.CommissionSummary,
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
      distTotalCommission: {
        field: 'dist_total_commission',
        allowNull: false,
        type: DataTypes.DECIMAL,
        comment:
          'Sum of all commission of this token in this job (dist_commission)',
      },
      distTotalCommissionInUSDM: {
        field: 'dist_total_commission_in_usdm',
        allowNull: false,
        type: DataTypes.DECIMAL,
        comment:
          'Sum of all commission of this token (in usdm) in this job (dist_commission_in_usdm)',
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['job_id', 'token'],
        },
      ],
    },
  );
}

export function CommissionSummaryAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
}
