const DeployHelper = require("./deployHelper");

const PriceAdjust = artifacts.require("PriceAdjust");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    console.log("Grant backend role in PriceAdjust");

    let priceAdjustAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<PriceAdjust>").address;
    console.log("PriceAdjust address is " + priceAdjustAddr);

    let priceAdjust = new web3.eth.Contract(PriceAdjust.abi, priceAdjustAddr);

    // Backend should use individual address
    for (const backendAddr of DeployHelper.config.priceAdjust.backends) {
        await priceAdjust.methods.grantBackend(backendAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted backend role to " + backendAddr);
    }

    // Manager can set which pool to trade inside, though it should be seldom changed
    for (const managerAddr of DeployHelper.config.priceAdjust.managers) {
        await priceAdjust.methods.grantManager(managerAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted manager role to " + managerAddr);
    }
};
