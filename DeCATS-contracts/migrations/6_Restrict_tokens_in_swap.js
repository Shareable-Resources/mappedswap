const DeployHelper = require("./deployHelper");

const RaijinSwapRouter = artifacts.require("RaijinSwapRouter");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    let routerAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<RaijinSwapRouter>").address;
    console.log("Adding restricted tokens in router " + routerAddr);
    let router = new web3.eth.Contract(RaijinSwapRouter.abi, routerAddr);

    let usdmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<USDM>").address;
    await router.methods.setTokenRestrictStatus(usdmAddr, true).send(DeployHelper.callParams(accounts, deployer));
    console.log("Restricted USDM");

    let btcmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<BTCM>").address;
    await router.methods.setTokenRestrictStatus(btcmAddr, true).send(DeployHelper.callParams(accounts, deployer));
    console.log("Restricted BTCM");

    let ethmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<ETHM>").address;
    await router.methods.setTokenRestrictStatus(ethmAddr, true).send(DeployHelper.callParams(accounts, deployer));
    console.log("Restricted ETHM");
};
