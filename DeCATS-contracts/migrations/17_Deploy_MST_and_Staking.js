const DeployHelper = require("./deployHelper");
const BeaconProxy = artifacts.require("OwnedBeaconProxy");
const Proxy = artifacts.require("OwnedUpgradeableProxy");

const MappedSwapToken = artifacts.require("MappedSwapToken");
const Staking = artifacts.require("Staking");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    let redeemWaitPeriod = DeployHelper.config.staking.redeemWaitPeriod;

    await DeployHelper.deployProxyUsingBeacon(web3, deployer, network, accounts, BeaconProxy, "OwnedBeaconProxy<MST>", "UpgradeableBeacon<MappedSwapToken>", MappedSwapToken, true, "Mapped Swap Token", "MST", 18);

    await DeployHelper.deployWithProxy(web3, deployer, network, accounts, Proxy, null, Staking, null, true, redeemWaitPeriod);
    await Staking.deployed();

    let BN = web3.utils.BN;

    let mstAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<MST>").address;
    let mst = new web3.eth.Contract(MappedSwapToken.abi, mstAddr);

    // Grant minter role
    for (const minterAddr of DeployHelper.config.tokens.minters) {
        await mst.methods.grantMinter(minterAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted minter role to " + minterAddr);
    }

    // Grant burner role
    for (const burnerAddr of DeployHelper.config.tokens.burners) {
        await mst.methods.grantBurner(burnerAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted burner role to " + burnerAddr);
    }

    if (!network.startsWith("mainnet")) {
        // Mint to specified addresses
        for (const [addr, value] of Object.entries(DeployHelper.config.tokens.mintTo["mst"])) {
            await mst.methods.mint(addr, new BN(value)).send(DeployHelper.callParams(accounts, deployer));
            console.log("MST minted " + value + " to " + addr);
        }
    }

    DeployHelper.writeDeployLog(network);
};
