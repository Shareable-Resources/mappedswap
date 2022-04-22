/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import Event from '../dbModel/Event';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default Event;

export interface EventModel extends Model<Event>, Event {}
export type EventStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): EventModel;
};
export function EventFactory(sequelize: Sequelize) {
  return <EventStatic>sequelize.define(
    SeqModel.name.Event,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      code: {
        field: 'code',
        allowNull: true,
        unique: true,
        type: DataTypes.STRING(10),
        comment: 'Event code',
      },
      name: {
        field: 'name',
        allowNull: true,
        type: DataTypes.STRING(64),
        comment: 'Name of the event',
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Created Date',
      },
      createdById: {
        field: 'created_by_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      lastModifiedById: {
        field: 'last_modified_by_id',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      lastModifiedDate: {
        field: 'last_modified_date',
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Last Modified Date',
      },
      status: {
        field: 'status',
        allowNull: false,
        type: DataTypes.SMALLINT,
        comment: '0 (Inactive), 1 (Active)',
      },
      budget: {
        field: 'budget',
        allowNull: true,
        type: DataTypes.DECIMAL,
        comment: 'Budget of the event',
      },
      quota: {
        field: 'quota',
        allowNull: true,
        type: DataTypes.DECIMAL,
        comment: 'No of participants that can join the event',
      },
      token: {
        field: 'token',
        allowNull: false,
        type: DataTypes.STRING(64),
        comment: 'Token name',
      },
      distType: {
        field: 'dist_type',
        allowNull: false,
        type: DataTypes.SMALLINT,
        comment: '0 (M Token), 1 (MST Token)',
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
    },
  );
}
export function EventAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
  //CommissionLedger.id
  //CommissionLedgerCreditUpdate.CommissionLedger_id

  m[SeqModel.name.Event].hasMany(m[SeqModel.name.EventParticipant], {
    as: 'participants',
    foreignKey: {
      name: 'eventId',
      field: 'event_id',
    },
  });
  m[SeqModel.name.EventParticipant].belongsTo(m[SeqModel.name.Event], {
    as: 'event',
    foreignKey: {
      name: 'eventId',
      field: 'event_id',
    },
    targetKey: 'id',
  });

  m[SeqModel.name.Event].hasMany(m[SeqModel.name.EventApproval], {
    as: 'approvals',
    foreignKey: {
      name: 'eventId',
      field: 'event_id',
    },
  });
  m[SeqModel.name.EventApproval].belongsTo(m[SeqModel.name.Event], {
    as: 'event',
    foreignKey: {
      name: 'eventId',
      field: 'event_id',
    },
    targetKey: 'id',
  });
}
