const DeployHelper = require("./deployHelper");

const MappedSwapToken = artifacts.require("MappedSwapToken");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    console.log("Mint tokens and approve");

    let routerAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<RaijinSwapRouter>").address;
    console.log("Router address is " + routerAddr);

    let poolAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<Pool>").address;
    console.log("Pool address is " + poolAddr);

    let BN = web3.utils.BN;

    let usdmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<USDM>").address;
    let btcmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<BTCM>").address;
    let ethmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<ETHM>").address;
    let usdm = new web3.eth.Contract(MappedSwapToken.abi, usdmAddr);
    let btcm = new web3.eth.Contract(MappedSwapToken.abi, btcmAddr);
    let ethm = new web3.eth.Contract(MappedSwapToken.abi, ethmAddr);

    // Mint to pool if not in mainnet
    if (!network.startsWith("mainnet")) {
        let poolUSDM = DeployHelper.config.mappedSwap.mintToPool["usdm"];
        let poolBTCM = DeployHelper.config.mappedSwap.mintToPool["btcm"];
        let poolETHM = DeployHelper.config.mappedSwap.mintToPool["ethm"];

        await usdm.methods.mint(poolAddr, new BN(poolUSDM)).send(DeployHelper.callParams(accounts, deployer));
        console.log("USDM minted " + poolUSDM + " to pool " + poolAddr);
        await btcm.methods.mint(poolAddr, new BN(poolBTCM)).send(DeployHelper.callParams(accounts, deployer));
        console.log("BTCM minted " + poolBTCM + " to pool " + poolAddr);
        await ethm.methods.mint(poolAddr, new BN(poolETHM)).send(DeployHelper.callParams(accounts, deployer));
        console.log("ETHM minted " + poolETHM + " to pool " + poolAddr);
    }

    // Approve router to take pool's token
    let uint256max = new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935");

    await usdm.methods.approve(routerAddr, uint256max).send(DeployHelper.callParams(accounts, deployer));
    console.log("USDM approved router");
    await btcm.methods.approve(routerAddr, uint256max).send(DeployHelper.callParams(accounts, deployer));
    console.log("BTCM approved router");
    await ethm.methods.approve(routerAddr, uint256max).send(DeployHelper.callParams(accounts, deployer));
    console.log("ETHM approved router");
};
