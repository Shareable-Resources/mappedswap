import { Mixed } from '../../../foundation/types/Mixed';

export interface BalanceInUSDM {
  id: string;
  address: string;
  updateTime: Date;
  name: string | null;
  token: string;
  sumOfIncome: Mixed;
  usdmValue: Mixed;
}
