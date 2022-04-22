/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import WithdrawLedger from '../DBModel/WithdrawLedger';
import * as SeqModel from './0_index';
export default WithdrawLedger;
export interface WithdrawLedgerModel
  extends Model<WithdrawLedger>,
    WithdrawLedger {}
export type WithdrawLedgerStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): WithdrawLedgerModel;
};
export function WithdrawLedgerFactory(sequelize: Sequelize) {
  return <WithdrawLedgerStatic>sequelize.define(
    SeqModel.name.WithdrawLedgers,
    {
      txHash: {
        field: 'tx_hash',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(255),
      },
      reqId: {
        field: 'req_id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      fromWalletAddr: {
        field: 'from_asset_id',
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      fromTokenAmt: {
        field: 'from_token_amt',
        allowNull: false,
        type: DataTypes.DECIMAL(78),
      },
      toWalletAddr: {
        field: 'to_wallet_addr',
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      toAssetId: {
        field: 'to_asset_id',
        allowNull: false,
        type: DataTypes.STRING(20),
      },
      toAssetAddr: {
        field: 'toAssetAddr',
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      rate: {
        field: 'rate',
        allowNull: false,
        type: DataTypes.DECIMAL(78),
      },
      createdDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_date',
      },
      lastModifiedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'last_modified_date',
      },
      status: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        field: 'status',
      },
      gasFee: {
        type: DataTypes.DECIMAL(78),
        allowNull: false,
        field: 'gas_fee',
      },
      gasUsed: {
        type: DataTypes.DECIMAL(78),
        allowNull: false,
        field: 'gas_used',
      },
      remarks: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: 'remarks',
      },
    },
    {
      freezeTableName: true,
      updatedAt: false,
      createdAt: false,
    },
  );
}
