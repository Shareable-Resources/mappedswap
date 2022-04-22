import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import Prices from '../dbModel/Prices';
import * as SeqModel from './0_index';
export default Prices;

export interface PricesModel extends Model<Prices>, Prices {}
export type PricesStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): PricesModel;
};
export function PricesFactory(sequelize: Sequelize) {
  return <PricesStatic>sequelize.define(
    SeqModel.name.Prices,
    {
      pairName: {
        field: 'pair_name',
        allowNull: false,
        type: DataTypes.STRING(64),
      },
      reserve0: {
        field: 'reserve0',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      reserve1: {
        field: 'reserve1',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      createdDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        field: 'created_date',
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['pair_name'],
        },
      ],
    },
  );
}
