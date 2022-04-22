const HDWalletProvider = require("@truffle/hdwallet-provider");

const TestnetPrivateKey = "{TestnetPrivateKey}";

const TestnetProvider = new HDWalletProvider({
  privateKeys: [TestnetPrivateKey],
  providerOrUrl: "http://54.254.124.206:10000",
  pollingInterval: 80000
});

module.exports = {
  networks: {
    testnet: {
      provider: TestnetProvider,
      network_id: "1984",
      gasLimit: 0x1fffffffffffff,
      gasPrice: 2400000000,
      gas: 100000000,
      networkCheckTimeout: 50000000,
      timeoutBlocks: 200
    }
  },
  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.6.6",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "istanbul"
      }
    }
  }
};
