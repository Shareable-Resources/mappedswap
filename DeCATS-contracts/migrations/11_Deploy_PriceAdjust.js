const DeployHelper = require("./deployHelper");
const Proxy = artifacts.require("OwnedUpgradeableProxy");

const PriceAdjust = artifacts.require("PriceAdjust");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    let poolAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<Pool>").address;
    console.log("Pool address is " + poolAddr);
    await DeployHelper.deployWithProxy(web3, deployer, network, accounts, Proxy, null, PriceAdjust, null, true, poolAddr);
    await PriceAdjust.deployed();

    DeployHelper.writeDeployLog(network);
};
