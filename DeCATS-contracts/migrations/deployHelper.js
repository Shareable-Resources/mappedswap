const fs = require("fs");
const { spawnSync } = require("child_process");

const MultiSigOwner = require("../build/contracts/MultiSigOwner.json");

let smartContractMap = {};
let config = {};

let deployThenVerify = async function (deployer, network, contract, ...args) {
    await deployer.deploy(contract, ...args);

    if (!this.verifyContract) {
        return;
    }

    if (network != "dev_rinkeby" && network != "testnet_rinkeby" && network != "mainnet_ethereum") {
        console.log("Contract verification is only for Ethereum mainnet and testnet");
        return;
    }

    let instance = await contract.deployed();

    console.log();
    console.log(`*** Before verify contract, wait ${this.waitBeforeVerifyMs}ms so that ContractCode can be located ***`);
    console.log("*** If verification fails, you can run this command manually later ***");
    console.log(`truffle run verify ${contract.contractName}@${instance.address} --network ${network}`);
    await new Promise(resolve => {
        setTimeout(resolve, this.waitBeforeVerifyMs);
    });

    console.log();
    console.log("Running contract verification");
    let p = spawnSync("truffle", ["run", "verify", `${contract.contractName}@${instance.address}`, "--network", network]);
    console.log(`${p.stdout}`);
};

let parseSubmitEvents = function (events) {
    let submittedIDs = getTransactionIds(events.Submission);
    let executedIDs = getTransactionIds(events.Execution);
    let failedIDs = getTransactionIds(events.ExecutionFailure);

    console.log();
    console.log(`*** Following transactionId(s) is(are) submitted:`)
    console.log(`*** ${submittedIDs.join(" ")}`);

    if (executedIDs.length != 0) {
        console.log(`*** Following transactionId(s) is(are) executed:`);
        console.log(`*** ${executedIDs.join(" ")}`);
    }

    if (failedIDs.length != 0) {
        console.warn(`*** Following transactionId(s) is(are) executed but failed:`);
        console.warn(`*** ${failedIDs.join(" ")}`);
    }

    if (submittedIDs.length == executedIDs.length) {
        console.log(`*** All transactions are executed`);
    } else {
        console.log(`*** Not all transactions are executed, you may need to check the reason`);
        console.log(`*** (Required signatures > 1?)`);
    }

    console.log();
};

let getTransactionIds = function (event) {
    let ret = [];
    if (event != undefined) {
        if (Array.isArray(event)) {
            ret = event.map(s => s.returnValues.transactionId);
        } else {
            ret.push(event.returnValues.transactionId);
        }
    }
    return ret;
};

module.exports.smartContractMap = smartContractMap;
module.exports.config = config;
module.exports.verifyContract = false;
module.exports.waitBeforeVerifyMs = 60000;

module.exports.setContract = function (deployer, contractName, address) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    this.smartContractMap[deployer.network_id]["smartContract"][contractName] = { address: address };
}

module.exports.deploy = async function (deployer, network, contract, contractNameOverride, ...args) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    await deployThenVerify.call(this, deployer, network, contract, ...args);
    let instance = await contract.deployed();
    let contractName = contractNameOverride ?? contract.contractName;
    this.smartContractMap[deployer.network_id]["smartContract"][contractName] = { address: instance.address };
}

module.exports.deployWithProxy = async function (web3, deployer, network, accounts, proxyContract, proxyNameOverride, contract, contractNameOverride, callInitialize, ...args) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    await deployThenVerify.call(this, deployer, network, contract);
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

    await deployThenVerify.call(this, deployer, network, contract);
    let instance = await contract.deployed();
    let contractName = contractNameOverride ?? contract.contractName;
    this.smartContractMap[deployer.network_id]["smartContract"][contractName] = { address: instance.address };

    let proxyName = proxyNameOverride ?? proxyContract.contractName + "<" + contractName + ">";
    let proxyAddress = this.smartContractMap[deployer.network_id]["smartContract"][proxyName].address;

    console.log("Upgrade " + proxyName + " to " + instance.address);

    let p = new web3.eth.Contract(proxyContract.abi, proxyAddress);
    await p.methods.upgradeTo(instance.address).send(this.callParams(accounts, deployer));
}

module.exports.deployAndUpgradeProxyMultiSig = async function (web3, deployer, network, accounts, proxyContract, proxyNameOverride, contract, contractNameOverride) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    await deployThenVerify.call(this, deployer, network, contract);
    let instance = await contract.deployed();
    let contractName = contractNameOverride ?? contract.contractName;
    this.smartContractMap[deployer.network_id]["smartContract"][contractName] = { address: instance.address };

    let proxyName = proxyNameOverride ?? proxyContract.contractName + "<" + contractName + ">";
    let proxyAddress = this.smartContractMap[deployer.network_id]["smartContract"][proxyName].address;

    console.log("Upgrade " + proxyName + " to " + instance.address);

    let p = new web3.eth.Contract(proxyContract.abi, proxyAddress);
    let multiSigAddr = await p.methods.admin().call();

    let m = new web3.eth.Contract(MultiSigOwner.abi, multiSigAddr);
    let receipt = await m.methods.submitProxyUpgradeTo(proxyAddress, instance.address).send(this.callParams(accounts, deployer));
    parseSubmitEvents(receipt.events);
}

module.exports.deployWithBeacon = async function (web3, deployer, network, accounts, beaconContract, beaconNameOverride, contract, contractNameOverride) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    await deployThenVerify.call(this, deployer, network, contract);
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

    await deployThenVerify.call(this, deployer, network, contract);
    let instance = await contract.deployed();
    let contractName = contractNameOverride ?? contract.contractName;
    this.smartContractMap[deployer.network_id]["smartContract"][contractName] = { address: instance.address };

    let beaconName = beaconNameOverride ?? beaconContract.contractName + "<" + contractName + ">";
    let beaconAddress = this.smartContractMap[deployer.network_id]["smartContract"][beaconName].address;

    console.log("Upgrade " + beaconName + " to " + instance.address);

    let b = new web3.eth.Contract(beaconContract.abi, beaconAddress);
    await b.methods.upgradeTo(instance.address).send(this.callParams(accounts, deployer));
}

module.exports.deployAndUpgradeBeaconMultiSig = async function (web3, deployer, network, accounts, beaconContract, beaconNameOverride, contract, contractNameOverride) {
    !(deployer.network_id in this.smartContractMap) && (this.smartContractMap[deployer.network_id] = { "smartContract": {} });

    await deployThenVerify.call(this, deployer, network, contract);
    let instance = await contract.deployed();
    let contractName = contractNameOverride ?? contract.contractName;
    this.smartContractMap[deployer.network_id]["smartContract"][contractName] = { address: instance.address };

    let beaconName = beaconNameOverride ?? beaconContract.contractName + "<" + contractName + ">";
    let beaconAddress = this.smartContractMap[deployer.network_id]["smartContract"][beaconName].address;

    console.log("Upgrade " + beaconName + " to " + instance.address);

    let b = new web3.eth.Contract(beaconContract.abi, beaconAddress);
    let multiSigAddr = await b.methods.owner().call();

    let m = new web3.eth.Contract(MultiSigOwner.abi, multiSigAddr);
    let receipt = await m.methods.submitProxyUpgradeTo(beaconAddress, instance.address).send(this.callParams(accounts, deployer));
    parseSubmitEvents(receipt.events);
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
        let configFilename = "DeployConfig";
        if (envName || envName === 0 || envName === false) {
            filename += "." + envName;
            configFilename += "." + envName;
        }

        var rawData = fs.readFileSync(filename + ".json");
        if (rawData.length > 0) {
            this.smartContractMap = JSON.parse(rawData);
        }

        var configRawData = fs.readFileSync(configFilename + ".json");
        if (configRawData.length > 0) {
            this.config = JSON.parse(configRawData);
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

module.exports.supportsInterface = async function (web3, contractAddress, interfaceID) {
    try {
        let erc165 = new web3.eth.Contract([
            {
                "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }],
                "name": "supportsInterface",
                "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
                "stateMutability": "view",
                "type": "function"
            }
        ], contractAddress);
        if (await erc165.methods.supportsInterface("0x01ffc9a7").call() == false) {
            return false;
        }
        if (await erc165.methods.supportsInterface("0xffffffff").call() == true) {
            return false;
        }
        return await erc165.methods.supportsInterface(interfaceID).call();
    } catch {
        return false;
    }
}
