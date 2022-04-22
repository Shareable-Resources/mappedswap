import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import Stopout from '../dbModel/Stopout';
import * as SeqModel from './0_index';
export default Stopout;

export interface StopoutModel extends Model<Stopout>, Stopout {}
export type StopoutStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): StopoutModel;
};
export function StopoutFactory(sequelize: Sequelize) {
  return <StopoutStatic>sequelize.define(
    SeqModel.name.Stopout,
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
      equity: {
        allowNull: true,
        field: 'equity',
        type: DataTypes.DECIMAL,
      },
      credit: {
        field: 'credit',
        allowNull: true,
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
      requestTime: {
        field: 'request_time',
        allowNull: false,
        type: DataTypes.DATE,
      },
      leverage: {
        field: 'leverage',
        allowNull: true,
        type: DataTypes.DECIMAL,
      },
      fundingUsed: {
        field: 'funding_used',
        allowNull: true,
        type: DataTypes.DECIMAL,
      },
      riskLevel: {
        field: 'risk_level',
        allowNull: true,
        type: DataTypes.DECIMAL,
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
