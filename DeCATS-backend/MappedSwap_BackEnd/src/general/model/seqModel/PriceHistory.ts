import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import PriceHistory from '../dbModel/PriceHistory';
import * as SeqModel from './0_index';
export default PriceHistory;

export interface PriceHistoryModel extends Model<PriceHistory>, PriceHistory {}
export type PriceHistoryStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): PriceHistoryModel;
};
export function PriceHistoryFactory(sequelize: Sequelize) {
  return <PriceHistoryStatic>sequelize.define(
    SeqModel.name.PriceHistory,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
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
      status: {
        field: 'status',
        allowNull: false,
        defaultValue: 0,
        type: DataTypes.SMALLINT,
      },
      open: {
        field: 'open',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      close: {
        field: 'close',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      low: {
        field: 'low',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      high: {
        field: 'high',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      volume: {
        field: 'volume',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      interval: {
        field: 'interval',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          fields: [
            'pair_name',
            'interval',
            { name: 'created_date', order: 'DESC' },
          ],
        },
      ],
    },
  );
}
