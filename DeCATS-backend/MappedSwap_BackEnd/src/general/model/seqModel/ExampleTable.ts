import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import ExampleTable from '../dbModel/ExampleTable';
import * as SeqModel from './0_index';
export default ExampleTable;

export interface ExampleTableModel extends Model<ExampleTable>, ExampleTable {}
export type ExampleTableStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): ExampleTableModel;
};
export function ExampleTableFactory(sequelize: Sequelize) {
  return <ExampleTableStatic>sequelize.define(
    SeqModel.name.ExampleTable,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      name: {
        field: 'name',
        allowNull: false,
        type: DataTypes.STRING(64),
      },
      nameAbbr: {
        field: 'name_abbr',
        allowNull: false,
        type: DataTypes.STRING(64),
      },
      type: {
        field: 'type',
        allowNull: false,
        type: DataTypes.SMALLINT,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      comment:
        'This is a table for create table example only, please check ./doc/2_CreatingTable.md for more information',
    },
  );
}
