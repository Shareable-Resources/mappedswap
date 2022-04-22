import { Mixed } from '../../../foundation/types/Mixed';

export default class LeaderBoardRule {
  id: Mixed | null;
  rank: number;
  percentageOfPrice: number;
  constructor() {
    this.id = null;
    this.rank = 0;
    this.percentageOfPrice = 0;
  }
}
