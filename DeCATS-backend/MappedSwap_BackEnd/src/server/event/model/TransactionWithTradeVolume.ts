import { Mixed } from '../../../foundation/types/Mixed';
import { Transaction } from '../../../general/model/dbModel/0_index';

export default class TransactionWithTrade extends Transaction {
  tradeVolume: Mixed;
  constructor() {
    super();
    this.tradeVolume = '';
  }
}
