import BN from 'bn.js';

export default interface AdjustItem {
  tokenName: string;
  tokenAddr: string;
  targetPrice: string | number | BN;
  decimals: string | number | BN;
}
