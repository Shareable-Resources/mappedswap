import { UniswapV3Pool } from '../smartcontract/v3-core-main/types/web3-v1-contracts/UniswapV3Pool';
import PoolUniSwap from './PoolUniSwap';

export default interface ContractUniSwapPool {
  poolUniSwap: PoolUniSwap;
  contract: UniswapV3Pool;
}
