import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import PriceHistoryRef from '../dbModel/PriceHistoryRef';
import * as SeqModel from './0_index';
export default PriceHistoryRef;

export interface PriceHistoryRefModel
  extends Model<PriceHistoryRef>,
    PriceHistoryRef {}
export type PriceHistoryRefStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): PriceHistoryRefModel;
};
export function PriceHistoryRefFactory(sequelize: Sequelize) {
  return <PriceHistoryRefStatic>sequelize.define(
    SeqModel.name.PriceHistoryRef,
    {
      tokenFrom: {
        field: 'token_from',
        allowNull: false,
        type: DataTypes.STRING(64),
      },
      tokenTo: {
        field: 'token_to',
        allowNull: false,
        type: DataTypes.STRING(64),
      },
      sourceFrom: {
        field: 'source_from',
        allowNull: false,
        type: DataTypes.STRING(64),
        primaryKey: true,
      },
      price: {
        field: 'price',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      createdDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'created_date',
        primaryKey: true,
      },
      remark: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: 'remark',
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
    },
  );
}
