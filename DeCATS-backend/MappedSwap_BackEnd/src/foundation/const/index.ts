import {
  WebsocketProviderOptions,
  HttpProviderOptions,
} from 'web3-core-helpers';

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
    onTimeout: true,
  },
};

const web3HttpProviderOption: HttpProviderOptions = {
  keepAlive: true,
  timeout: 1000,
};

export default {
  jwtSecret,
  ChainId,
  web3webSocketDefaultOption,
  web3HttpProviderOption,
};
