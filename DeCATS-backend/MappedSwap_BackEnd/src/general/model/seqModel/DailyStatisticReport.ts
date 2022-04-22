/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import DailyStatisticReport from '../dbModel/DailyStatisticReport';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default DailyStatisticReport;

export interface DailyStatisticReportModel
  extends Model<DailyStatisticReport>,
    DailyStatisticReport {}
export type DailyStatisticReportStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): DailyStatisticReportModel;
};
export function DailyStatisticReportFactory(sequelize: Sequelize) {
  return <DailyStatisticReportStatic>sequelize.define(
    SeqModel.name.DailyStatisticReport,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      noOfActiveAddresses: {
        field: 'no_of_active_addresses',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
        comment:
          'The number of distinct active addresses (addresses from t_decats_balance_histories + t_decats_interest_histories)',
      },
      noOfConnectedWallets: {
        field: 'no_of_connected_wallets',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
        comment:
          'The number of distinct connected wallets (addresses from t_decats_wallet_connections)',
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

export function DailyStatisticReportAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
}
