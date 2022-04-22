import { type } from 'os';
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import BurnTransactions from '../dbModel/BurnTransactions';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default BurnTransactions;

export interface BurnTransactionsModel
  extends Model<BurnTransactions>,
    BurnTransactions {}
export type BurnTransactionsStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): BurnTransactionsModel;
};
export function BurnTransactionsFactory(sequelize: Sequelize) {
  return <BurnTransactionsStatic>sequelize.define(
    SeqModel.name.BurnTransactions,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
        comment: 'id (autoIncrement)',
      },
      txHash: {
        field: 'tx_hash',
        allowNull: false,
        type: DataTypes.STRING,
      },
      mstAmount: {
        field: 'mst_amount',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
      },
      createdById: {
        field: 'created_by_id',
        allowNull: false,
        type: DataTypes.BIGINT,
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
