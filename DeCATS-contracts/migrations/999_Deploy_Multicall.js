const DeployHelper = require("./deployHelper");

const Multicall = artifacts.require("Multicall");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    await DeployHelper.deploy(deployer, network, Multicall);
    await Multicall.deployed();

    DeployHelper.writeDeployLog(network);
};
