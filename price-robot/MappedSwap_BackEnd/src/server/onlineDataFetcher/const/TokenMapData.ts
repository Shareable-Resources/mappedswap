import foundationConfigJSON from '../../../config/FoundationConfig.json';
const foundationConfig =
  foundationConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];
const mapped = {
  WETH: {
    name: 'ETHM',
    addr: foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<ETHM>']
      .address,
  },
  WBTC: {
    name: 'BTCM',
    addr: foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<BTCM>']
      .address,
  },
  USDC: {
    name: 'USDM',
    addr: foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<USDM>']
      .address,
  },
};

export default mapped;
