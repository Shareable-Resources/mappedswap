const DeployHelper = require("./deployHelper");

const Staking = artifacts.require("Staking");

module.exports = async function (deployer, network, accounts) {
    DeployHelper.readDeployLog(network);

    let stakingAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedUpgradeableProxy<Staking>").address;
    console.log("Staking address is " + stakingAddr);

    let staking = new web3.eth.Contract(Staking.abi, stakingAddr);

    let mstAddr = DeployHelper.getSmartContractInfoByName(deployer, "OwnedBeaconProxy<MST>").address;

    await staking.methods.setTokenStakeability(mstAddr, true).send(DeployHelper.callParams(accounts, deployer));
};
