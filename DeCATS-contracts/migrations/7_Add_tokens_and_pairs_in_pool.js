const DeployHelper = require("./deployHelper");

const Pool = artifacts.require("IPool");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    let poolAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<Pool>").address;
    console.log("Adding tokens in pool " + poolAddr);
    let pool = new web3.eth.Contract(Pool.abi, poolAddr);

    // Decimal of interest rate is 9, so if set to 0.01% interest, value should be 100000 (0.01% => 0.0001, then * 10^9 = 100000)

    let usdmInterestRate = DeployHelper.config.mappedSwap.interestRates["usdm"];
    let usdmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<USDM>").address;
    await pool.methods.addToken("USDM", usdmAddr, usdmInterestRate).send(DeployHelper.callParams(accounts, deployer));
    console.log("Added USDM with interest rate " + usdmInterestRate / 10000000 + "% hourly");

    let btcmInterestRate = DeployHelper.config.mappedSwap.interestRates["btcm"];
    let btcmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<BTCM>").address;
    await pool.methods.addToken("BTCM", btcmAddr, btcmInterestRate).send(DeployHelper.callParams(accounts, deployer));
    console.log("Added BTCM with interest rate " + btcmInterestRate / 10000000 + "% hourly");

    let ethmInterestRate = DeployHelper.config.mappedSwap.interestRates["ethm"];
    let ethmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<ETHM>").address;
    await pool.methods.addToken("ETHM", ethmAddr, ethmInterestRate).send(DeployHelper.callParams(accounts, deployer));
    console.log("Added ETHM with interest rate " + ethmInterestRate / 10000000 + "% hourly");

    await pool.methods.addPair("USDM", "BTCM").send(DeployHelper.callParams(accounts, deployer));
    console.log("Added pair USDM/BTCM (and BTCM/USDM automatically)");

    await pool.methods.addPair("USDM", "ETHM").send(DeployHelper.callParams(accounts, deployer));
    console.log("Added pair USDM/ETHM (and ETHM/USDM automatically)");
};
