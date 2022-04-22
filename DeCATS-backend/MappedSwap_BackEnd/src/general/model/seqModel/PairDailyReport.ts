/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import PairDailyReport from '../dbModel/PairDailyReport';
import * as SeqModel from './0_index';
export default PairDailyReport;
export interface PairDailyReportModel
  extends Model<PairDailyReport>,
    PairDailyReport {}
export type PairDailyReportStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): PairDailyReportModel;
};

export function PairDailyReportFactory(sequelize: Sequelize) {
  return <PairDailyReportStatic>sequelize.define(
    SeqModel.name.PairDailyReport,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      token: {
        field: 'token',
        allowNull: false,
        comment: 'token name (M Token without USDM and MST)',
        type: DataTypes.STRING(64),
      },
      buyAmount: {
        field: 'buy_amount',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
        comment:
          'sell token is usdm, buy token is btcm, and the buyAmt of this pair',
      },
      sellAmount: {
        field: 'sell_amount',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
        comment:
          'sell token is btcm, buy token is usdm, and the sellAmt of this pair',
      },
      usdmBuyAmount: {
        field: 'usdm_buy_amount',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
        comment:
          'sell token is btcm, buy token is usdm, and the buyAmt of this pair',
      },
      usdmSellAmount: {
        field: 'usdm_sell_amount',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
        comment:
          'sell token is usdm, buy token is btcm, and the sellAmt of this pair',
      },
      price: {
        field: 'price',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'price from block_prices',
      },
      dateFrom: {
        field: 'date_from',
        allowNull: true,
        type: DataTypes.DATE,
      },
      dateTo: {
        field: 'date_to',
        allowNull: true,
        type: DataTypes.DATE,
      },

      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
      },
      lastModifiedDate: {
        field: 'last_modified_date',
        allowNull: true,
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
    },
  );
}
