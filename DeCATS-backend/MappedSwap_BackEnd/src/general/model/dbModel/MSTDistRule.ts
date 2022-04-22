import { Mixed } from '../../../foundation/types/Mixed';

export default class MSTDistRule {
  id: Mixed | null;
  grade: number;
  weekAmount: Mixed;
  holdMST: Mixed;
  commissionRate: number;
  distMTokenRate: number;
  distMSTTokenRate: number;
  createdDate: Date;
  constructor() {
    this.id = null;
    this.grade = 0;
    this.weekAmount = 0;
    this.holdMST = 0;
    this.commissionRate = 0;
    this.distMTokenRate = 0;
    this.distMSTTokenRate = 0;
    this.createdDate = new Date();
  }
}
