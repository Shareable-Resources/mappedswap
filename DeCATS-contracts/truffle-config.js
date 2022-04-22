const HDWalletProvider = require("@truffle/hdwallet-provider");

const DevPrivateKey = "5555fe01770a5c6dc621f00465e6a0f76bbd4bc1edbde5f2c380fcb00f354b99";
const TestnetPrivateKey = "5555fe01770a5c6dc621f00465e6a0f76bbd4bc1edbde5f2c380fcb00f354b99";
// const MainnetPrivateKey = "3ecb0c31c9016165d307faa84f8f06972dd0f44be25be247417c6b02102a8b27"; // Raijin Swap Deployer
const MainnetPrivateKey = "4cbb93c15fb61b51801a1a2fa91028e04ff6965fa2becf1f53f8d5519b1702a6"; // Mapped Swap Deployer
const RinkebyPrivateKey = "906b9fa7fab30a174fae300b9580906738b68b28afed1a47aaf0a6d7e420cb9d";

// Change before use!
const EthereumPrivateKey = "5555fe01770a5c6dc621f00465e6a0f76bbd4bc1edbde5f2c380fcb00f354b99";

const DevProvider = new HDWalletProvider({
  privateKeys: [DevPrivateKey],
  providerOrUrl: "http://13.228.169.25:8545",
  pollingInterval: 80000
});

const TestnetProvider = new HDWalletProvider({
  privateKeys: [TestnetPrivateKey],
  providerOrUrl: "https://testnet.eurus.network",
  pollingInterval: 80000
});

const MainnetProvider = new HDWalletProvider({
  privateKeys: [MainnetPrivateKey],
  providerOrUrl: "https://mainnet.eurus.network",
  pollingInterval: 80000
});

const RinkebyProvider = new HDWalletProvider({
  privateKeys: [RinkebyPrivateKey],
  providerOrUrl: "http://18.142.45.37:8545",
  pollingInterval: 70000000
});

// Change before use!
const EthereumProvider = new HDWalletProvider({
  privateKeys: [EthereumPrivateKey],
  providerOrUrl: "https://ethnodes.eurus.network",
  pollingInterval: 70000000
});

module.exports = {
  networks: {
    dev: {
      provider: DevProvider,
      network_id: "2021",
      gasLimit: 0xfffffffffff,
      gasPrice: 2400000000,
      gas: 100000000,
      networkCheckTimeout: 50000000,
      timeoutBlocks: 200
    },
    dev_rinkeby: {
      provider: RinkebyProvider,
      network_id: "4",
      confirmations: 1,
      timeoutBlocks: 2000,
      skipDryRun: true
    },
    testnet: {
      provider: TestnetProvider,
      network_id: "1984",
      gasLimit: 0x1fffffffffffff,
      gasPrice: 2400000000,
      gas: 100000000,
      networkCheckTimeout: 50000000,
      timeoutBlocks: 200
    },
    testnet_rinkeby: {
      provider: RinkebyProvider,
      network_id: "4",
      confirmations: 1,
      timeoutBlocks: 2000,
      skipDryRun: true
    },
    mainnet: {
      provider: MainnetProvider,
      network_id: "1008",
      gasLimit: 0x1fffffffffffff,
      gasPrice: 2400000000,
      gas: 20000000,
      networkCheckTimeout: 50000000,
      timeoutBlocks: 200
    },
    mainnet_ethereum: {
      provider: EthereumProvider,
      network_id: "1",
      confirmations: 1,
      timeoutBlocks: 2000
    },
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
  },
  plugins: ["truffle-contract-size", "truffle-plugin-verify"],
  api_keys: {
    etherscan: "PASTE_YOUR_ETHERSCAN_API_KEY_HERE_TO_VERIFY_CONTRACTS_DO_NOT_COMMIT"
  }
};
