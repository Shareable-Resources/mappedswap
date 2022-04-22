import { Mixed } from '../../../foundation/types/Mixed';

export default class LeaderBoardRanking {
  id: Mixed | null;
  customerId: Mixed;
  netCastInUSDM: Mixed;
  profitAndLoss: Mixed;
  ruleId: Mixed;
  constructor() {
    this.id = null;
    this.customerId = 0;
    this.netCastInUSDM = 0;
    this.profitAndLoss = 0;
    this.ruleId = 0;
  }
}
