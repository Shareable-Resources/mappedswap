const DeployHelper = require("./deployHelper");
const Proxy = artifacts.require("OwnedBeaconProxy");
const Beacon = artifacts.require("UpgradeableBeacon");

const MiningPool = artifacts.require("MiningPool");
const MappedSwapToken = artifacts.require("MappedSwapToken");

module.exports = async function (deployer, network, accounts) {
    // Should be deployed to mainnet_ethereum, not mainnet (Eurus)
    if (network == "mainnet") {
        console.log("Not the correct network to deploy this script");
        return;
    }

    DeployHelper.readDeployLog(network);

    DeployHelper.verifyContract = true;

    let BN = web3.utils.BN;

    let conf = DeployHelper.config.miningPool;

    let rewardPeriod = conf.rewardPeriod;
    let redeemWaitPeriod = conf.redeemWaitPeriod;
    let lockPeriod = conf.lockPeriod;
    let mstAddr = DeployHelper.getSmartContractInfoByName(deployer, "MST").address;

    let usdDecimals = new BN("1000000");

    let usdPoolTotalAnnualRewards = (new BN(conf.pools["usd"].totalAnnualRewards)).mul(usdDecimals);
    let usdPoolCapacity = (new BN(conf.pools["usd"].capacity)).mul(usdDecimals);
    let usdAddr = DeployHelper.getSmartContractInfoByName(deployer, "USDC").address;
    let usdUniswapPool = "0x0000000000000000000000000000000000000000";

    let btcPoolTotalAnnualRewards = (new BN(conf.pools["btc"].totalAnnualRewards)).mul(usdDecimals);
    let btcPoolCapacity = (new BN(conf.pools["btc"].capacity)).mul(usdDecimals);
    let btcAddr = DeployHelper.getSmartContractInfoByName(deployer, "WBTC").address;
    let btcUniswapPool = DeployHelper.getSmartContractInfoByName(deployer, "UniswapV3_WBTC_USDC_Pool").address;

    let ethPoolTotalAnnualRewards = (new BN(conf.pools["eth"].totalAnnualRewards)).mul(usdDecimals);
    let ethPoolCapacity = (new BN(conf.pools["eth"].capacity)).mul(usdDecimals);
    let ethAddr = DeployHelper.getSmartContractInfoByName(deployer, "WETH").address;
    let ethUniswapPool = DeployHelper.getSmartContractInfoByName(deployer, "UniswapV3_USDC_WETH_Pool").address;

    // Deploy implementation and beacon contract
    await DeployHelper.deployWithBeacon(web3, deployer, network, accounts, Beacon, null, MiningPool, null);

    // Deploy for USD
    await DeployHelper.deployProxyUsingBeacon(
        web3,
        deployer,
        network,
        accounts,
        Proxy,
        "OwnedBeaconProxy<USDMiningPool>",
        "UpgradeableBeacon<MiningPool>",
        MiningPool,
        true,
        usdAddr,
        mstAddr,
        usdUniswapPool,
        usdPoolTotalAnnualRewards,
        usdPoolCapacity,
        lockPeriod,
        rewardPeriod,
        redeemWaitPeriod,
        false);

    // Deploy for BTC
    await DeployHelper.deployProxyUsingBeacon(
        web3,
        deployer,
        network,
        accounts,
        Proxy,
        "OwnedBeaconProxy<BTCMiningPool>",
        "UpgradeableBeacon<MiningPool>",
        MiningPool,
        true,
        btcAddr,
        mstAddr,
        btcUniswapPool,
        btcPoolTotalAnnualRewards,
        btcPoolCapacity,
        lockPeriod,
        rewardPeriod,
        redeemWaitPeriod,
        false);

    // Deploy for ETH
    await DeployHelper.deployProxyUsingBeacon(
        web3,
        deployer,
        network,
        accounts,
        Proxy,
        "OwnedBeaconProxy<ETHMiningPool>",
        "UpgradeableBeacon<MiningPool>",
        MiningPool,
        true,
        ethAddr,
        mstAddr,
        ethUniswapPool,
        ethPoolTotalAnnualRewards,
        ethPoolCapacity,
        lockPeriod,
        rewardPeriod,
        redeemWaitPeriod,
        true);

    let usdPoolAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<USDMiningPool>").address;
    let btcPoolAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<BTCMiningPool>").address;
    let ethPoolAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<ETHMiningPool>").address;

    if (!network.startsWith("mainnet")) {
        // Mint MST to mining pool, total stake rewards has the same numerical value as pool capacity
        // decimals of USD = 6, decimals of MST = 18
        let mst = new web3.eth.Contract(MappedSwapToken.abi, mstAddr);
        await mst.methods.mint(usdPoolAddr, usdPoolCapacity.mul(new BN("1000000000000"))).send(DeployHelper.callParams(accounts, deployer));
        await mst.methods.mint(btcPoolAddr, btcPoolCapacity.mul(new BN("1000000000000"))).send(DeployHelper.callParams(accounts, deployer));
        await mst.methods.mint(ethPoolAddr, ethPoolCapacity.mul(new BN("1000000000000"))).send(DeployHelper.callParams(accounts, deployer));
    }

    let usdPool = new web3.eth.Contract(MiningPool.abi, usdPoolAddr);
    let btcPool = new web3.eth.Contract(MiningPool.abi, btcPoolAddr);
    let ethPool = new web3.eth.Contract(MiningPool.abi, ethPoolAddr);

    for (const withdrawerAddr of conf.withdrawers) {
        await usdPool.methods.grantWithdrawer(withdrawerAddr).send(DeployHelper.callParams(accounts, deployer));
        await btcPool.methods.grantWithdrawer(withdrawerAddr).send(DeployHelper.callParams(accounts, deployer));
        await ethPool.methods.grantWithdrawer(withdrawerAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted withdrawer role to " + withdrawerAddr);
    }

    DeployHelper.writeDeployLog(network);
};
