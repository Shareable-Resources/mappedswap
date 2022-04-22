import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import CronJob from '../dbModel/CronJob';
import * as SeqModel from './0_index';
export default CronJob;

export interface CronJobModel extends Model<CronJob>, CronJob {}
export type CronJobStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): CronJobModel;
};
export function CronJobFactory(sequelize: Sequelize) {
  return <CronJobStatic>sequelize.define(
    SeqModel.name.CronJob,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      desc: {
        field: 'desc',
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      type: {
        field: 'type',
        allowNull: true,
        type: DataTypes.SMALLINT,
      },
      status: {
        field: 'status',
        allowNull: true,
        type: DataTypes.SMALLINT,
      },
      extra: {
        field: 'extra',
        allowNull: true,
        type: DataTypes.STRING,
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
      mstToUSDMExchangeRate: {
        field: 'mst_to_usdm_exchange_rate',
        allowNull: true,
        type: DataTypes.DECIMAL,
        comment: 'The exchange rate of mst to usdm',
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
      lastModifiedById: {
        field: 'last_modified_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
    },
  );
}
