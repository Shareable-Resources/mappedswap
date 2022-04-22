/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import TransferEunRewards, {
  ENUM_TRANSFER_STATUS,
} from '../dbModel/TransferEunRewards';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default TransferEunRewards;

export interface TransferEunRewardsModel
  extends Model<TransferEunRewards>,
    TransferEunRewards {}
export type TransferEunRewardsStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): TransferEunRewardsModel;
};
export function TransferEunRewardsFactory(sequelize: Sequelize) {
  return <TransferEunRewardsStatic>sequelize.define(
    SeqModel.name.TransferEunRewards,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      address: {
        field: 'address',
        allowNull: false,
        type: DataTypes.STRING(50),
      },
      amount: {
        field: 'amount',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      transferStatus: {
        field: 'transfer_status',
        allowNull: false,
        type: DataTypes.SMALLINT,
        defaultValue: ENUM_TRANSFER_STATUS.PENDING,
      },
      transferTxHash: {
        field: 'transfer_tx_hash',
        allowNull: true,
        type: DataTypes.STRING(80),
      },
      errMsg: {
        field: 'err_msg',
        allowNull: true,
        type: DataTypes.TEXT,
      },
      resend: {
        field: 'resend',
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      resendTransferId: {
        field: 'resend_transfer_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      createTime: {
        field: 'create_time',
        allowNull: true,
        type: DataTypes.DATE,
      },
      updateTime: {
        field: 'update_time',
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['address'],
        },
        {
          fields: ['resend', { name: 'id', order: 'ASC' }],
        },
      ],
    },
  );
}
