// All transactions are made by this private key
// If CurrentOwner is EOA, this must be private key of it
// If CurrentOwner is MultiSigOwner, this private key must be one of the owner of it
const MyPrivateKey = "5555fe01770a5c6dc621f00465e6a0f76bbd4bc1edbde5f2c380fcb00f354b99";
const CurrentOwner = "0xE8DBeB1D45046e4506f43571AC9170C441c228E3";
const CurrentOwnerIsMultiSig = false;

// If new owner is EOA, enter public key and address here
// If new owner is MultiSigOwner, enter its address here
// And set the corresponding bool
// The script will verify them before calling any function
// (Comment the verification code if you do not need this verification)
const NewMappedSwapProxyOwnerPublicKey = "{publicKey}";
const NewMappedSwapProxyOwner = "0xbf33Ece1A46a8237E97547A92c3c3f21daF3Da3D";
const NewMappedSwapProxyOwnerIsMultiSig = true;

const NewMappedSwapOwnerPublicKey = "{publicKey}";
const NewMappedSwapOwner = "0xbf33Ece1A46a8237E97547A92c3c3f21daF3Da3D";
const NewMappedSwapOwnerIsMultiSig = true;

const NewRaijinSwapProxyOwnerPublicKey = "{publicKey}";
const NewRaijinSwapProxyOwner = "0xB85a8C50CE1d7ada99a3FCfF4eA79A84EdeB9308";
const NewRaijinSwapProxyOwnerIsMultiSig = true;

const NewRaijinSwapOwnerPublicKey = "{publicKey}";
const NewRaijinSwapOwner = "0xB85a8C50CE1d7ada99a3FCfF4eA79A84EdeB9308";
const NewRaijinSwapOwnerIsMultiSig = true;

// DEV
const network = "2021";
const rpcUrl = "http://13.228.169.25:8545";
const SmartContractDeploy = require("../SmartContractDeploy.dev.json");

// TESTNET
// const network = "1984";
// const rpcUrl = "https://testnet.eurus.network";
// const SmartContractDeploy = require("../SmartContractDeploy.testnet.json");

// MAINNET
// const network = "1008";
// const rpcUrl = "https://mainnet.eurus.network";
// const SmartContractDeploy = require("../SmartContractDeploy.mainnet.json");

// Some functions are common in different ABIs, so no need to import all
const IOwnable = require("../build/contracts/IOwnable.json");
const IPool = require("../build/contracts/IPool.json");
const IRaijinSwapFactory = require("../build/contracts/IRaijinSwapFactory.json");
const OwnedUpgradeableProxy = require("../build/contracts/OwnedUpgradeableProxy.json");
const MultiSigOwner = require("../build/contracts/MultiSigOwner.json");

const Utils = require("ethereumjs-util");
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Readline = require("readline-sync");
const Solidity = require("@ethersproject/solidity");

let web3 = new Web3(new HDWalletProvider({ privateKeys: [MyPrivateKey], providerOrUrl: rpcUrl }));
let account = web3.eth.accounts.privateKeyToAccount(MyPrivateKey);
let myAddr = account.address;

class Contract {
    constructor(contractName, address) {
        this.contractName = contractName;
        this.address = address == undefined ? SmartContractDeploy[network].smartContract[contractName].address : address;
    }

    async admin() {
        let instance = new web3.eth.Contract(OwnedUpgradeableProxy.abi, this.address);
        return instance.methods.admin().call();
    }

    async changeAdmin(newAdmin) {
        let instance = new web3.eth.Contract(OwnedUpgradeableProxy.abi, this.address);
        await instance.methods.changeAdmin(newAdmin).send({ from: myAddr });
    }

    async owner() {
        let instance = new web3.eth.Contract(IOwnable.abi, this.address);
        return instance.methods.owner().call();
    }

    async transferOwnership(newOwner) {
        let instance = new web3.eth.Contract(IOwnable.abi, this.address);
        await instance.methods.transferOwnership(newOwner).send({ from: myAddr });
    }

    async getManagers() {
        let instance = new web3.eth.Contract(IPool.abi, this.address);
        return instance.methods.getManagers().call();
    }

    async transferManager(newManager) {
        let instance = new web3.eth.Contract(IPool.abi, this.address);
        await instance.methods.revokeManager(CurrentOwner).send({ from: myAddr });
        await instance.methods.grantManager(newManager).send({ from: myAddr });
    }

    async getDeployers() {
        let instance = new web3.eth.Contract(IPool.abi, this.address);
        return instance.methods.getDeployers().call();
    }

    async transferDeployer(newDeployer) {
        let instance = new web3.eth.Contract(IPool.abi, this.address);
        await instance.methods.revokeDeployer(CurrentOwner).send({ from: myAddr });
        await instance.methods.grantDeployer(newDeployer).send({ from: myAddr });
    }

    async feeToSetter() {
        let instance = new web3.eth.Contract(IRaijinSwapFactory.abi, this.address);
        return instance.methods.feeToSetter().call();
    }

    async setFeeToSetter(newFeeToSetter) {
        let instance = new web3.eth.Contract(IRaijinSwapFactory.abi, this.address);
        await instance.methods.setFeeToSetter(newFeeToSetter).send({ from: myAddr });
    }

    async supportsInterface(interfaceID) {
        try {
            let instance = new web3.eth.Contract(MultiSigOwner.abi, this.address);
            if (await instance.methods.supportsInterface("0x01ffc9a7").call() == false) {
                return false;
            }
            if (await instance.methods.supportsInterface("0xffffffff").call() == true) {
                return false;
            }
            return await instance.methods.supportsInterface(interfaceID).call();
        } catch {
            return false;
        }
    }

    async isOwner(userAddress) {
        let instance = new web3.eth.Contract(MultiSigOwner.abi, this.address);
        return await instance.methods.isOwner(userAddress).call();
    }

    async submitProxyChangeAdmins(proxies, newAdmin) {
        let instance = new web3.eth.Contract(MultiSigOwner.abi, this.address);
        let receipt = await instance.methods.submitProxyChangeAdmins(proxies, newAdmin).send({ from: myAddr });
        this.parseSubmitEvents(receipt.events);
    }

    async submitTransferOwnerships(contractAddresses, newOwner) {
        let instance = new web3.eth.Contract(MultiSigOwner.abi, this.address);
        let receipt = await instance.methods.submitTransferOwnerships(contractAddresses, newOwner).send({ from: myAddr });
        this.parseSubmitEvents(receipt.events);
    }

    async submitGrantRoles(contractAddress, role, accounts) {
        let instance = new web3.eth.Contract(MultiSigOwner.abi, this.address);
        let receipt = await instance.methods.submitGrantRoles(contractAddress, role, accounts).send({ from: myAddr });
        this.parseSubmitEvents(receipt.events);
    }

    async submitRevokeRoles(contractAddress, role, accounts) {
        let instance = new web3.eth.Contract(MultiSigOwner.abi, this.address);
        let receipt = await instance.methods.submitRevokeRoles(contractAddress, role, accounts).send({ from: myAddr });
        this.parseSubmitEvents(receipt.events);
    }

    async submitTransaction(contractAddress, value, data) {
        let instance = new web3.eth.Contract(MultiSigOwner.abi, this.address);
        let receipt = await instance.methods.submitTransaction(contractAddress, value, data).send({ from: myAddr });
        this.parseSubmitEvents(receipt.events);
    }

    parseSubmitEvents(events) {
        let submittedIDs = this.getTransactionIds(events.Submission);
        let executedIDs = this.getTransactionIds(events.Execution);
        let failedIDs = this.getTransactionIds(events.ExecutionFailure);

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
    }

    getTransactionIds(event) {
        let ret = [];
        if (event != undefined) {
            if (Array.isArray(event)) {
                ret = event.map(s => s.returnValues.transactionId);
            } else {
                ret.push(event.returnValues.transactionId);
            }
        }
        return ret;
    }
}

let ContractOf = function (contractName) {
    return new Contract(contractName);
};

// ERC20 tokens
let weun = ContractOf("OwnedUpgradeableProxy<WEUN>");
let usdm = ContractOf("OwnedBeaconProxy<USDM>");
let btcm = ContractOf("OwnedBeaconProxy<BTCM>");
let ethm = ContractOf("OwnedBeaconProxy<ETHM>");
let mst = ContractOf("OwnedBeaconProxy<MST>");

// Raijin Swap
let factory = ContractOf("OwnedUpgradeableProxy<RaijinSwapFactory>");
let router = ContractOf("OwnedUpgradeableProxy<RaijinSwapRouter>");

// Mapped Swap
let pool = ContractOf("OwnedUpgradeableProxy<Pool>");
let priceAdjust = ContractOf("OwnedUpgradeableProxy<PriceAdjust>");
let payout = ContractOf("OwnedUpgradeableProxy<Payout>");
let agentData = ContractOf("OwnedUpgradeableProxy<AgentData>");
let staking = ContractOf("OwnedUpgradeableProxy<Staking>");

// Beacons
let tokenBeacon = ContractOf("UpgradeableBeacon<MappedSwapToken>");

// Liquidity mining pools, which are deployed on Ethereum, uncomment and add your code if need to change
let poolBeacon = ContractOf("UpgradeableBeacon<MiningPool>");
let usdPool = ContractOf("OwnedBeaconProxy<USDMiningPool>");
let btcPool = ContractOf("OwnedBeaconProxy<BTCMiningPool>");
let ethPool = ContractOf("OwnedBeaconProxy<ETHMiningPool>");

let doForAll = async function (array, predicate, whenTrue, whenFalse) {
    if (predicate == undefined) {
        return;
    }

    for (let item of array) {
        if (await predicate(item)) {
            await (whenTrue != undefined ? whenTrue(item) : Promise.resolve());
        } else {
            await (whenFalse != undefined ? whenFalse(item) : Promise.resolve());
        }
    }
};

let isAdmin = async function (contract) {
    let admin = await contract.admin();
    if (admin != CurrentOwner) {
        console.warn(`Admin of ${contract.contractName} is ${admin}`);
        return false;
    }
    return true;
};

let isOwner = async function (contract) {
    let owner = await contract.owner();
    if (owner != CurrentOwner) {
        console.warn(`Owner of ${contract.contractName} is ${owner}`);
        return false;
    }
    return true;
};

let canTransferManager = async function (contract) {
    let owner = await contract.owner();
    if (owner != CurrentOwner) {
        console.warn(`Not the owner of ${contract.contractName}, cannot transfer manager role`);
        return false;
    }

    return true;
};

let canTransferDeployer = async function (contract) {
    let owner = await contract.owner();
    if (owner != CurrentOwner) {
        console.warn(`Not the owner of ${contract.contractName}, cannot transfer deployer role`);
        return false;
    }

    return true;
};

let isFeeToSetter = async function (contract) {
    let owner = await contract.feeToSetter();
    if (owner != CurrentOwner) {
        console.warn(`FeeToSetter of ${contract.contractName} is ${owner}`);
        return false;
    }
    return true;
};

let changeAdmin = async function (contract, newAdmin) {
    await contract.changeAdmin(newAdmin);
    console.info(`Changed admin of ${contract.contractName} to ${newAdmin}`);
};

let transferOwnership = async function (contract, newOwner) {
    await contract.transferOwnership(newOwner);
    console.info(`Transferred ownership of ${contract.contractName} to ${newOwner}`);
};

let transferManager = async function (contract, newManager) {
    await contract.transferManager(newManager);
    console.info(`Transferred manager role of ${contract.contractName} to ${newManager}`);
};

let transferDeployer = async function (contract, newDeployer) {
    await contract.transferDeployer(newDeployer);
    console.info(`Transferred deployer role of ${contract.contractName} to ${newDeployer}`);
};

let setFeeToSetter = async function (contract, newFeeToSetter) {
    await contract.setFeeToSetter(newFeeToSetter);
    console.info(`Set feeToSetter of ${contract.contractName} to ${newFeeToSetter}`);
};

let isMultiSigOwnerContract = async function (contract) {
    // 0xc6427474 = bytes4(keccak256("submitTransaction(address,uint256,bytes)"))
    // 0xc01a8c84 = bytes4(keccak256("confirmTransaction(uint256)"))
    // 0x20ea8d86 = bytes4(keccak256("revokeConfirmation(uint256)"))
    // 0xee22610b = bytes4(keccak256("executeTransaction(uint256)"))
    // 0xc890147d = 0xc6427474 ^ 0xc01a8c84 ^ 0x20ea8d86 ^ 0xee22610b
    return await contract.supportsInterface("0xc890147d");
};

let isOwnerOfMultiSig = async function (multiSig, userAddress) {
    return await multiSig.isOwner(userAddress);
};

let submitProxyChangeAdmins = async function (multiSig, proxyContracts, newAdmin) {
    if (proxyContracts.length == 0) {
        return;
    }
    await multiSig.submitProxyChangeAdmins(proxyContracts.map(c => c.address), newAdmin);
    for (const c of proxyContracts) {
        console.info(`Completed submit changeAdmin of ${c.contractName} to ${newAdmin}`);
    }
};

let submitTransferOwnerships = async function (multiSig, contracts, newOwner) {
    if (contracts.length == 0) {
        return;
    }
    await multiSig.submitTransferOwnerships(contracts.map(c => c.address), newOwner);
    for (const c of contracts) {
        console.info(`Completed submit transferOwnership of ${c.contractName} to ${newOwner}`);
    }
};

let submitTransferRoles = async function (multiSig, contracts, role, account) {
    if (contracts.length == 0) {
        return;
    }
    let roleHash = Solidity.keccak256(["string"], [role]);
    for (const c of contracts) {
        await multiSig.submitRevokeRoles(c.address, roleHash, [CurrentOwner]);
        await multiSig.submitGrantRoles(c.address, roleHash, [account]);
        console.info(`Completed submit revokeRole and grantRole ${role} of ${c.contractName} to ${account}`);
    }
}

let submitSetFeeToSetter = async function (multiSig, contracts, newFeeToSetter) {
    if (contracts.length == 0) {
        return;
    }
    for (const c of contracts) {
        let signature = Buffer.from("a2e74af6", "hex");
        let buf = Buffer.alloc(32);
        let addr = Buffer.from(newFeeToSetter.slice(2), "hex");
        addr.copy(buf, 12);
        let data = Utils.bufferToHex(Buffer.concat([signature, buf]));
        await multiSig.submitTransaction(c.address, 0, data);
        console.info(`Completed submit setFeeToSetter of ${c.contractName} to ${newFeeToSetter}`);
    }
}

let skip = async function (contract) {
    console.log(`Skip processing ${contract.contractName}`);
};

let printHeader = function (msg) {
    let line = "-".repeat(msg.length + 4);
    console.info();
    console.info(line);
    console.info(`| ${msg} |`);
    console.info(line);
    console.info();
};

let currentOwnerChecking = async function () {
    if (CurrentOwnerIsMultiSig) {
        let contract = new Contract("MultiSigOwner", CurrentOwner);

        if (!await isMultiSigOwnerContract(contract)) {
            console.error(`Cannot find required interface in address ${CurrentOwner}`);
            process.exit(-6);
        }

        if (!await isOwnerOfMultiSig(contract, myAddr)) {
            console.error(`You are not one of the owner in contract ${CurrentOwner}!`);
            process.exit(-7);
        }
    } else {
        if (myAddr.toLowerCase() != CurrentOwner.toLowerCase()) {
            console.error(`Address from private key = ${myAddr}`);
            console.error(`Current owner address    = ${CurrentOwner}`);
            console.error(`You are not current owner!`);
            process.exit(-5);
        }
    }
};

let newOwnerChecking = async function () {
    // New owners must be either EOA or MultiSigOwner
    // For EOA check its public key to make sure it is correct
    // MultiSigOwner should implement ERC165 and check the corresponding interface id
    let pubKeys = [];
    let expected = [];
    let multiSigs = [];

    if (!NewMappedSwapProxyOwnerIsMultiSig) {
        pubKeys.push(NewMappedSwapProxyOwnerPublicKey);
        expected.push(NewMappedSwapProxyOwner);
    } else {
        multiSigs.push(NewMappedSwapProxyOwner);
    }

    if (!NewMappedSwapOwnerIsMultiSig) {
        pubKeys.push(NewMappedSwapOwnerPublicKey);
        expected.push(NewMappedSwapOwner);
    } else {
        multiSigs.push(NewMappedSwapOwner);
    }

    if (!NewRaijinSwapProxyOwnerIsMultiSig) {
        pubKeys.push(NewRaijinSwapProxyOwnerPublicKey);
        expected.push(NewRaijinSwapProxyOwner);
    } else {
        multiSigs.push(NewRaijinSwapProxyOwner);
    }

    if (!NewRaijinSwapOwnerIsMultiSig) {
        pubKeys.push(NewRaijinSwapOwnerPublicKey);
        expected.push(NewRaijinSwapOwner);
    } else {
        multiSigs.push(NewRaijinSwapOwner);
    }

    // Compare address from public and expected value
    pubKeys.forEach((publicKey, index) => {
        let ex = expected[index];

        if (CurrentOwner.toLowerCase() == ex.toLowerCase()) {
            console.error(`Current owner address = ${CurrentOwner}`);
            console.error(`New owner address     = ${ex}`);
            console.error(`You are going to transfer ownership to yourself!`);
            process.exit(-2);
        }

        let pubBuf = Buffer.from(publicKey, "hex");
        let addrBuf = Utils.publicToAddress(pubBuf);
        let addr = Utils.bufferToHex(addrBuf);

        if (addr.toLowerCase() != ex.toLowerCase()) {
            console.error(`Owner address expected  = ${ex}`);
            console.error(`Address from public key = ${addr}`);
            console.error(`To prevent loss of ownership, stop any further processes`);
            process.exit(-3);
        }
    });

    // Check if all contracts are really MultiSigOwner
    multiSigs = [...new Set(multiSigs)];
    for (const multiSig of multiSigs) {
        if (CurrentOwner.toLowerCase() == multiSig.toLowerCase()) {
            console.error(`Current owner address = ${CurrentOwner}`);
            console.error(`New owner address     = ${multiSig}`);
            console.error(`You are going to transfer ownership to yourself!`);
            process.exit(-2);
        }

        let contract = new Contract("MultiSigOwner", multiSig);

        if (!await isMultiSigOwnerContract(contract)) {
            console.error(`Cannot find required interface in address ${multiSig}`);
            console.error(`To prevent loss of ownership, stop any further processes`);
            process.exit(-3);
        }
    }
};

(async () => {

    await currentOwnerChecking();
    await newOwnerChecking();

    // ================================================================

    console.info(`***`);
    console.info(`*** Network settings:`, { "network": network, "rpcUrl": rpcUrl });
    console.info(`***`);
    console.info(`*** All transactions will be sent by your address ${myAddr}`);
    console.info(`***`);
    console.info(`*** Current owner address:`);
    console.info(`*** ${CurrentOwner} (${CurrentOwnerIsMultiSig ? "MultiSigOwner" : "EOA"})`);
    console.info(`*** If it is the owner of a contract, transfer ownership to new address; otherwise skip processing of that contract`);
    console.info(`***`);
    console.info(`*** You are going to change:`);
    console.info(`*** New Mapped Swap proxy owner = ${NewMappedSwapProxyOwner} (${NewMappedSwapProxyOwnerIsMultiSig ? "MultiSigOwner" : "EOA"})`);
    console.info(`*** New Mapped Swap owner       = ${NewMappedSwapOwner} (${NewMappedSwapOwnerIsMultiSig ? "MultiSigOwner" : "EOA"})`);
    console.info(`*** New Raijin Swap proxy owner = ${NewRaijinSwapProxyOwner} (${NewRaijinSwapProxyOwnerIsMultiSig ? "MultiSigOwner" : "EOA"})`);
    console.info(`*** New Raijin Swap owner       = ${NewRaijinSwapOwner} (${NewRaijinSwapOwnerIsMultiSig ? "MultiSigOwner" : "EOA"})`);

    if (Readline.question("*** Enter [Y] to continue: ").toLowerCase() != "y") {
        process.exit(-1);
    }

    // ================================================================

    printHeader(`Change Mapped Swap contracts proxy admin to ${NewMappedSwapProxyOwner}`);

    let mappedSwapProxies = [usdm, btcm, ethm, mst, pool, priceAdjust, payout, agentData, staking, usdPool, btcPool, ethPool];
    let mappedSwapBeacons = [tokenBeacon, poolBeacon];

    if (CurrentOwnerIsMultiSig) {
        let contract = new Contract("MultiSigOwner", CurrentOwner);

        let proxyContracts = [];
        await doForAll(mappedSwapProxies, isAdmin, c => { proxyContracts.push(c) }, skip);
        await submitProxyChangeAdmins(contract, proxyContracts, NewMappedSwapProxyOwner);

        let beaconContracts = [];
        await doForAll(mappedSwapBeacons, isOwner, c => { beaconContracts.push(c) }, skip);
        await submitTransferOwnerships(contract, beaconContracts, NewMappedSwapProxyOwner);
    } else {
        // OwnedUpgradeableProxy and OwnedBeaconProxy
        await doForAll(mappedSwapProxies, isAdmin, async c => changeAdmin(c, NewMappedSwapProxyOwner), skip);

        // UpgradeableBeacon
        await doForAll(mappedSwapBeacons, isOwner, async c => transferOwnership(c, NewMappedSwapProxyOwner), skip);
    }

    // ================================================================

    printHeader(`Change Raijin Swap contracts proxy admin to ${NewRaijinSwapProxyOwner}`);

    let raijinSwapProxies = [weun, factory, router];

    if (CurrentOwnerIsMultiSig) {
        let contract = new Contract("MultiSigOwner", CurrentOwner);

        let proxyContracts = [];
        await doForAll(raijinSwapProxies, isAdmin, c => { proxyContracts.push(c) }, skip);
        await submitProxyChangeAdmins(contract, proxyContracts, NewRaijinSwapProxyOwner);
    } else {
        await doForAll(raijinSwapProxies, isAdmin, async c => changeAdmin(c, NewRaijinSwapProxyOwner), skip);
    }

    // ================================================================

    printHeader(`Change Mapped Swap contracts owner to ${NewMappedSwapOwner}`);

    let mappedSwapDeployerRoles = [pool];
    let mappedSwapManagerRoles = [priceAdjust];
    let mappedSwapContracts = [usdm, btcm, ethm, mst, pool, priceAdjust, payout, agentData, staking, usdPool, btcPool, ethPool];

    if (CurrentOwnerIsMultiSig) {
        let contract = new Contract("MultiSigOwner", CurrentOwner);

        let deployerContracts = [];
        await doForAll(mappedSwapDeployerRoles, canTransferDeployer, c => { deployerContracts.push(c) }, skip);
        await submitTransferRoles(contract, deployerContracts, "DEPLOYER_ROLE", NewMappedSwapOwner);

        let managerContracts = [];
        await doForAll(mappedSwapManagerRoles, canTransferManager, c => { managerContracts.push(c) }, skip);
        await submitTransferRoles(contract, managerContracts, "MANAGER_ROLE", NewMappedSwapOwner);

        let ownerContracts = [];
        await doForAll(mappedSwapContracts, isOwner, c => { ownerContracts.push(c) }, skip);
        await submitTransferOwnerships(contract, ownerContracts, NewMappedSwapOwner);
    } else {
        await doForAll(mappedSwapDeployerRoles, canTransferDeployer, async c => transferDeployer(c, NewMappedSwapOwner), skip);

        await doForAll(mappedSwapManagerRoles, canTransferManager, async c => transferManager(c, NewMappedSwapOwner), skip);

        await doForAll(mappedSwapContracts, isOwner, async c => transferOwnership(c, NewMappedSwapOwner), skip);
    }

    // ================================================================

    printHeader(`Change Raijin Swap contracts owner to ${NewRaijinSwapOwner}`);

    let raijinSwapFeeToSetterRoles = [factory];
    let raijinSwapManagerRoles = [router];
    let raijinSwapContracts = [factory, router];

    if (CurrentOwnerIsMultiSig) {
        let contract = new Contract("MultiSigOwner", CurrentOwner);

        let feeToSetterContracts = [];
        await doForAll(raijinSwapFeeToSetterRoles, isFeeToSetter, c => { feeToSetterContracts.push(c) }, skip);
        await submitSetFeeToSetter(contract, feeToSetterContracts, NewRaijinSwapOwner);

        let managerContracts = [];
        await doForAll(raijinSwapManagerRoles, canTransferManager, c => { managerContracts.push(c) }, skip);
        await submitTransferRoles(contract, managerContracts, "MANAGER_ROLE", NewRaijinSwapOwner);

        let ownerContracts = [];
        await doForAll(raijinSwapContracts, isOwner, c => { ownerContracts.push(c) }, skip);
        await submitTransferOwnerships(contract, ownerContracts, NewRaijinSwapOwner);
    } else {
        await doForAll(raijinSwapFeeToSetterRoles, isFeeToSetter, async c => setFeeToSetter(c, NewRaijinSwapOwner), skip);

        await doForAll(raijinSwapManagerRoles, canTransferManager, async c => transferManager(c, NewRaijinSwapOwner), skip);

        await doForAll(raijinSwapContracts, isOwner, async c => transferOwnership(c, NewRaijinSwapOwner), skip);
    }

    // ================================================================

    printHeader(`OK`);
    process.exit();
})();
