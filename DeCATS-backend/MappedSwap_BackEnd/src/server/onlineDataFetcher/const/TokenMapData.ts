import globalVar from '../const/globalVar';

const mapped = {
  WETH: {
    name: 'ETHM',
    addr: globalVar.foundationConfig.smartcontract.MappedSwap[
      'OwnedBeaconProxy<ETHM>'
    ].address,
  },
  WBTC: {
    name: 'BTCM',
    addr: globalVar.foundationConfig.smartcontract.MappedSwap[
      'OwnedBeaconProxy<BTCM>'
    ].address,
  },
  USDC: {
    name: 'USDM',
    addr: globalVar.foundationConfig.smartcontract.MappedSwap[
      'OwnedBeaconProxy<USDM>'
    ].address,
  },
};

export default mapped;
