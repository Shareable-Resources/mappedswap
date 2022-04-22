export default interface GetPairInfo {
  blockTimestampLast: string;
  enabled: boolean;
  pairAddr: string;
  price0CumulativeLast: string;
  price1CumulativeLast: string;
  reserve0: string;
  reserve1: string;
  token0Addr: string;
  token0Name: string;
  token1Addr: string;
  token1Name: string;
}
