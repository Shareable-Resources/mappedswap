const DeployHelper = require("./deployHelper");

const Pool = artifacts.require("IPool");

module.exports = async function (deployer, network, accounts) {
    if (network.startsWith("mainnet")) {
        console.log("Not the correct network to deploy this script");
        return;
    }

    DeployHelper.readDeployLog(network);

    console.log("Update customer info before start trading");

    let myAddr = "0x39EB6463871040f75C89C67ec1dFCB141C3da1cf";

    let poolAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<Pool>").address;
    console.log("Pool address is " + poolAddr);

    let BN = web3.utils.BN;

    let pool = new web3.eth.Contract(Pool.abi, poolAddr);

    // 1M USDM funding, decimals = 6
    let funding = new BN("1000000000000");

    // 0.9 = 90%, decimals = 6
    let riskLevel = new BN("900000");

    // 10X leverage
    await pool.methods.updateCustomerDetails(myAddr, 0, 10000, funding, riskLevel, 1).send(DeployHelper.callParams(accounts, deployer));
    console.log("Updated customer to have funding " + (funding / 1000000) + " USDM with risk level " + (riskLevel) / 10000 + "%");
};
