/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import ProfitDailyReport from '../dbModel/ProfitDailyReport';
import * as SeqModel from './0_index';
export default ProfitDailyReport;
export interface ProfitDailyReportModel
  extends Model<ProfitDailyReport>,
    ProfitDailyReport {}
export type ProfitDailyReportStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): ProfitDailyReportModel;
};

export function ProfitDailyReportFactory(sequelize: Sequelize) {
  return <ProfitDailyReportStatic>sequelize.define(
    SeqModel.name.ProfitDailyReport,
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
        comment: 'token name (M Token)',
        type: DataTypes.STRING(64),
      },
      rajReserveEnd: {
        field: 'raj_reserve_end',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'Rajswap contract amount from last date',
      },
      rajReserveStart: {
        field: 'raj_reserve_start',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'Rajswap contract amount from current date',
      },
      rajReserveAmtChange: {
        field: 'raj_reserve_amt_change',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'rajReserveEnd-rajReserveStart',
      },

      poolStart: {
        field: 'pool_start',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'Pool contract amount from last date',
      },
      poolEnd: {
        field: 'pool_end',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'Pool contract amount from current date',
      },
      poolAmtChange: {
        field: 'pool_amt_change',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'poolEnd-poolStart',
      },
      poolDepositStart: {
        field: 'pool_deposit_start',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'yesterday t_decats_balance_snapshot all positive balance',
      },
      poolDepositEnd: {
        field: 'pool_deposit_end',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'current day t_decats_balance_snapshot all positive balance',
      },
      poolDebitStart: {
        field: 'pool_debit_start',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'yesterday t_decats_balance_snapshot all negative balance',
      },
      poolDebitEnd: {
        field: 'pool_debit_end',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'current day t_decats_balance_snapshot all negative balance',
      },
      balanceStart: {
        field: 'balance_start',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'current day balance',
      },
      balanceEnd: {
        field: 'balance_end',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'yesterday day balace',
      },
      balanceChange: {
        field: 'balance_change',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'balance_start-balance_end',
      },
      botBalanceStart: {
        field: 'bot_balance_start',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'yesterday day bot balace',
      },
      botBalanceEnd: {
        field: 'bot_balance_end',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'current day bot balance',
      },
      botSellAmt: {
        field: 'bot_sell_amt',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'sum of sell amount of t_decats_transaction of bot',
      },
      sellAmt: {
        field: 'sell_amt',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'sum of sell amount of t_decats_transaction',
      },
      interest: {
        field: 'interest',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'sum of interest of t_decats_interest_histories',
      },
      unrealizedInterest: {
        field: 'unrealized_interest',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment:
          'The sum of unrealized_interest from t_decats_balance_snapshots',
      },
      depositAmt: {
        field: 'deposit_amt',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'Deposit amount is from database table',
      },
      withdrawAmt: {
        field: 'withdraw_amt',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'Withdraw amount is from database table',
      },
      netCashIn: {
        field: 'net_cash_in',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'depositAmt-withdrawAmt or pollAmtChange+reserveAmtChange',
      },
      customerProfit: {
        field: 'customer_profit',
        allowNull: false,
        type: DataTypes.DECIMAL(78, 0),
        comment: 'balanceChange-netCashIn',
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
