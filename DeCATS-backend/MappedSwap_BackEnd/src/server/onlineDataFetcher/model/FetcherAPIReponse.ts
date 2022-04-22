export interface FetcherAPIReponseBinance {
  price: string;
  symbol: 'BTCUSDT' | 'ETHUSDT';
}

export interface FetcherAPIReponseCoinbase {
  amount: string;
  base: 'BTC' | 'ETH';
  currency: 'USD';
}
