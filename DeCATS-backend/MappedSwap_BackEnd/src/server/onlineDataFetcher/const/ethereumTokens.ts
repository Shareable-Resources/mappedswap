import { Price, Token } from '@uniswap/sdk-core';
import globalVar from './globalVar';
const USDC = new Token(
  1,
  globalVar.ethereumConfig.smartcontract.UniSwap.ERC20USDC,
  6,
  'USDC',
  'USDC',
);
const WETH = new Token(
  1,
  globalVar.ethereumConfig.smartcontract.UniSwap.ERC20WETH,
  18,
  'WETH',
  'WETH',
);

const WBTC = new Token(
  1,
  globalVar.ethereumConfig.smartcontract.UniSwap.ERC20WBTC,
  8,
  'WBTC',
  'WBTC',
);

export { USDC, WETH, WBTC };
