/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import EventTradeVolume from '../dbModel/EventTradeVolume';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default EventTradeVolume;

export interface EventTradeVolumeModel
  extends Model<EventTradeVolume>,
    EventTradeVolume {}
export type EventTradeVolumeStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): EventTradeVolumeModel;
};
export function EventTradeVolumeFactory(sequelize: Sequelize) {
  return <EventTradeVolumeStatic>sequelize.define(
    SeqModel.name.EventTradeVolume,
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
        comment: 'Customer id',
      },
      address: {
        field: 'address',
        allowNull: false,
        type: DataTypes.STRING(50),
        comment: 'address',
      },
      amt: {
        field: 'amt',
        allowNull: false,
        type: DataTypes.DECIMAL,
        comment: 'amount of trade volume till now',
      },
      acheivedDate: {
        field: 'acheived_date',
        allowNull: true,
        type: DataTypes.DATE,
        comment: 'acheived_date',
      },
      firstTxDate: {
        field: 'first_tx_date',
        allowNull: false,
        type: DataTypes.DATE,
        comment: 'First tx date',
      },
      lastTxDate: {
        field: 'last_tx_date',
        allowNull: false,
        type: DataTypes.DATE,
        comment: 'Last Tx date',
      },
      lastScannedId: {
        field: 'last_scanned_id',
        allowNull: false,
        type: DataTypes.BIGINT,
        comment: 'Last scanned id from t_decats_transactions',
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['customer_id'],
        },
      ],
    },
  );
}
