/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import EventApproval from '../dbModel/EventApproval';
import * as SeqModel from './0_index';
export default EventApproval;

export interface EventApprovalModel
  extends Model<EventApproval>,
    EventApproval {}
export type EventApprovalStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): EventApprovalModel;
};
export function EventApprovalFactory(sequelize: Sequelize) {
  return <EventApprovalStatic>sequelize.define(
    SeqModel.name.EventApproval,
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
      amt: {
        field: 'amt',
        allowNull: false,
        type: DataTypes.DECIMAL,
        comment: 'Approved Allowance',
      },
      txHash: {
        field: 'tx_hash',
        allowNull: true,
        type: DataTypes.STRING(255),
        comment: 'Transaction Hash from contract call',
      },
      status: {
        field: 'status',
        allowNull: false,
        type: DataTypes.SMALLINT,
        comment: '0 (Pending), 1 (Approved), 2 (Disted)',
      },
      approvedById: {
        field: 'approved_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
        comment: 'Approved by who from front end approval',
      },
      approvedDate: {
        field: 'approved_date',
        allowNull: true,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Approved date from front end approval',
      },
      roundId: {
        field: 'round_id',
        allowNull: true,
        type: DataTypes.BIGINT,
        comment: 'Round id from front end approval',
        unique: true,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
    },
  );
}
