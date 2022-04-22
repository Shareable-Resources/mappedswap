/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import ProfitAndLossReport from '../dbModel/ProfitAndLossReport';
import * as SeqModel from './0_index';
export default ProfitAndLossReport;
export interface ProfitAndLossReportModel
  extends Model<ProfitAndLossReport>,
    ProfitAndLossReport {}
export type ProfitAndLossReportStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): ProfitAndLossReportModel;
};
export function ProfitAndLossReportFactory(sequelize: Sequelize) {
  return <ProfitAndLossReportStatic>sequelize.define(
    SeqModel.name.ProfitAndLossReport,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      customerId: {
        field: 'customer_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      equityStart: {
        field: 'equity_start',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
        comment:
          'sum(convert_to_usd_value(balance - unrealized_interest)) of createdDate - 2 day, convert_to_usd_value is using t_decats_block_price for reference, unrealized_interest is using 23:00:00.000-23:59:59.999 last total_interest of that date',
      },
      equityEnd: {
        field: 'equity_end',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
        comment:
          'sum(convert_to_usd_value(balance - unrealized_interest)) of createdDate - 1 day, convert_to_usd_value is using t_decats_block_price for reference, unrealized_interest is using 23:00:00.000-23:59:59.999 last total_interest of that date',
      },
      netCashInUSDM: {
        field: 'net_cash_in_usdm',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
        comment:
          'net_cash_in_usdm is sum of (t_decats_balance_histories.amount * t_decats_balance_histories.price)',
      },
      profitAndLoss: {
        field: 'profit_and_loss',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'equityEnd - equityStart - netCashInUSDM',
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
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
    },
  );
}
