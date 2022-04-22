/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import InterestHistory from '../dbModel/InterestHistory';
import * as SeqModel from './0_index';
export default InterestHistory;

export interface InterestHistoryModel
  extends Model<InterestHistory>,
    InterestHistory {}
export type InterestHistoryStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): InterestHistoryModel;
};
export function InterestHistoryFactory(sequelize: Sequelize) {
  return <InterestHistoryStatic>sequelize.define(
    SeqModel.name.InterestHistory,
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
      fromTime: {
        field: 'from_time',
        allowNull: false,
        type: DataTypes.DATE,
      },
      toTime: {
        field: 'to_time',
        allowNull: false,
        type: DataTypes.DATE,
      },
      token: {
        field: 'token',
        allowNull: false,
        type: DataTypes.STRING(64),
      },
      amount: {
        field: 'amount',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      rate: {
        field: 'rate',
        allowNull: true,
        type: DataTypes.DECIMAL,
      },
      interest: {
        field: 'interest',
        allowNull: true,
        type: DataTypes.DECIMAL,
      },
      totalInterest: {
        field: 'total_interest',
        allowNull: true,
        type: DataTypes.DECIMAL,
      },
      createdDate: {
        field: 'created_date',
        allowNull: true,
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
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
