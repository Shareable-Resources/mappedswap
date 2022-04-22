const DeployHelper = require("./deployHelper");
const Proxy = artifacts.require("OwnedUpgradeableProxy");

const Payout = artifacts.require("Payout");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    await DeployHelper.deployWithProxy(web3, deployer, network, accounts, Proxy, null, Payout, null, true);
    await Payout.deployed();

    DeployHelper.writeDeployLog(network);
};
