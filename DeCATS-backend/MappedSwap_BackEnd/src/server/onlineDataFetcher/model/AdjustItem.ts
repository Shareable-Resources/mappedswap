import Big from 'big.js';
import BN from 'bn.js';
import { Mixed } from '../../../foundation/types/Mixed';
import PriceHistoryRef from '../../../general/model/dbModel/PriceHistoryRef';
import { FetcherType } from '../const/allFetchers';
export default interface AdjustItem {
  tokenName: string;
  tokenAddr: string;
  targetPrice: Mixed;
  decimals: Mixed;
}

export class AdjustItemWithPriceHistoryRef implements AdjustItem {
  tokenName: string;
  tokenAddr: string;
  targetPrice: Mixed;
  decimals: Mixed;
  priceHistoryRef: PriceHistoryRef;
  constructor() {
    this.tokenName = '';
    this.tokenAddr = '';
    this.targetPrice = 0;
    this.decimals = 0;
    this.priceHistoryRef = new PriceHistoryRef();
  }
}

export function convertAdjustItemToPriceHistoryRef(
  price: AdjustItemWithPriceHistoryRef,
  createdDate: Date,
) {
  const priceHistoryRef = price.priceHistoryRef
    ? price.priceHistoryRef
    : new PriceHistoryRef();
  priceHistoryRef.createdDate = createdDate;
  priceHistoryRef.price = new Big(price.targetPrice)
    .div(10 ** Number(price.decimals))
    .toString();
  priceHistoryRef.tokenTo = price.tokenName;
  priceHistoryRef.tokenFrom = 'USDM';
  return priceHistoryRef;
}
