const DeployHelper = require("./deployHelper");
const Proxy = artifacts.require("OwnedBeaconProxy");
const Beacon = artifacts.require("UpgradeableBeacon");

const MappedSwapToken = artifacts.require("MappedSwapToken");
const FakeV3Pool = artifacts.require("FakeV3Pool");

module.exports = async function (deployer, network, accounts) {
    // Fake contracts not for mainnet
    if (network.startsWith("mainnet")) {
        console.log("Not the correct network to deploy this script");
        return;
    }

    DeployHelper.readDeployLog(network);

    let mstAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<MST>").address;
    let ethAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<WEUN>").address;

    // Deploy some fake tokens for testing, because decimal of BTCM is different from WBTC
    // For ETH, use WEUN instead
    DeployHelper.setContract(deployer, "MST", mstAddr);
    await DeployHelper.deployProxyUsingBeacon(web3, deployer, network, accounts, Proxy, "USDC", "UpgradeableBeacon<MappedSwapToken>", MappedSwapToken, true, "Fake USD", "fUSD", 6);
    await DeployHelper.deployProxyUsingBeacon(web3, deployer, network, accounts, Proxy, "WBTC", "UpgradeableBeacon<MappedSwapToken>", MappedSwapToken, true, "Fake BTC", "fBTC", 8);
    DeployHelper.setContract(deployer, "WETH", ethAddr);

    let usdAddr = DeployHelper.getSmartContractInfoByName(deployer, "USDC").address;
    let btcAddr = DeployHelper.getSmartContractInfoByName(deployer, "WBTC").address;

    let usd = new web3.eth.Contract(MappedSwapToken.abi, usdAddr);
    let btc = new web3.eth.Contract(MappedSwapToken.abi, btcAddr);

    await usd.methods.grantMinter("0x39EB6463871040f75C89C67ec1dFCB141C3da1cf").send(DeployHelper.callParams(accounts, deployer));
    await btc.methods.grantMinter("0x39EB6463871040f75C89C67ec1dFCB141C3da1cf").send(DeployHelper.callParams(accounts, deployer));

    let BN = web3.utils.BN;

    // From mainnet WBTC/USDC 0.3% pool 0x99ac8cA7087fA4A2A1FB6357269965A2014ABc35
    // token0 is WBTC, token1 is USDC
    // Price is ~34944.86633444125 USD @ 1BTC
    let btcPrice = new BN("1481055303190183870727809886395");
    let btcTick = 58566;
    await DeployHelper.deploy(deployer, network, FakeV3Pool, "UniswapV3_WBTC_USDC_Pool", btcPrice, btcTick, btcAddr, "0xffffffffffffffffffffffffffffffffffffffff");

    // From mainnet USDC/ETH 0.3% pool 0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8
    // token0 is USDC, token1 is WETH
    // Price is ~2390.2422634081636 USD @ 1ETH
    let ethPrice = new BN("1620535775688005939564302616830260");
    let ethTick = 198528;
    await DeployHelper.deploy(deployer, network, FakeV3Pool, "UniswapV3_USDC_WETH_Pool", ethPrice, ethTick, "0x0000000000000000000000000000000000000000", ethAddr);

    DeployHelper.writeDeployLog(network);
};
