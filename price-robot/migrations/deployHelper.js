const fs = require("fs");
let smartContractMap = {};

module.exports.smartContractMap = smartContractMap;

module.exports.deploy = async function (deployer, contract, contractNameOverride, ...args) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    await deployer.deploy(contract, ...args);
    let instance = await contract.deployed();
    let contractName = contractNameOverride ?? contract.contractName;
    this.smartContractMap[deployer.network_id]["smartContract"][contractName] = { address: instance.address };
}

module.exports.deployWithProxy = async function (web3, deployer, network, accounts, proxyContract, proxyNameOverride, contract, contractNameOverride, callInitialize, ...args) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    await deployer.deploy(contract);
    let instance = await contract.deployed();
    let contractName = contractNameOverride ?? contract.contractName;
    this.smartContractMap[deployer.network_id]["smartContract"][contractName] = { address: instance.address };

    await deployer.deploy(proxyContract, instance.address, []);
    let proxyInstance = await proxyContract.deployed();
    let proxyName = proxyNameOverride ?? proxyContract.contractName + "<" + contractName + ">";
    this.smartContractMap[deployer.network_id]["smartContract"][proxyName] = { address: proxyInstance.address };

    if (!callInitialize) {
        return;
    }

    console.log("Call initialize(" + args.join(", ") + ")");
    let c = new web3.eth.Contract(contract.abi, proxyInstance.address);
    await c.methods.initialize(...args).send(this.callParams(accounts, deployer));
}

module.exports.deployAndUpgradeProxy = async function (web3, deployer, network, accounts, proxyContract, proxyNameOverride, contract, contractNameOverride) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    await deployer.deploy(contract);
    let instance = await contract.deployed();
    let contractName = contractNameOverride ?? contract.contractName;
    this.smartContractMap[deployer.network_id]["smartContract"][contractName] = { address: instance.address };

    let proxyName = proxyNameOverride ?? proxyContract.contractName + "<" + contractName + ">";
    let proxyAddress = this.smartContractMap[deployer.network_id]["smartContract"][proxyName].address;

    console.log("Upgrade " + proxyName + " to " + instance.address);

    let p = new web3.eth.Contract(proxyContract.abi, proxyAddress);
    await p.methods.upgradeTo(instance.address).send(this.callParams(accounts, deployer));
}

module.exports.deployWithBeacon = async function (web3, deployer, network, accounts, beaconContract, beaconNameOverride, contract, contractNameOverride) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    await deployer.deploy(contract);
    let instance = await contract.deployed();
    let contractName = contractNameOverride ?? contract.contractName;
    this.smartContractMap[deployer.network_id]["smartContract"][contractName] = { address: instance.address };

    await deployer.deploy(beaconContract, instance.address);
    let beaconInstance = await beaconContract.deployed();
    let beaconName = beaconNameOverride ?? beaconContract.contractName + "<" + contractName + ">";
    this.smartContractMap[deployer.network_id]["smartContract"][beaconName] = { address: beaconInstance.address };
}

module.exports.deployProxyUsingBeacon = async function (web3, deployer, network, accounts, proxyContract, proxyName, beaconName, contract, callInitialize, ...args) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    let beaconAddress = this.smartContractMap[deployer.network_id]["smartContract"][beaconName].address;
    await deployer.deploy(proxyContract, beaconAddress, []);
    let proxyInstance = await proxyContract.deployed();
    this.smartContractMap[deployer.network_id]["smartContract"][proxyName] = { address: proxyInstance.address };

    if (!callInitialize) {
        return;
    }

    console.log("Call initialize(" + args.join(", ") + ")");
    let c = new web3.eth.Contract(contract.abi, proxyInstance.address);
    await c.methods.initialize(...args).send(this.callParams(accounts, deployer));
}

module.exports.deployAndUpgradeBeacon = async function (web3, deployer, network, accounts, beaconContract, beaconNameOverride, contract, contractNameOverride) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    await deployer.deploy(contract);
    let instance = await contract.deployed();
    let contractName = contractNameOverride ?? contract.contractName;
    this.smartContractMap[deployer.network_id]["smartContract"][contractName] = { address: instance.address };

    let beaconName = beaconNameOverride ?? beaconContract.contractName + "<" + contractName + ">";
    let beaconAddress = this.smartContractMap[deployer.network_id]["smartContract"][beaconName].address;

    console.log("Upgrade " + beaconName + " to " + instance.address);

    let b = new web3.eth.Contract(beaconContract.abi, beaconAddress);
    await b.methods.upgradeTo(instance.address).send(this.callParams(accounts, deployer));
}

module.exports.getSmartContractInfoByName = function (deployer, contractName) {
    return this.smartContractMap[deployer.network_id]["smartContract"][contractName];
}

module.exports.callParams = function (accounts, deployer) {
    return {
        from: accounts[0],
        gas: 5000000,
        gasPrice: deployer.networks[deployer.network].gasPrice,
    };
}

module.exports.readDeployLog = function (envName) {
    try {
        let filename = "SmartContractDeploy";
        if (envName || envName === 0 || envName === false) {
            filename += "." + envName;
        }

        var rawData = fs.readFileSync(filename + ".json");
        if (rawData.length > 0) {
            this.smartContractMap = JSON.parse(rawData);
        }
    } catch (ex) {
        console.log("readDeployLog: " + ex);
    }
}

module.exports.writeDeployLog = function (envName) {
    let jsonStr = JSON.stringify(this.smartContractMap, null, 4);

    let filename = "SmartContractDeploy";
    if (envName || envName === 0 || envName === false) {
        filename += "." + envName;
    }

    fs.writeFileSync(filename + ".json", jsonStr);
}
