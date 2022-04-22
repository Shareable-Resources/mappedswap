import RajPair from '../../server/cronJob/model/RajPair';

export class ContractDeploy {
  address: string;
  constructor() {
    this.address = '';
  }
}

export default class FoundationConfig {
  comment: string;
  jwt: {
    expires_in: string;
    dapp_expires_in: string;
    TOKEN_KEY: string;
  };
  fundingCode: {
    expires_in: string;
    TOKEN_KEY: string;
  };
  rpcHostHttp: string;
  rpcHostHttpMining: string;
  rpcHost: string;
  rpcHostMining: string;
  chainId: number;
  chainIdMining: number;
  wallet: {
    url: string;
    port: number;
  };
  salt: string;
  smartcontract: {
    MappedSwap: {
      verifierAddress: string;
      privateKey: {
        adjustPrice: string;
        dApp: string;
        agent: string;
        commissionJob: string;
      };
      Multicall: ContractDeploy;
      WrappedEUN: ContractDeploy;
      'OwnedUpgradeableProxy<WEUN>': ContractDeploy;
      MappedSwapToken: ContractDeploy;
      'UpgradeableBeacon<MappedSwapToken>': ContractDeploy;
      'OwnedBeaconProxy<USDM>': ContractDeploy; //decimals: string;
      'OwnedBeaconProxy<BTCM>': ContractDeploy; //decimals: string;
      'OwnedBeaconProxy<ETHM>': ContractDeploy; //decimals: string;
      RaijinSwapFactory: ContractDeploy;
      'OwnedUpgradeableProxy<RaijinSwapFactory>': ContractDeploy;
      RaijinSwapRouter: ContractDeploy;
      'OwnedUpgradeableProxy<RaijinSwapRouter>': ContractDeploy;
      PoolCore: ContractDeploy;
      'OwnedUpgradeableProxy<Pool>': ContractDeploy;
      PoolManagement: ContractDeploy;
      PriceAdjust: ContractDeploy;
      'OwnedUpgradeableProxy<PriceAdjust>': ContractDeploy;
      Payout: ContractDeploy;
      'OwnedUpgradeableProxy<Payout>': ContractDeploy;
      AgentData: ContractDeploy;
      'OwnedUpgradeableProxy<AgentData>': ContractDeploy;
      'OwnedBeaconProxy<MST>': ContractDeploy; //decimals: string;
      Staking: ContractDeploy;
      'OwnedUpgradeableProxy<Staking>': ContractDeploy;
      MST: ContractDeploy;
      USDC: ContractDeploy;
      WBTC: ContractDeploy;
      WETH: ContractDeploy;
      UniswapV3_WBTC_USDC_Pool: ContractDeploy;
      UniswapV3_USDC_WETH_Pool: ContractDeploy;
      MiningPool: ContractDeploy;
      'UpgradeableBeacon<MiningPool>': ContractDeploy;
      'OwnedBeaconProxy<USDMiningPool>': ContractDeploy;
      'OwnedBeaconProxy<BTCMiningPool>': ContractDeploy;
      'OwnedBeaconProxy<ETHMiningPool>': ContractDeploy;
      'OwnedBeaconProxy<PaymentProxy>': ContractDeploy;
    };
    rajSwap: RajPair[];
  };

  constructor() {
    this.comment = '';
    this.jwt = {
      expires_in: '',
      dapp_expires_in: '',
      TOKEN_KEY: '',
    };
    this.fundingCode = {
      expires_in: '',
      TOKEN_KEY: '',
    };
    this.rpcHostHttp = '';
    this.rpcHostHttpMining = '';
    this.rpcHost = '';
    this.rpcHostMining = '';
    this.chainId = 0;
    this.chainIdMining = 0;
    this.wallet = {
      url: '',
      port: 0,
    };
    this.salt = '';
    this.smartcontract = {
      MappedSwap: {
        verifierAddress: '',
        privateKey: {
          adjustPrice: '',
          dApp: '',
          agent: '',
          commissionJob: '',
        },
        Multicall: new ContractDeploy(),
        WrappedEUN: new ContractDeploy(),
        'OwnedUpgradeableProxy<WEUN>': new ContractDeploy(),
        MappedSwapToken: new ContractDeploy(),
        'UpgradeableBeacon<MappedSwapToken>': new ContractDeploy(),
        'OwnedBeaconProxy<USDM>': new ContractDeploy(),
        'OwnedBeaconProxy<BTCM>': new ContractDeploy(),
        'OwnedBeaconProxy<ETHM>': new ContractDeploy(),
        RaijinSwapFactory: new ContractDeploy(),
        'OwnedUpgradeableProxy<RaijinSwapFactory>': new ContractDeploy(),
        RaijinSwapRouter: new ContractDeploy(),
        'OwnedUpgradeableProxy<RaijinSwapRouter>': new ContractDeploy(),
        PoolCore: new ContractDeploy(),
        'OwnedUpgradeableProxy<Pool>': new ContractDeploy(),
        PoolManagement: new ContractDeploy(),
        PriceAdjust: new ContractDeploy(),
        'OwnedUpgradeableProxy<PriceAdjust>': new ContractDeploy(),
        Payout: new ContractDeploy(),
        'OwnedUpgradeableProxy<Payout>': new ContractDeploy(),
        AgentData: new ContractDeploy(),
        'OwnedUpgradeableProxy<AgentData>': new ContractDeploy(),
        'OwnedBeaconProxy<MST>': new ContractDeploy(),
        Staking: new ContractDeploy(),
        'OwnedUpgradeableProxy<Staking>': new ContractDeploy(),
        MST: new ContractDeploy(),
        USDC: new ContractDeploy(),
        WBTC: new ContractDeploy(),
        WETH: new ContractDeploy(),
        UniswapV3_WBTC_USDC_Pool: new ContractDeploy(),
        UniswapV3_USDC_WETH_Pool: new ContractDeploy(),
        MiningPool: new ContractDeploy(),
        'UpgradeableBeacon<MiningPool>': new ContractDeploy(),
        'OwnedBeaconProxy<USDMiningPool>': new ContractDeploy(),
        'OwnedBeaconProxy<BTCMiningPool>': new ContractDeploy(),
        'OwnedBeaconProxy<ETHMiningPool>': new ContractDeploy(),
        'OwnedBeaconProxy<PaymentProxy>': new ContractDeploy(),
      },
      rajSwap: [],
    };
  }
}
