import { Token } from '@uniswap/sdk-core';
export default class PoolUniSwap {
  token1: Token;
  token2: Token;
  poolAddr: string;
  constructor(token1: Token, token2: Token) {
    this.token1 = token1;
    this.token2 = token2;
    this.poolAddr = '';
  }
}
