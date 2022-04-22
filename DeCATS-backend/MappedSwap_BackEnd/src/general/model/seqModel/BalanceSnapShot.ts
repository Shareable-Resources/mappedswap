/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import BalanceSnapshot from '../dbModel/BalanceSnapshot';
import * as SeqModel from './0_index';
export default BalanceSnapshot;
export interface BalanceSnapshotModel
  extends Model<BalanceSnapshot>,
    BalanceSnapshot {}
export type BalanceSnapshotStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): BalanceSnapshotModel;
};
export function BalanceSnapshotFactory(sequelize: Sequelize) {
  return <BalanceSnapshotStatic>sequelize.define(
    SeqModel.name.BalanceSnapshot,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      token: {
        field: 'token',
        allowNull: false,
        type: DataTypes.STRING(64),
      },
      customerId: {
        field: 'customer_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      balance: {
        field: 'balance',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'Lastest balance',
      },
      unrealizedInterest: {
        field: 'unrealized_interest',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment:
          'The total_interest (23:00:00.000-23.59.59.999) from t_decats_interest_histories',
      },
      dateFrom: {
        field: 'date_from',
        allowNull: true,
        type: DataTypes.DATE,
      },
      dateTo: {
        field: 'date_to',
        allowNull: true,
        type: DataTypes.DATE,
      },
      updateTime: {
        field: 'update_time',
        allowNull: true,
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
        comment: 't_decats_balance_histories.updateTime of the updated balance',
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
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
    },
  );
}
