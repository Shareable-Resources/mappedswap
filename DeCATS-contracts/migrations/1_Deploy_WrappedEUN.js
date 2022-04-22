const DeployHelper = require("./deployHelper");
const Proxy = artifacts.require("OwnedUpgradeableProxy");

const WrappedEUN = artifacts.require("WrappedEUN");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    await DeployHelper.deployWithProxy(web3, deployer, network, accounts, Proxy, "OwnedUpgradeableProxy<WEUN>", WrappedEUN, null, false);
    await WrappedEUN.deployed();

    DeployHelper.writeDeployLog(network);
};
