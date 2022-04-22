/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type } from 'os';
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import MstPrice from '../dbModel/MstPrice';
import * as SeqModel from './0_index';
import { ModelCtors } from './0_index';
export default MstPrice;

export interface MstPriceModel extends Model<MstPrice>, MstPrice {}
export type MstPriceStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): MstPriceModel;
};
export function MstPriceFactory(sequelize: Sequelize) {
  return <MstPriceStatic>sequelize.define(
    SeqModel.name.MstPrice,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
        comment: 'id (autoIncrement)',
      },
      mstPrice: {
        field: 'mst_price',
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      createdDate: {
        field: 'created_date',
        allowNull: false,
        type: DataTypes.DATE,
      },
      createdById: {
        field: 'created_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      lastModifiedDate: {
        field: 'last_modified_date',
        allowNull: true,
        type: DataTypes.DATE,
      },
      lastModifiedById: {
        field: 'last_modified_by_id',
        allowNull: true,
        type: DataTypes.BIGINT,
        comment: 'who last modify this job',
      },
      status: {
        field: 'status',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['id'],
        },
      ],
    },
  );
}

export function MstPriceAssociation(sequelize: any) {
  const m: ModelCtors = sequelize.models;
}
