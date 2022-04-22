const DeployHelper = require("./deployHelper");
const Proxy = artifacts.require("OwnedUpgradeableProxy");

const RaijinSwapFactory = artifacts.require("RaijinSwapFactory");
const RaijinSwapRouter = artifacts.require("RaijinSwapRouter");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    // Deploy factory
    let feeToSetterAddr = DeployHelper.config.raijinSwap.feeToSetter;
    console.log("Using " + feeToSetterAddr + " as feeToSetter address");
    await DeployHelper.deployWithProxy(web3, deployer, network, accounts, Proxy, null, RaijinSwapFactory, null, true, feeToSetterAddr);
    await RaijinSwapFactory.deployed();

    // Deploy router
    let factoryAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<RaijinSwapFactory>").address;
    let weunAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<WEUN>").address;
    console.log("WEUN address is " + weunAddr);
    await DeployHelper.deployWithProxy(web3, deployer, network, accounts, Proxy, null, RaijinSwapRouter, null, true, factoryAddr, weunAddr);
    await RaijinSwapRouter.deployed();

    // Update router address in factory
    let routerAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<RaijinSwapRouter>").address;
    console.log("Update router address " + routerAddr + " to factory " + factoryAddr);
    let factory = new web3.eth.Contract(RaijinSwapFactory.abi, factoryAddr);
    await factory.methods.setRouter(routerAddr).send(DeployHelper.callParams(accounts, deployer));

    // Grant manager role
    let router = new web3.eth.Contract(RaijinSwapRouter.abi, routerAddr);
    for (const managerAddr of DeployHelper.config.raijinSwap.managers) {
        await router.methods.grantManager(managerAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted manager role to " + managerAddr);
    }

    // Permission to allow add liquidity to restricted token
    // This role is granted by manager, so need manager role first
    // Note that selected liquidity provider checking is on whom to receive LP token, not who to make transaction
    for (const lpAddr of DeployHelper.config.raijinSwap.selectedLPs) {
        await router.methods.grantSelectedLiquidityProvider(lpAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted selected liquidity provider role to " + lpAddr);
    }

    // Selected swapper will be granted later, as it should be pool address, which is not known now

    DeployHelper.writeDeployLog(network);
};
