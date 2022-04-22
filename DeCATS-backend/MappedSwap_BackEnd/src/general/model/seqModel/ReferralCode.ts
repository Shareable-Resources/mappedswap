/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import ReferralCode from '../dbModel/ReferralCode';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default ReferralCode;

export interface ReferralCodeModel extends Model<ReferralCode>, ReferralCode {}
export type ReferralCodeStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): ReferralCodeModel;
};
export function ReferralCodeFactory(sequelize: Sequelize) {
  return <ReferralCodeStatic>sequelize.define(
    SeqModel.name.ReferralCode,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      referralCode: {
        field: 'referral_code',
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
      agentName: {
        field: 'agent_name',
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      hashString: {
        field: 'hash_string',
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      feePercentage: {
        field: 'fee_percentage',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      interestPercentage: {
        field: 'interest_percentage',
        allowNull: false,
        type: DataTypes.DECIMAL,
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
      agentType: {
        field: 'agent_type',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
      expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        field: 'expiry_date',
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
          fields: ['referral_code'],
        },
      ],
    },
  );
}

export function ReferralCodeAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
  //Customer.agentId
  //Agent.id
  m[SeqModel.name.Agent].hasMany(m[SeqModel.name.ReferralCode], {
    as: 'ReferralCodeAgent',
    foreignKey: {
      name: 'agentId',
    },
  });
  m[SeqModel.name.ReferralCode].belongsTo(m[SeqModel.name.Agent], {
    as: 'agent',
    foreignKey: {
      name: 'agentId',
    },
    targetKey: 'id',
  });
}
