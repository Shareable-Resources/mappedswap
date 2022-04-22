const DeployHelper = require("./deployHelper");
const Proxy = artifacts.require("OwnedBeaconProxy");
const Beacon = artifacts.require("UpgradeableBeacon");

const HashedKeyStorage = artifacts.require("HashedKeyStorage");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    await DeployHelper.deployWithBeacon(web3, deployer, network, accounts, Beacon, null, HashedKeyStorage, null);

    await DeployHelper.deployProxyUsingBeacon(web3, deployer, network, accounts, Proxy, "OwnedBeaconProxy<AgentStorage>", "UpgradeableBeacon<HashedKeyStorage>", HashedKeyStorage, true);
    await DeployHelper.deployProxyUsingBeacon(web3, deployer, network, accounts, Proxy, "OwnedBeaconProxy<TradeStorage>", "UpgradeableBeacon<HashedKeyStorage>", HashedKeyStorage, true);
    await DeployHelper.deployProxyUsingBeacon(web3, deployer, network, accounts, Proxy, "OwnedBeaconProxy<RelationStorage>", "UpgradeableBeacon<HashedKeyStorage>", HashedKeyStorage, true);

    // AgentStorage is the updated version of AgentData, so they use the same config
    console.log("Grant access in AgentStorage");

    let agentStorageAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<AgentStorage>").address;
    let agentStorage = new web3.eth.Contract(HashedKeyStorage.abi, agentStorageAddr);

    for (const inserterAddr of DeployHelper.config.agentData.inserters) {
        await agentStorage.methods.grantInserter(inserterAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted inserter role to " + inserterAddr);
    }

    for (const updaterAddr of DeployHelper.config.agentData.updaters) {
        await agentStorage.methods.grantUpdater(updaterAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted updater role to " + updaterAddr);
    }

    for (const approverAddr of DeployHelper.config.agentData.approvers) {
        await agentStorage.methods.grantApprover(approverAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted approver role to " + approverAddr);
    }

    // Only pool contract can insert to TradeStorage, after each trade success
    console.log("Grant access in TradeStorage");

    let tradeStorageAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<TradeStorage>").address;
    let tradeStorage = new web3.eth.Contract(HashedKeyStorage.abi, tradeStorageAddr);

    let poolAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<Pool>").address;
    await tradeStorage.methods.grantInserter(poolAddr).send(DeployHelper.callParams(accounts, deployer));
    console.log("Granted inserter role to " + poolAddr);

    DeployHelper.writeDeployLog(network);
};
