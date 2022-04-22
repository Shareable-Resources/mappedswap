export const avaliableTimeInterval = [60, 300, 1800, 3600, 86400];

export interface PriceHistoryTimeInterval {
  timeIntervalOper: 'minute' | 'day';
  timeInterval: number;
}
