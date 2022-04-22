function getEurusRpc() {
  return process.env.REACT_APP_EURUS_RPC_URL;
}

function getEurusChainId() {
  return process.env.REACT_APP_EURUS_CHAIN_ID;
}

function getEurusChainName() {
  return process.env.REACT_APP_EURUS_SIDECHAIN_CHAIN_NAME;
}

function getEthereumRpc() {
  return process.env.REACT_APP_ETHEREUM_RPC_URL;
}

function getEthereumChainId() {
  return process.env.REACT_APP_ETHEREUM_CHAIN_ID;
}

function getEthereumChainName() {
  return process.env.REACT_APP_ETHEREUM_CHAIN_NAME;
}

function getEurusBlockExplorer() {
  return process.env.REACT_APP_EURUS_BLOCK_EXPLORER;
}

export function getEurusApiUrl() {
  return process.env.REACT_APP_EURUS_API_URL;
}

export function getAdminApiUrl() {
  return process.env.REACT_APP_ADMIN_API_URL;
}

export function getEthereumNetworks() {
  let ethereum = {
    name: getEthereumChainName(),
    url: getEthereumRpc(),
    chainId: getEthereumChainId(),
  };
  return ethereum;
}

export function getSideChainNetworks() {
  let sidechain = {
    name: getEurusChainName(),
    url: getEurusRpc(),
    chainId: getEurusChainId(),
    blockExplorerUrls: getEurusBlockExplorer(),
  };
  return sidechain;
}

export function getUsdmSmartContractAddress() {
  return process.env.REACT_APP_EURUS_USDM_ADDRESS;
}

export function getBtcmSmartContractAddress() {
  return process.env.REACT_APP_EURUS_BTCM_ADDRESS;
}

export function getEthmSmartContractAddress() {
  return process.env.REACT_APP_EURUS_ETHM_ADDRESS;
}

export function getMstSmartContractAddress() {
  return process.env.REACT_APP_EURUS_MST_ADDRESS;
}

export function getEurusUsdcContractAddress() {
  return process.env.REACT_APP_EURUS_USDC_ADDRESS;
}

export function getEurusFixedRateExchangeContractAddress() {
  return process.env.REACT_APP_EURUS_FIXED_RATE_EXCHANGE_CONTRACT_ADDRESS;
}

export function getEurusFixedRateExchangeProviderAddress() {
  return process.env.REACT_APP_EURUS_FIXED_RATE_EXCHANGE_PROVIDER_ADDRESS;
}

export function getPoolSmartContractAddress() {
  return process.env.REACT_APP_EURUS_POOL_ADDRESS;
}

export function getPayoutContractAddress() {
  return process.env.REACT_APP_EURUS_PAYOUT_CONTRACT_ADDRESS;
}

export function getStakingContractAddress() {
  return process.env.REACT_APP_EURUS_STAKE_ADDRESS;
}

export function getMappedSwapToken() {
  return {
    USDM: process.env.REACT_APP_EURUS_USDM_ADDRESS,
    BTCM: process.env.REACT_APP_EURUS_BTCM_ADDRESS,
    ETHM: process.env.REACT_APP_EURUS_ETHM_ADDRESS,
    MST: process.env.REACT_APP_EURUS_MST_ADDRESS,
  };
}

export function getMappedSwapTokenForEthereum() {
  return {
    USDM: process.env.REACT_APP_ETHEREUM_USDM_ADDRESS,
    BTCM: process.env.REACT_APP_ETHEREUM_BTCM_ADDRESS,
    ETHM: process.env.REACT_APP_ETHEREUM_ETHM_ADDRESS,
    MST: process.env.REACT_APP_ETHEREUM_MST_ADDRESS,
  };
}

export function getMiningPoolTokenContract() {
  return {
    USDC: process.env.REACT_APP_EURUS_USD_MINING_ADDRESS,
    wBTC: process.env.REACT_APP_EURUS_BTC_MINING_ADDRESS,
    ETH: process.env.REACT_APP_EURUS_ETH_MINING_ADDRESS,
  };
}

export function getERC20Token() {
  return {
    wBTC: process.env.REACT_APP_BTC_ADDRESS,
    USDC: process.env.REACT_APP_USD_ADDRESS,
    ETH: process.env.REACT_APP_ETH_ADDRESS,
  };
}
