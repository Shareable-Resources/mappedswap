const DeployHelper = require("./deployHelper");

const AgentData = artifacts.require("AgentData");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    console.log("Grant access in AgentData");

    let agentDataAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<AgentData>").address;
    console.log("AgentData address is " + agentDataAddr);

    let agentData = new web3.eth.Contract(AgentData.abi, agentDataAddr);

    for (const inserterAddr of DeployHelper.config.agentData.inserters) {
        await agentData.methods.grantInserter(inserterAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted inserter role to " + inserterAddr);
    }

    for (const updaterAddr of DeployHelper.config.agentData.updaters) {
        await agentData.methods.grantUpdater(updaterAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted updater role to " + updaterAddr);
    }

    for (const approverAddr of DeployHelper.config.agentData.approvers) {
        await agentData.methods.grantApprover(approverAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted approver role to " + approverAddr);
    }
};
