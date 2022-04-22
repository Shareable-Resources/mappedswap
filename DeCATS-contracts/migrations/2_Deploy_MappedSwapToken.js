const DeployHelper = require("./deployHelper");
const Proxy = artifacts.require("OwnedBeaconProxy");
const Beacon = artifacts.require("UpgradeableBeacon");

const MappedSwapToken = artifacts.require("MappedSwapToken");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    // Tokens must be deployed first, because Pool contract needs USDM address when initialize
    await DeployHelper.deployWithBeacon(web3, deployer, network, accounts, Beacon, null, MappedSwapToken, null);

    // Deploy tokens
    await DeployHelper.deployProxyUsingBeacon(web3, deployer, network, accounts, Proxy, "OwnedBeaconProxy<USDM>", "UpgradeableBeacon<MappedSwapToken>", MappedSwapToken, true, "USD Mapped Token", "USDM", 6);
    await DeployHelper.deployProxyUsingBeacon(web3, deployer, network, accounts, Proxy, "OwnedBeaconProxy<BTCM>", "UpgradeableBeacon<MappedSwapToken>", MappedSwapToken, true, "Bitcoin Mapped Token", "BTCM", 18);
    await DeployHelper.deployProxyUsingBeacon(web3, deployer, network, accounts, Proxy, "OwnedBeaconProxy<ETHM>", "UpgradeableBeacon<MappedSwapToken>", MappedSwapToken, true, "Ethereum Mapped Token", "ETHM", 18);

    let BN = web3.utils.BN;

    let usdmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<USDM>").address;
    let btcmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<BTCM>").address;
    let ethmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<ETHM>").address;
    let usdm = new web3.eth.Contract(MappedSwapToken.abi, usdmAddr);
    let btcm = new web3.eth.Contract(MappedSwapToken.abi, btcmAddr);
    let ethm = new web3.eth.Contract(MappedSwapToken.abi, ethmAddr);

    // Grant minter role
    for (const minterAddr of DeployHelper.config.tokens.minters) {
        await usdm.methods.grantMinter(minterAddr).send(DeployHelper.callParams(accounts, deployer));
        await btcm.methods.grantMinter(minterAddr).send(DeployHelper.callParams(accounts, deployer));
        await ethm.methods.grantMinter(minterAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted minter role to " + minterAddr);
    }

    // Grant burner role
    for (const burnerAddr of DeployHelper.config.tokens.burners) {
        await usdm.methods.grantBurner(burnerAddr).send(DeployHelper.callParams(accounts, deployer));
        await btcm.methods.grantBurner(burnerAddr).send(DeployHelper.callParams(accounts, deployer));
        await ethm.methods.grantBurner(burnerAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted burner role to " + burnerAddr);
    }

    if (!network.startsWith("mainnet")) {
        // Mint to specified addresses
        for (const [addr, value] of Object.entries(DeployHelper.config.tokens.mintTo["usdm"])) {
            await usdm.methods.mint(addr, new BN(value)).send(DeployHelper.callParams(accounts, deployer));
            console.log("USDM minted " + value + " to " + addr);
        }

        for (const [addr, value] of Object.entries(DeployHelper.config.tokens.mintTo["btcm"])) {
            await btcm.methods.mint(addr, new BN(value)).send(DeployHelper.callParams(accounts, deployer));
            console.log("BTCM minted " + value + " to " + addr);
        }

        for (const [addr, value] of Object.entries(DeployHelper.config.tokens.mintTo["ethm"])) {
            await ethm.methods.mint(addr, new BN(value)).send(DeployHelper.callParams(accounts, deployer));
            console.log("ETHM minted " + value + " to " + addr);
        }
    }

    DeployHelper.writeDeployLog(network);
};
