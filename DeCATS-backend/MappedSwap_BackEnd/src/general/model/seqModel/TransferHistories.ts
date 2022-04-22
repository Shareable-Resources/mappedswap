/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import { ENUM_TRANSFER_STATUS } from '../dbModel/TransferEunRewards';
import TransferHistories from '../dbModel/TransferHistories';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default TransferHistories;

export interface TransferHistoriesModel
  extends Model<TransferHistories>,
    TransferHistories {}
export type TransferHistoriesStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): TransferHistoriesModel;
};
export function TransferHistoriesFactory(sequelize: Sequelize) {
  return <TransferHistoriesStatic>sequelize.define(
    SeqModel.name.TransferHistories,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      seqNo: {
        field: 'seq_no',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      amount: {
        field: 'amount',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      blockHash: {
        field: 'block_hash',
        allowNull: false,
        type: DataTypes.STRING(80),
      },
      blockNo: {
        field: 'block_no',
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      confirmStatus: {
        field: 'confirm_status',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
      networkCode: {
        field: 'network_code',
        allowNull: false,
        type: DataTypes.STRING(50),
      },
      onchainStatus: {
        field: 'onchain_status',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
      symbol: {
        field: 'symbol',
        allowNull: false,
        type: DataTypes.STRING(10),
      },
      tag: {
        field: 'tag',
        allowNull: false,
        type: DataTypes.STRING(50),
      },
      txHash: {
        field: 'tx_hash',
        allowNull: false,
        type: DataTypes.STRING(80),
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
          fields: ['seq_no'],
        },
        {
          fields: ['resend', { name: 'id', order: 'ASC' }],
        },
      ],
    },
  );
}
