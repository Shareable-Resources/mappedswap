import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import Balance from '../dbModel/Balance';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';

export default Balance;

export interface BalanceModel extends Model<Balance>, Balance {}
export type BalanceStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): BalanceModel;
};
export function BalanceFactory(sequelize: Sequelize) {
  return <BalanceStatic>sequelize.define(
    SeqModel.name.Balance,
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
      balance: {
        field: 'balance',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      interest: {
        field: 'interest',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      updateTime: {
        field: 'update_time',
        allowNull: false,
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
      indexes: [
        {
          unique: true,
          fields: ['address', 'token'],
        },
      ],
    },
  );
}

export function BalanceAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
  m[SeqModel.name.Customer].hasMany(m[SeqModel.name.Balance], {
    as: 'balances',
    foreignKey: {
      name: 'customerId',
      field: 'customer_id',
    },
  });
  m[SeqModel.name.Balance].belongsTo(m[SeqModel.name.Customer], {
    as: 'customer',
    foreignKey: {
      name: 'customerId',
    },
    targetKey: 'id',
  });
}
