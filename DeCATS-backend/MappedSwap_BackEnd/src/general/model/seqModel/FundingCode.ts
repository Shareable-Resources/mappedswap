/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import FundingCode from '../dbModel/FundingCode';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default FundingCode;

export interface FundingCodeModel extends Model<FundingCode>, FundingCode {}
export type FundingCodeStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): FundingCodeModel;
};
export function FundingCodeFactory(sequelize: Sequelize) {
  return <FundingCodeStatic>sequelize.define(
    SeqModel.name.FundingCode,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      fundingCode: {
        field: 'funding_code',
        allowNull: true,
        type: DataTypes.STRING(500),
      },
      type: {
        field: 'type',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
      agentId: {
        field: 'agent_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      customerName: {
        field: 'customer_name',
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      hashString: {
        field: 'hash_string',
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      isUsed: {
        field: 'is_used',
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      codeStatus: {
        field: 'code_status',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
      expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'expiry_date',
      },
      agentType: {
        field: 'agent_type',
        allowNull: true,
        type: DataTypes.SMALLINT,
      },
      createdDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_date',
      },
      createdById: {
        field: 'created_by_id',
        allowNull: false,
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
          fields: ['funding_code'],
        },
      ],
    },
  );
}

export function FundingCodeAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
  //Customer.agentId
  //Agent.id

  m[SeqModel.name.Agent].hasMany(m[SeqModel.name.FundingCode], {
    as: 'fundingCodes',
    foreignKey: {
      name: 'agentId',
    },
  });
  m[SeqModel.name.FundingCode].belongsTo(m[SeqModel.name.Agent], {
    as: 'agent',
    foreignKey: {
      name: 'agentId',
    },
    targetKey: 'id',
  });

  m[SeqModel.name.FundingCode].hasOne(m[SeqModel.name.Customer], {
    as: 'customer',
    foreignKey: {
      allowNull: true,
      name: 'fundingCodeId',
      field: 'funding_code_id',
    },
    constraints: false,
    // sourceKey: 'funding_code_id',
  });
  m[SeqModel.name.Customer].belongsTo(m[SeqModel.name.FundingCode], {
    as: 'fundingCode',
    foreignKey: {
      allowNull: true,
      name: 'id',
      field: 'id',
    },
    constraints: false,
    // targetKey: 'id',
  });

  m[SeqModel.name.FundingCode].hasOne(m[SeqModel.name.Agent], {
    as: 'AgentfundingCode',
    foreignKey: {
      allowNull: true,
      name: 'fundingCodeId',
      field: 'funding_code_id',
    },
    constraints: false,
    // sourceKey: 'funding_code_id',
  });
  m[SeqModel.name.Agent].belongsTo(m[SeqModel.name.FundingCode], {
    as: 'fundingCodeAgent',
    foreignKey: {
      allowNull: true,
      name: 'id',
      field: 'id',
    },
    constraints: false,
    // targetKey: 'id',
  });

  // m[SeqModel.name.Customer].hasOne(m[SeqModel.name.FundingCode], {
  //   as: 'customer',
  //   foreignKey: {
  //     allowNull: true,
  //     name: 'fundingCodeId',
  //   },
  // });
  // m[SeqModel.name.FundingCode].belongsTo(m[SeqModel.name.Customer], {
  //   as: 'fundingCode',
  //   foreignKey: {
  //     allowNull: true,
  //     name: 'id',
  //   },
  //   targetKey: 'id',
  // });

  // m[SeqModel.name.Agent].hasMany(m[SeqModel.name.Agent], {
  //   as: 'children',
  //   foreignKey: {
  //     name: 'parentId',
  //   },
  // });
  // m[SeqModel.name.Agent].belongsTo(m[SeqModel.name.Agent], {
  //   as: 'parent',
  //   foreignKey: {
  //     name: 'parentId',
  //   },
  //   targetKey: 'parentId',
  // });
}
