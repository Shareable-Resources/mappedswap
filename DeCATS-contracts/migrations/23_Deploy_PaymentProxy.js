const DeployHelper = require("./deployHelper");

const PaymentProxy = artifacts.require("PaymentProxy");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    await DeployHelper.deploy(
        deployer,
        network,
        PaymentProxy,
        "PaymentProxy");

    DeployHelper.writeDeployLog(network);
};
