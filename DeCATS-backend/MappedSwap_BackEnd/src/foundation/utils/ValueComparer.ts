import Big from 'big.js';
import { Mixed } from '../types/Mixed';

interface InRange {
  lower: string;
  upper: string;
  inRange: boolean;
}
interface InRangeWithAvgPrice {
  lower: string;
  upper: string;
  inRange: boolean;
  avgPrice: string;
}

export default class ValueComparer {
  /**
   * Percentage difference = Absolute difference / Average x 100
   * If any number in the array exceeds or lower than the upperLimitByPercent or lowerLimitByPercent respectively
   * @param arrOfNumbers array of numbers (i.e. [21313,23232,34353])
   * @param percentage max and min. difference percentage (i.e. if 3%, then pass 3 as arg)
   */
  public static diffBetweenValuesIsWithin(
    arrOfNo: string[] | number[],
    percentage: number,
  ): InRangeWithAvgPrice {
    let sumOfNo = new Big(0).toString();
    for (const element of arrOfNo) {
      sumOfNo = new Big(sumOfNo).plus(new Big(element.toString())).toString();
    }
    const avgPrice = new Big(sumOfNo).div(arrOfNo.length).toFixed(0).toString();
    const upperLimitByPercent = new Big(avgPrice)
      .mul(new Big(1 + percentage / 100))
      .toString();
    const lowerLimitByPercent = new Big(avgPrice)
      .mul(new Big(1 - percentage / 100))
      .toString();
    for (const element of arrOfNo) {
      if (
        new Big(element).lt(lowerLimitByPercent) ||
        new Big(element).gt(upperLimitByPercent)
      ) {
        return {
          inRange: false,
          upper: upperLimitByPercent,
          lower: lowerLimitByPercent,
          avgPrice: avgPrice,
        };
      }
    }
    return {
      inRange: true,
      upper: upperLimitByPercent,
      lower: lowerLimitByPercent,
      avgPrice: avgPrice,
    };
  }

  public static isOutOfBoundary(
    mainPrice: Mixed,
    refPrice: Mixed,
    percentage: number,
  ) {
    const mainPriceUpperLimit = new Big(mainPrice)
      .mul(new Big(1 + percentage / 100))
      .toString();
    const mainPriceLowerLimit = new Big(mainPrice)
      .mul(new Big(1 - percentage / 100))
      .toString();
    if (
      new Big(refPrice).gte(mainPriceLowerLimit) &&
      new Big(refPrice).lte(mainPriceUpperLimit)
    ) {
      return {
        inRange: true,
        upper: mainPriceUpperLimit,
        lower: mainPriceLowerLimit,
      };
    } else {
      return {
        inRange: false,
        upper: mainPriceUpperLimit,
        lower: mainPriceLowerLimit,
      };
    }
  }
}
