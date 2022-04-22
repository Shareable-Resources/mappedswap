/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import Agent from '../dbModel/Agent';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default Agent;

export interface AgentModel extends Model<Agent>, Agent {}
export type AgentStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): AgentModel;
};
export function AgentFactory(sequelize: Sequelize) {
  return <AgentStatic>sequelize.define(
    SeqModel.name.Agent,
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
        comment: 'Wallet address of the agent',
      },
      name: {
        field: 'name',
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      password: {
        field: 'password',
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      email: {
        field: 'email',
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      parentAgentId: {
        field: 'parent_agent_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      interestPercentage: {
        field: 'interest_percentage',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      feePercentage: {
        field: 'fee_percentage',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      agentType: {
        field: 'agent_type',
        allowNull: true,
        type: DataTypes.SMALLINT,
      },
      agentLevel: {
        field: 'agent_level',
        allowNull: true,
        type: DataTypes.SMALLINT,
      },
      referralCodeId: {
        field: 'referral_code_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      fundingCodeId: {
        field: 'funding_code_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      createdDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        field: 'created_date',
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
      role: {
        field: 'role',
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      signData: {
        field: 'sign_data',
        allowNull: true,
        type: DataTypes.STRING(500),
      },
      allowViewAgent: {
        field: 'allow_view_agent',
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      parentTree: {
        field: 'parent_tree',
        allowNull: true,
        type: DataTypes.ARRAY(DataTypes.BIGINT),
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
        {
          unique: false,
          fields: ['email'],
        },
      ],
    },
  );
}

export function AgentAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
  //Customer.agentId
  //Agent.id
  m[SeqModel.name.Agent].hasOne(m[SeqModel.name.Customer], {
    as: 'customerAgent',
    foreignKey: {
      name: 'agentId',
    },
  });
  m[SeqModel.name.Customer].belongsTo(m[SeqModel.name.Agent], {
    as: 'agent',
    foreignKey: {
      name: 'agentId',
    },
    targetKey: 'id',
  });

  m[SeqModel.name.Agent].hasMany(m[SeqModel.name.Agent], {
    onDelete: 'CASCADE',
    as: 'children',
    foreignKey: {
      name: 'parentAgentId',
    },
  });
  m[SeqModel.name.Agent].belongsTo(m[SeqModel.name.Agent], {
    as: 'parent',
    foreignKey: {
      name: 'parentAgentId',
    },
    targetKey: 'parentAgentId',
  });

  // m[SeqModel.name.Agent].hasMany(m[SeqModel.name.Agent], {
  //   as: 'agentTree',
  //   foreignKey: {
  //     name: 'agentId',
  //   },
  //   // targetKey: 'id',
  // });

  // // m[SeqModel.name.Agent].hasMany(m[SeqModel.name.Agent], {
  // //   as: 'children',
  // //   foreignKey: {
  // //     name: 'parentId',
  // //   },
  // // });
  // // m[SeqModel.name.Agent].belongsTo(m[SeqModel.name.Agent], {
  // //   as: 'parent',
  // //   foreignKey: {
  // //     name: 'parentId',
  // //   },
  // //   targetKey: 'parentId',
  // // });
}
