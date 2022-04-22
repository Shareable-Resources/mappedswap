import { Mixed } from '../../../foundation/types/Mixed';

export default class PriceHistoryRef {
  tokenFrom: string;
  tokenTo: string;
  price: Mixed;
  createdDate: Date | null;
  sourceFrom: string;
  remark: string | null;
  constructor() {
    this.tokenFrom = '';
    this.tokenTo = '';
    this.price = '';
    this.createdDate = null;
    this.sourceFrom = '';
    this.remark = null;
  }
}
