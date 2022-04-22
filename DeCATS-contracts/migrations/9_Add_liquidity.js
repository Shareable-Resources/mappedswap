const DeployHelper = require("./deployHelper");

const RaijinSwapRouter = artifacts.require("RaijinSwapRouter");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    console.log("Add liquidity");

    let routerAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<RaijinSwapRouter>").address;
    console.log("Router address is " + routerAddr);

    let BN = web3.utils.BN;

    let router = new web3.eth.Contract(RaijinSwapRouter.abi, routerAddr);

    // Set pool address can swap restricted tokens
    let poolAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<Pool>").address;
    await router.methods.grantSelectedSwapper(poolAddr).send(DeployHelper.callParams(accounts, deployer));
    console.log("Granted selected swapper role to " + poolAddr);

    if (network.startsWith("mainnet")) {
        console.log("Liquidity is not added by deploy script in mainnet deployment");
        return;
    }

    let usdmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<USDM>").address;
    let btcmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<BTCM>").address;
    let ethmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<ETHM>").address;

    // Add liquidity, using owner's token to add liquidity, but liquidity token belongs to me

    let to = DeployHelper.config.liquidity.to;

    let pool1USDM = new BN(DeployHelper.config.liquidity.btcmPool.usdm);
    let pool1BTCM = new BN(DeployHelper.config.liquidity.btcmPool.btcm);
    let deadline = Math.floor(Date.now() / 1000) + 600;
    await router.methods.addLiquidity(usdmAddr, btcmAddr, pool1USDM, pool1BTCM, pool1USDM, pool1BTCM, to, deadline).send(DeployHelper.callParams(accounts, deployer));
    console.log("Added liquidity to USDM/BTCM");

    let pool2USDM = new BN(DeployHelper.config.liquidity.ethmPool.usdm);
    let pool2ETHM = new BN(DeployHelper.config.liquidity.ethmPool.ethm);
    await router.methods.addLiquidity(usdmAddr, ethmAddr, pool2USDM, pool2ETHM, pool2USDM, pool2ETHM, to, deadline).send(DeployHelper.callParams(accounts, deployer));
    console.log("Added liquidity to USDM/ETHM");
};
