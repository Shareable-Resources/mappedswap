const DeployHelper = require("./deployHelper");

const Pool = artifacts.require("IPool");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    let poolAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<Pool>").address;
    console.log("Pool address is " + poolAddr + ", grant roles for different addresses");
    let pool = new web3.eth.Contract(Pool.abi, poolAddr);

    for (const agentAddr of DeployHelper.config.mappedSwap.agents) {
        await pool.methods.grantAgent(agentAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted agent role to " + agentAddr);
    }

    for (const approverAddr of DeployHelper.config.mappedSwap.approvers) {
        await pool.methods.grantApprover(approverAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted approver role to " + approverAddr);
    }

    for (const backendAddr of DeployHelper.config.mappedSwap.backends) {
        await pool.methods.grantBackend(backendAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted backend role to " + backendAddr);
    }

    for (const managerAddr of DeployHelper.config.mappedSwap.managers) {
        await pool.methods.grantManager(managerAddr).send(DeployHelper.callParams(accounts, deployer));
        console.log("Granted manager role to " + managerAddr);
    }

    console.log("Granted all roles");
};
