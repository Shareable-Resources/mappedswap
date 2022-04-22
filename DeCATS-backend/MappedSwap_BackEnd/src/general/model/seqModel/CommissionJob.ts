/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type } from 'os';
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import CommissionJob from '../dbModel/CommissionJob';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default CommissionJob;

export interface CommissionJobModel
  extends Model<CommissionJob>,
    CommissionJob {}
export type CommissionJobStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): CommissionJobModel;
};
export function CommissionJobFactory(sequelize: Sequelize) {
  return <CommissionJobStatic>sequelize.define(
    SeqModel.name.CommissionJob,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
        comment: 'id (autoIncrement)',
      },
      dateFrom: {
        field: 'date_from',
        allowNull: false,
        type: DataTypes.DATEONLY,
        comment: '[date_from] of t_decats_agent_daily_reports.create_date',
      },
      dateTo: {
        field: 'date_to',
        allowNull: false,
        type: DataTypes.DATEONLY,
        comment: '[date_to] of t_decats_agent_daily_reports.create_date',
      },
      approvedById: {
        field: 'approved_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
        comment: 'who approve this job',
      },
      approvedDate: {
        field: 'approved_date',
        allowNull: true,
        type: DataTypes.DATE,
        comment: 'approve date',
      },
      lastModifiedById: {
        field: 'last_modified_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
        comment: 'who last modify this job',
      },
      lastModifiedDate: {
        field: 'last_modified_date',
        allowNull: true,
        type: DataTypes.DATE,
        comment: 'last modify date',
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
        comment: 'the time creating this job',
      },
      status: {
        field: 'status',
        allowNull: false,
        type: DataTypes.SMALLINT,
        comment:
          'Created = 0,Fail = 10,Verified = 20,NotVerified = 21,Approved = 30,NotApproved = 31',
      },
      cronJobId: {
        field: 'cron_job_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      roundId: {
        field: 'round_id',
        allowNull: true,
        type: DataTypes.BIGINT,
        comment: 'Round id is generated from smart contract',
      },
      remark: {
        field: 'remark',
        allowNull: false,
        type: DataTypes.STRING,
        comment: 'remark',
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['date_from', 'date_to'],
        },
      ],
    },
  );
}

export function CommissionJobAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;

  m[SeqModel.name.CronJob].hasOne(m[SeqModel.name.CommissionJob], {
    as: 'commissionJob',
    foreignKey: {
      name: 'cronJobId',
      field: 'cron_job_id',
    },
  });
  m[SeqModel.name.CommissionJob].belongsTo(m[SeqModel.name.CronJob], {
    as: 'cronJob',
    foreignKey: {},
    targetKey: 'id',
  });

  m[SeqModel.name.CommissionJob].hasMany(m[SeqModel.name.CommissionLedger], {
    as: 'ledgers',
    foreignKey: {
      name: 'jobId',
      field: 'job_id',
    },
  });
  m[SeqModel.name.CommissionLedger].belongsTo(m[SeqModel.name.CommissionJob], {
    as: 'job',
    foreignKey: {
      name: 'jobId',
      field: 'job_id',
    },
    targetKey: 'id',
  });

  m[SeqModel.name.CommissionJob].hasMany(m[SeqModel.name.CommissionSummary], {
    as: 'summaries',
    foreignKey: {
      name: 'jobId',
      field: 'job_id',
    },
  });
  m[SeqModel.name.CommissionSummary].belongsTo(m[SeqModel.name.CommissionJob], {
    as: 'job',
    foreignKey: {
      name: 'jobId',
      field: 'job_id',
    },
    targetKey: 'id',
  });

  m[SeqModel.name.CommissionJob].hasMany(
    m[SeqModel.name.CommissionDistribution],
    {
      as: 'distributions',
      foreignKey: {
        name: 'jobId',
        field: 'job_id',
      },
    },
  );
  m[SeqModel.name.CommissionDistribution].belongsTo(
    m[SeqModel.name.CommissionJob],
    {
      as: 'job',
      foreignKey: {
        name: 'jobId',
        field: 'job_id',
      },
      targetKey: 'id',
    },
  );
}
