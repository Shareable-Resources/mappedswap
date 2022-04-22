import FactoryFetcherBinance from './FactoryFetcherBinance';
import FactoryFetcherUniswap from './FactoryFetcherUniswap';
import FactoryFetcherCoinbase from './FactoryFetcherCoinbase';
import FactoryFetcher from './FactoryFetcher';
function getAllFactories() {
  const factories: FactoryFetcher[] = [
    new FactoryFetcherUniswap(),
    new FactoryFetcherBinance(),
    new FactoryFetcherCoinbase(),
  ];
  return factories;
}
export {
  FactoryFetcherBinance,
  FactoryFetcherUniswap,
  FactoryFetcherCoinbase,
  getAllFactories,
};
