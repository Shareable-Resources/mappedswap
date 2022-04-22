const DeployHelper = require("./deployHelper");

const PriceAdjust = artifacts.require("PriceAdjust");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    console.log("Grant backend role in PriceAdjust");

    let backendAddr = "0x6B45436Dd46091F58323C61BE93Af22A4fcf2d85";
    let ownerAddr = "0x01a6d1dd2171a45e6a3d3dc52952b40be413fa93";

    let priceAdjustAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<PriceAdjust>").address;
    console.log("PriceAdjust address is " + priceAdjustAddr);

    let priceAdjust = new web3.eth.Contract(PriceAdjust.abi, priceAdjustAddr);

    // Backend should use individual address
    await priceAdjust.methods.grantBackend(backendAddr).send(DeployHelper.callParams(accounts, deployer));

    // Manager can set which pool to trade inside, though it should be seldom changed
    await priceAdjust.methods.grantManager(ownerAddr).send(DeployHelper.callParams(accounts, deployer));
};
