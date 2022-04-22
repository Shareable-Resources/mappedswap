import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import BlockPrices from '../dbModel/BlockPrices';
import * as SeqModel from './0_index';
export default BlockPrices;

export interface BlockPricesModel extends Model<BlockPrices>, BlockPrices {}
export type BlockPricesStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): BlockPricesModel;
};
export function BlockPricesFactory(sequelize: Sequelize) {
  return <BlockPricesStatic>sequelize.define(
    SeqModel.name.BlockPrices,
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
      blockNo: {
        field: 'block_no',
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
          fields: ['pair_name', { name: 'created_date', order: 'DESC' }],
        },
      ],
    },
  );
}
