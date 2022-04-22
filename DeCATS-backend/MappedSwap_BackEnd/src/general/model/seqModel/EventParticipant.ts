/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import EventParticipant from '../dbModel/EventParticipant';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default EventParticipant;

export interface EventParticipantModel
  extends Model<EventParticipant>,
    EventParticipant {}
export type EventParticipantStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): EventParticipantModel;
};
export function EventParticipantFactory(sequelize: Sequelize) {
  return <EventParticipantStatic>sequelize.define(
    SeqModel.name.EventParticipant,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      eventId: {
        field: 'event_id',
        allowNull: false,
        type: DataTypes.BIGINT,
        comment: 'Event id',
      },
      approvalId: {
        field: 'approval_id',
        allowNull: false,
        type: DataTypes.BIGINT,
        comment: 'Approval id',
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Created Date',
      },
      address: {
        field: 'address',
        allowNull: false,
        type: DataTypes.STRING(64),
        comment: 'Wallet address',
      },
      amt: {
        field: 'amt',
        allowNull: true,
        type: DataTypes.DECIMAL,
        comment: 'Amount of distribution',
      },
      txHash: {
        field: 'tx_hash',
        allowNull: false,
        type: DataTypes.STRING(255),
        comment: 'Transaction Hash from contract call',
      },
      status: {
        field: 'status',
        allowNull: false,
        type: DataTypes.SMALLINT,
        comment: '0 (pending), 1(disted)',
      },
      distedDate: {
        field: 'disted_date',
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Distribute Date',
      },
      distedById: {
        field: 'disted_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
        comment: 'Distributed by which agent',
      },
      lastModifiedDate: {
        field: 'last_modified_date',
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Last Modified Date',
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['event_id', 'approval_id', 'address'],
        },
      ],
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
    },
  );
}
