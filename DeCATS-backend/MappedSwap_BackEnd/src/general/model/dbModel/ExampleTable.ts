import { Mixed } from '../../../foundation/types/Mixed';

export enum ExampleTableType {
  Active = 0,
  Inactive = 1,
}

export default class TempTable {
  id: Mixed | null;
  name: string;
  nameAbbr: string;
  type: ExampleTableType;

  constructor() {
    this.id = null;
    this.name = '';
    this.nameAbbr = '';
    this.type = ExampleTableType.Active;
  }
}
