const DeployHelper = require("./deployHelper");
const Proxy = artifacts.require("OwnedUpgradeableProxy");

const AgentData = artifacts.require("AgentData");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    await DeployHelper.deployWithProxy(web3, deployer, network, accounts, Proxy, null, AgentData, null, true);
    await AgentData.deployed();

    DeployHelper.writeDeployLog(network);
};
