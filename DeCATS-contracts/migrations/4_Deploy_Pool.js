const DeployHelper = require("./deployHelper");
const Proxy = artifacts.require("OwnedUpgradeableProxy");

const PoolCore = artifacts.require("PoolCore");
const PoolManagement = artifacts.require("PoolManagement");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    let routerAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<RaijinSwapRouter>").address;
    let usdmAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<USDM>").address;
    let interestInterval = DeployHelper.config.mappedSwap.interestInterval;
    console.log("Router address is " + routerAddr + ", USDM address is " + usdmAddr);

    // Main contract and proxy
    await DeployHelper.deployWithProxy(web3, deployer, network, accounts, Proxy, "OwnedUpgradeableProxy<Pool>", PoolCore, null, true, routerAddr, usdmAddr, interestInterval);
    await PoolCore.deployed();

    // Management contract
    await DeployHelper.deploy(deployer, network, PoolManagement);
    let poolManagementInstance = await PoolManagement.deployed();

    console.log("Set PoolManagement to " + poolManagementInstance.address);

    let proxyAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<Pool>").address;
    let p = new web3.eth.Contract(PoolCore.abi, proxyAddr);
    await p.methods.setManagementContract(poolManagementInstance.address).send(DeployHelper.callParams(accounts, deployer));

    DeployHelper.writeDeployLog(network);
};
