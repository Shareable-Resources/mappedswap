import { Mixed } from '../../../foundation/types/Mixed';

export default class Token {
  id: Mixed | null;
  name: string;
  address: string;
  decimals: number;

  constructor() {
    this.id = null;
    this.name = '';
    this.address = '';
    this.decimals = 0;
  }
}
