/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import CustomerCreditUpdate from '../dbModel/CustomerCreditUpdate';
import * as SeqModel from './0_index';
export default CustomerCreditUpdate;

export interface CustomerCreditUpdateModel
  extends Model<CustomerCreditUpdate>,
    CustomerCreditUpdate {}
export type CustomerCreditUpdateStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): CustomerCreditUpdateModel;
};
export function CustomerCreditUpdateFactory(sequelize: Sequelize) {
  return <CustomerCreditUpdateStatic>sequelize.define(
    SeqModel.name.CustomerCreditUpdate,
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
      customerId: {
        field: 'customer_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      agentId: {
        field: 'agent_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      origCredit: {
        field: 'orig_credit',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      credit: {
        field: 'credit',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      txHash: {
        field: 'tx_hash',
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      txStatus: {
        field: 'tx_status',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
      txTime: {
        field: 'tx_time',
        allowNull: true,
        type: DataTypes.DATE,
      },
      gasFee: {
        field: 'gas_fee',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      createdDate: {
        field: 'created_date',
        allowNull: true,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      createdById: {
        field: 'created_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      lastModifiedDate: {
        field: 'last_modified_date',
        allowNull: true,
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
      },
      lastModifiedById: {
        field: 'last_modified_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      status: {
        field: 'status',
        allowNull: true,
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
          fields: ['tx_hash'],
        },
      ],
    },
  );
}
