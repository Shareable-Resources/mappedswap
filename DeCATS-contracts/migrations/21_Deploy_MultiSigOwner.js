const DeployHelper = require("./deployHelper");

const MultiSigOwner = artifacts.require("MultiSigOwner");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    await DeployHelper.deploy(
        deployer,
        network,
        MultiSigOwner,
        "MappedSwapOwner",
        DeployHelper.config.mappedSwapOwner.owners,
        DeployHelper.config.mappedSwapOwner.required);

    await DeployHelper.deploy(
        deployer,
        network,
        MultiSigOwner,
        "RaijinSwapOwner",
        DeployHelper.config.raijinSwapOwner.owners,
        DeployHelper.config.raijinSwapOwner.required);

    DeployHelper.writeDeployLog(network);
};
