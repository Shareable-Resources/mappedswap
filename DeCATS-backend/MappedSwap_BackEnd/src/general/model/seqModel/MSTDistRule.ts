/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import MSTDistRule from '../dbModel/MSTDistRule';
import * as SeqModel from './0_index';
export default MSTDistRule;

export interface MSTDistRuleModel extends Model<MSTDistRule>, MSTDistRule {}
export type MSTDistRuleStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): MSTDistRuleModel;
};
export function MSTDistRuleFactory(sequelize: Sequelize) {
  return <MSTDistRuleStatic>sequelize.define(
    SeqModel.name.MSTDistRule,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      grade: {
        field: 'grade',
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      weekAmount: {
        field: 'week_amount',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      holdMST: {
        field: 'hold_mst',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      commissionRate: {
        field: 'commission_rate',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      distMTokenRate: {
        field: 'dist_m_token_rate',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      distMSTTokenRate: {
        field: 'dist_mst_token_rate',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['grade'],
        },
      ],
    },
  );
}
