const DeployHelper = require("./deployHelper");

const Pool = artifacts.require("IPool");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    console.log("Set PriceAdjust as customer to use trade functions");

    let myAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<PriceAdjust>").address;

    let poolAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<Pool>").address;
    console.log("Pool address is " + poolAddr);

    let BN = web3.utils.BN;

    let pool = new web3.eth.Contract(Pool.abi, poolAddr);

    // 2^224, should be large enough
    let funding = new BN("26959946667150639794667015087019630673637144422540572481103610249216");
    let riskLevel = new BN("1000000");

    // Use pure funding mode
    await pool.methods.updateCustomerDetails(myAddr, 1, 1000, funding, riskLevel, 1).send(DeployHelper.callParams(accounts, deployer));
};
