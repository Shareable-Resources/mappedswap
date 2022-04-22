import { Mixed } from '../../../foundation/types/Mixed';

export default interface KLineDataVolumeSum {
  sumOfVolume: Mixed;
  duration: string;
  pairName: string;
  dateFrom: Date | string;
  dateTo: Date | string;
}
