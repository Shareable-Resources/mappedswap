import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import BalanceHistory from '../dbModel/BalanceHistory';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default BalanceHistory;

export interface BalanceHistoryModel
  extends Model<BalanceHistory>,
    BalanceHistory {}
export type BalanceHistoryStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): BalanceHistoryModel;
};
export function BalanceHistoryFactory(sequelize: Sequelize) {
  return <BalanceHistoryStatic>sequelize.define(
    SeqModel.name.BalanceHistory,
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
      token: {
        field: 'token',
        allowNull: false,
        type: DataTypes.STRING(64),
      },
      type: {
        field: 'type',
        allowNull: false,
        type: DataTypes.SMALLINT,
        comment: 'Buy = 1,Sell = 2, Deposit = 3,Withdraw = 4,Interest = 5',
      },
      amount: {
        field: 'amount',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      balance: {
        field: 'balance',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      updateTime: {
        field: 'update_time',
        allowNull: false,
        type: DataTypes.DATE,
      },
      txHash: {
        field: 'tx_hash',
        allowNull: false,
        type: DataTypes.STRING(255),
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
      status: {
        field: 'status',
        allowNull: false,
        defaultValue: 0,
        type: DataTypes.SMALLINT,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
    },
  );
}
export function BalanceHistoryAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
  //Customer.id;
  //BalanceHistories.customerId;

  m[SeqModel.name.Customer].hasOne(m[SeqModel.name.BalanceHistory], {
    as: 'balanceHistoryCustomer',
    foreignKey: {
      name: 'customerId',
      field: 'customer_id',
      allowNull: true,
    },
  });
  m[SeqModel.name.BalanceHistory].belongsTo(m[SeqModel.name.Customer], {
    as: 'customer',
    foreignKey: {
      allowNull: true,
    },
    targetKey: 'id',
  });
}
