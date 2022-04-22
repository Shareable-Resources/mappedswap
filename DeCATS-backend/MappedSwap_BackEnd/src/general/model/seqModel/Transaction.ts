/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import Transaction from '../dbModel/Transaction';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default Transaction;

export interface TransactionModel extends Model<Transaction>, Transaction {}
export type TransactionStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): TransactionModel;
};
export function TransactionFactory(sequelize: Sequelize) {
  return <TransactionStatic>sequelize.define(
    SeqModel.name.Transaction,
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
        type: DataTypes.STRING(255),
      },
      customerId: {
        field: 'customer_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      agentId: {
        field: 'agent_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      sellToken: {
        field: 'sell_token',
        allowNull: true,
        type: DataTypes.STRING(64),
      },
      sellAmount: {
        field: 'sell_amount',
        allowNull: true,
        type: DataTypes.DECIMAL,
      },
      buyToken: {
        field: 'buy_token',
        allowNull: true,
        type: DataTypes.STRING(64),
      },
      buyAmount: {
        field: 'buy_amount',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      txHash: {
        field: 'tx_hash',
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      txTime: {
        field: 'tx_time',
        allowNull: true,
        type: DataTypes.DATE,
      },
      txStatus: {
        field: 'tx_status',
        allowNull: true,
        type: DataTypes.SMALLINT,
      },
      gasFee: {
        field: 'gas_fee',
        allowNull: true,
        type: DataTypes.DECIMAL,
      },
      blockHeight: {
        field: 'block_height',
        allowNull: true,
        type: DataTypes.DECIMAL,
      },
      blockHash: {
        field: 'block_hash',
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      stopout: {
        field: 'stopout',
        allowNull: true,
        type: DataTypes.BOOLEAN,
      },
      createdDate: {
        field: 'created_date',
        allowNull: true,
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
      indexes: [
        {
          unique: false,
          fields: ['tx_hash'],
        },
        {
          unique: false,
          name: 't_decats_transactions_created_date',
          fields: ['created_date'],
        },
      ],
    },
  );
}

export function TranscationAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
  //Customer.id
  //CustomerCreditUpdate.customer_id
  // m[SeqModel.name.Customer].hasMany(m[SeqModel.name.Transaction], {
  //   as: 'transaction',
  //   foreignKey: {
  //     name: 'customer_id',
  //   },
  // });
  // m[SeqModel.name.Transaction].belongsTo(m[SeqModel.name.Customer], {
  //   as: 'customer',
  //   foreignKey: {
  //     name: 'customer_id',
  //   },
  //   targetKey: 'id',
  // });

  m[SeqModel.name.Customer].hasOne(m[SeqModel.name.Transaction], {
    as: 'transactionCustomer',
    foreignKey: {
      name: 'customerId',
      field: 'customer_id',
      allowNull: true,
    },
  });
  m[SeqModel.name.Transaction].belongsTo(m[SeqModel.name.Customer], {
    as: 'customer',
    foreignKey: {
      allowNull: true,
    },
    targetKey: 'id',
  });

  // m[SeqModel.name.Customer].hasOne(m[SeqModel.name.BalanceHistory], {
  //   as: 'balanceHistoryCustomer',
  //   foreignKey: {
  //     name: 'customerId',
  //     field: 'customer_id',
  //     allowNull: true,
  //   },
  // });
  // m[SeqModel.name.BalanceHistory].belongsTo(m[SeqModel.name.Customer], {
  //   as: 'customer',
  //   foreignKey: {
  //     allowNull: true,
  //   },
  //   targetKey: 'id',
  // });
}
