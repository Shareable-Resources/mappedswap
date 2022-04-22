export default class EthereumConfig {
  comment: string;
  rpcHostHttp: string;
  rpcHost: string;
  chainId: number;
  smartcontract: {
    UniSwap: {
      ERC20USDC: string;
      ERC20WETH: string;
      ERC20WBTC: string;
      UniswapV3Factory: string;
      UniswapV3Pool: string;
    };
  };

  constructor() {
    this.comment = '';
    this.rpcHostHttp = '';
    this.rpcHost = '';
    this.chainId = 0;
    this.smartcontract = {
      UniSwap: {
        ERC20USDC: '',
        ERC20WETH: '',
        ERC20WBTC: '',
        UniswapV3Factory: '',
        UniswapV3Pool: '',
      },
    };
  }
}
