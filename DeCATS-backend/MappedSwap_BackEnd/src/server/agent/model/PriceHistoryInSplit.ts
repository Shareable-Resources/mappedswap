import { Mixed } from '../../../foundation/types/Mixed';

import { PriceHistoryStatus } from '../../../general/model/dbModel/PriceHistory';
export interface PriceHistoryInSplit {
  id: Mixed | null;
  pairName: string;
  from: string;
  to: string;
  close: Mixed;
  reserve0: Mixed;
  reserve1: Mixed;
  createdDate: Date;
  status: PriceHistoryStatus;
}
