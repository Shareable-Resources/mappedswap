const DeployHelper = require("./deployHelper");
const Proxy = artifacts.require("OwnedBeaconProxy");
const Beacon = artifacts.require("UpgradeableBeacon");

const EthereumERC20 = artifacts.require("EthereumERC20");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    await DeployHelper.deployWithBeacon(web3, deployer, network, accounts, Beacon, null, EthereumERC20);

    // let BN = web3.utils.BN;
    // let decimals6 = new BN("1000000");
    // let decimals18 = new BN("1000000000000000000");
    // let thousand = new BN("1000");
    // let million = new BN("1000000");
    // let billion = new BN("1000000000");

    await DeployHelper.deployProxyUsingBeacon(
        web3, deployer, network, accounts, Proxy,
        "OwnedBeaconProxy<USDM>",
        "UpgradeableBeacon<EthereumERC20>", EthereumERC20, true,
        "USD Mapped Token", "USDM", 6, 0);

    await DeployHelper.deployProxyUsingBeacon(
        web3, deployer, network, accounts, Proxy,
        "OwnedBeaconProxy<BTCM>",
        "UpgradeableBeacon<EthereumERC20>", EthereumERC20, true,
        "Bitcoin Mapped Token", "BTCM", 18, 0);

    await DeployHelper.deployProxyUsingBeacon(
        web3, deployer, network, accounts, Proxy,
        "OwnedBeaconProxy<ETHM>",
        "UpgradeableBeacon<EthereumERC20>", EthereumERC20, true,
        "Ethereum Mapped Token", "ETHM", 18, 0);

    await DeployHelper.deployProxyUsingBeacon(
        web3, deployer, network, accounts, Proxy,
        "OwnedBeaconProxy<MST>",
        "UpgradeableBeacon<EthereumERC20>", EthereumERC20, true,
        "MappedSwap Token", "MST", 18, 0);

    DeployHelper.writeDeployLog(network);
};
