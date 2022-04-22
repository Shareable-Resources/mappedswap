/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import ConnectedWallet from '../dbModel/ConnectedWallet';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default ConnectedWallet;

export interface ConnectedWalletModel
  extends Model<ConnectedWallet>,
    ConnectedWallet {}
export type ConnectedWalletStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): ConnectedWalletModel;
};
export function ConnectedWalletFactory(sequelize: Sequelize) {
  return <ConnectedWalletStatic>sequelize.define(
    SeqModel.name.ConnectedWallet,
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
        comment: 'Wallet address',
      },
      connectedType: {
        field: 'connected_type',
        type: DataTypes.SMALLINT,
        allowNull: false,
        comment: 'Connect Type (0:Customer, 1:Agent)',
      },
      createdDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_date',
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [],
    },
  );
}

export function ConnectedWalletAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
  //Customer.agentId
}
