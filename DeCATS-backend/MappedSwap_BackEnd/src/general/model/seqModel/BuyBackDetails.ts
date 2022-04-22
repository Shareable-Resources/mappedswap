import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import BuyBackDetails from '../dbModel/BuyBackDetails';
import * as SeqModel from './0_index';
export default BuyBackDetails;

export interface BuyBackDetailsModel
  extends Model<BuyBackDetails>,
    BuyBackDetails {}
export type BuyBackDetailsStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): BuyBackDetailsModel;
};
export function BuyBackDetailsFactory(sequelize: Sequelize) {
  return <BuyBackDetailsStatic>sequelize.define(
    SeqModel.name.BuyBackDetails,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
        comment: 'id (autoIncrement)',
      },
      txHash: {
        field: 'tx_hash',
        allowNull: false,
        type: DataTypes.STRING,
      },
      mstAmount: {
        field: 'mst_amount',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      usdPrice: {
        field: 'usd_pirce',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
      },
      createdById: {
        field: 'created_by_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      lastModifiedDate: {
        field: 'last_modified_date',
        allowNull: true,
        type: DataTypes.DATE,
      },
      lastModifiedById: {
        field: 'last_modified_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
        comment: 'who last modify this job',
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
          fields: ['id'],
        },
      ],
    },
  );
}
