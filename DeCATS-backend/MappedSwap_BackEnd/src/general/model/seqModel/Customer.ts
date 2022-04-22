/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type } from 'os';
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import Customer from '../dbModel/Customer';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default Customer;

export interface CustomerModel extends Model<Customer>, Customer {}
export type CustomerStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): CustomerModel;
};
export function CustomerFactory(sequelize: Sequelize) {
  return <CustomerStatic>sequelize.define(
    SeqModel.name.Customer,
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
      name: {
        field: 'name',
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      agentId: {
        field: 'agent_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      leverage: {
        field: 'leverage',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      maxFunding: {
        field: 'max_funding',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      creditMode: {
        field: 'credit_mode',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
      contractStatus: {
        field: 'contract_status',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
      riskLevel: {
        field: 'risk_level',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      fundingCodeId: {
        field: 'funding_code_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      type: {
        field: 'type',
        allowNull: true,
        type: DataTypes.SMALLINT,
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
          fields: ['address'],
        },
      ],
    },
  );
}

export function CustomerAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
  // //Customer.id
  // //CustomerCreditUpdate.customer_id
  // m[SeqModel.name.Customer].hasMany(m[SeqModel.name.CustomerCreditUpdate], {
  //   as: 'updates',
  //   foreignKey: {
  //     name: 'customer_id',
  //   },
  // });
  // m[SeqModel.name.CustomerCreditUpdate].belongsTo(m[SeqModel.name.Customer], {
  //   as: 'customer',
  //   foreignKey: {
  //     name: 'customer_id',
  //   },
  //   targetKey: 'id',
  // });

  // m[SeqModel.name.Customer].hasMany(m[SeqModel.name.Transaction], {
  //   as: 'transaction',
  //   foreignKey: {
  //     name: 'customer_id',
  //   },
  // });
  // m[SeqModel.name.Transaction].belongsTo(m[SeqModel.name.Customer], {
  //   as: 'transaction',
  //   foreignKey: {
  //     name: 'customer_id',
  //   },
  //   targetKey: 'id',
  // });

  // m[SeqModel.name.Customer].hasOne(m[SeqModel.name.Transaction], {
  //   as: 'transactionCustomer',
  //   foreignKey: {
  //     name: 'customerId',
  //     field: 'customer_id',
  //     allowNull: true,
  //   },
  // });
  // m[SeqModel.name.Transaction].belongsTo(m[SeqModel.name.Customer], {
  //   as: 'customer',
  //   foreignKey: {
  //     allowNull: true,
  //   },
  //   targetKey: 'id',
  // });
}
