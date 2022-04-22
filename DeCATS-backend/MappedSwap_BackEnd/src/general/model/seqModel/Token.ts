import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import Token from '../dbModel/Token';
import * as SeqModel from './0_index';
export default Token;

export interface TokenModel extends Model<Token>, Token {}
export type TokenStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): TokenModel;
};
export function TokenFactory(sequelize: Sequelize) {
  return <TokenStatic>sequelize.define(
    SeqModel.name.Token,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      name: {
        field: 'name',
        allowNull: false,
        type: DataTypes.STRING(64),
      },
      address: {
        field: 'address',
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      decimals: {
        field: 'decimals',
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
