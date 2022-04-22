const DeployHelper = require("./deployHelper");

const MultiSigOwner = artifacts.require("MultiSigOwner");

module.exports = async function (deployer, network, accounts) {
    if (network != "dev_rinkeby" && network != "testnet_rinkeby" && network != "mainnet_ethereum") {
        console.log("Not the correct network to deploy this script");
        return;
    }

    DeployHelper.readDeployLog(network);

    DeployHelper.verifyContract = true;

    await DeployHelper.deploy(
        deployer,
        network,
        MultiSigOwner,
        "EthereumOwner",
        DeployHelper.config.ethereumOwner.owners,
        DeployHelper.config.ethereumOwner.required);

    DeployHelper.writeDeployLog(network);
};
