import { WebsocketProviderOptions } from 'web3-core-helpers';

const jwtSecret = 'thesecretcanttell';
export enum ChainId {
  ETHMainnet = 1,
  SideChain = 2021,
  Testnet = 1984,
  Rinkeby = 4,
}

const web3webSocketDefaultOption: WebsocketProviderOptions = {
  timeout: 30000, // ms
  clientConfig: {
    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: -1, // ms
  },
  // Enable auto reconnection
  reconnect: {
    auto: true,
    delay: 1000, // ms
    maxAttempts: undefined, //Infinite
    onTimeout: false,
  },
};

export default {
  jwtSecret,
  ChainId,
  web3webSocketDefaultOption,
};
