// DEV
const networkName = "dev";
const network = "2021";
const rpcUrl = 'http://13.228.169.25:10002';
const SmartContractDeploy = require("../SmartContractDeploy.dev.json");

// TESTNET
// const networkName = "testnet";
// const network = "1984";
// const rpcUrl = 'https://testnet.eurus.network';
// const SmartContractDeploy = require("../SmartContractDeploy.testnet.json");

// MAINNET
// const networkName = "mainnet";
// const network = "1008";
// const rpcUrl = 'https://mainnet.eurus.network';
// const SmartContractDeploy = require("../SmartContractDeploy.mainnet.json");

const AGENT_ROLE = "AGENT_ROLE";
const APPROVER_ROLE = "APPROVER_ROLE";
const BACKEND_ROLE = "BACKEND_ROLE";
const DEPLOYER_ROLE = "DEPLOYER_ROLE";
const MANAGER_ROLE = "MANAGER_ROLE";
const INSERTER_ROLE = "INSERTER_ROLE";
const UPDATER_ROLE = "UPDATER_ROLE";
const SELECTED_LP_ROLE = "SELECTED_LP_ROLE";
const SELECTED_SWAP_ROLE = "SELECTED_SWAP_ROLE";
const MINTER_ROLE = "MINTER_ROLE";
const BURNER_ROLE = "BURNER_ROLE";
const WITHDRAWER_ROLE = "WITHDRAWER_ROLE";

const ERC20 = require("../build/contracts/ERC20.json");
const Multicall = require("../build/contracts/Multicall.json");
const WrappedEUN = require("../build/contracts/WrappedEUN.json");
const OwnedUpgradeableProxy = require("../build/contracts/OwnedUpgradeableProxy.json");
const MappedSwapToken = require("../build/contracts/MappedSwapToken.json");
const UpgradeableBeacon = require("../build/contracts/UpgradeableBeacon.json");
const OwnedBeaconProxy = require("../build/contracts/OwnedBeaconProxy.json");
const RaijinSwapFactory = require("../build/contracts/RaijinSwapFactory.json");
const RaijinSwapRouter = require("../build/contracts/RaijinSwapRouter.json");
const PoolCore = require("../build/contracts/PoolCore.json");
const PoolManagement = require("../build/contracts/PoolManagement.json");
const PriceAdjust = require("../build/contracts/PriceAdjust.json");
const Payout = require("../build/contracts/Payout.json");
const AgentData = require("../build/contracts/AgentData.json");
const Staking = require("../build/contracts/Staking.json");
const PaymentProxy = require("../build/contracts/PaymentProxy.json");
const MiningPool = require("../build/contracts/MiningPool.json");
const HashedKeyStorage = require("../build/contracts/HashedKeyStorage.json");

const RaijinSwapPair = require("../build/contracts/RaijinSwapPair.json");

const solidity = require("@ethersproject/solidity");
const BigNumber = require('bignumber.js');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

class SourceVerifier {

    constructor(web3) {
        this.eth = web3.eth;
    }

    sourceHash(byteCode) {
        return solidity.keccak256(["bytes"], [byteCode]);
    }

    async verifySource(contract, contractProxyName) {
        let contractName = contractProxyName || contract.contractName;

        let copmpileByteCode = contract.deployedBytecode;
        let compileHash = this.sourceHash(copmpileByteCode);

        let address = SmartContractDeploy[network].smartContract[contractName].address;

        let contractByteCode = await this.eth.getCode(address, "latest")
        let contractHash = this.sourceHash(contractByteCode);

        if (compileHash == contractHash) {
            console.info("Identical ", contractName);
            return true;
        } else {
            console.warn("Different", contractName, { compileHash, contractHash });
            return false;
        }
    }


    async verifyProxyPointer(proxy, proxyName, implementationName, getImplementationAddressMethod) {
        let proxyAddress = SmartContractDeploy[network].smartContract[proxyName].address;
        let implementationAddress = SmartContractDeploy[network].smartContract[implementationName].address;

        console.info(`== ${proxyName} ==`);

        let proxyContract = new this.eth.Contract(proxy.abi, proxyAddress, {});

        if (proxy == PoolCore) {
            let proxyDeployer = await proxyContract.methods.getDeployers().call();
            console.info(`Deployer(s)\t= ${proxyDeployer}`);
        } else {
            let funcName = proxy == UpgradeableBeacon ? "Owner" : "Admin";
            let proxyOwner = await proxyContract.methods[funcName.toLowerCase()]().call();
            console.info(`${funcName}\t\t= ${proxyOwner}`);
        }

        getImplementationAddressMethod = getImplementationAddressMethod || "implementation"
        let proxyImplementationAddress = await proxyContract.methods[getImplementationAddressMethod]().call();
        console.info(`Implementation\t= ${proxyImplementationAddress}`);

        if (implementationAddress == proxyImplementationAddress) {
            console.info(`Proxy addresses match. ${proxyName} -> ${implementationName}`);
            return true;
        } else {
            console.warn(`Proxy addresses not match. ${proxyName} -> ${implementationName}`, proxyName, { implementationAddress, proxyImplementationAddress });
            return false;
        }
    }

    async verifyAll() {
        await this.verifySource(Multicall)
        await this.verifySource(WrappedEUN);
        await this.verifySource(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<WEUN>");
        await this.verifySource(MappedSwapToken);
        await this.verifySource(UpgradeableBeacon, "UpgradeableBeacon<MappedSwapToken>");
        await this.verifySource(OwnedBeaconProxy, "OwnedBeaconProxy<USDM>");
        await this.verifySource(OwnedBeaconProxy, "OwnedBeaconProxy<BTCM>");
        await this.verifySource(OwnedBeaconProxy, "OwnedBeaconProxy<ETHM>");
        await this.verifySource(RaijinSwapFactory);
        await this.verifySource(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<RaijinSwapFactory>");
        await this.verifySource(RaijinSwapRouter);
        await this.verifySource(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<RaijinSwapRouter>");
        await this.verifySource(PoolCore);
        await this.verifySource(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<Pool>");
        await this.verifySource(PoolManagement);
        await this.verifySource(PriceAdjust);
        await this.verifySource(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<PriceAdjust>");
        await this.verifySource(Payout);
        await this.verifySource(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<Payout>");
        await this.verifySource(AgentData);
        await this.verifySource(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<AgentData>");
        await this.verifySource(OwnedBeaconProxy, "OwnedBeaconProxy<MST>");
        await this.verifySource(Staking);
        await this.verifySource(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<Staking>");
        await this.verifySource(PaymentProxy);
        await this.verifySource(HashedKeyStorage);
        await this.verifySource(UpgradeableBeacon, "UpgradeableBeacon<HashedKeyStorage>");
        await this.verifySource(OwnedBeaconProxy, "OwnedBeaconProxy<AgentStorage>");
        await this.verifySource(OwnedBeaconProxy, "OwnedBeaconProxy<TradeStorage>");
        await this.verifySource(OwnedBeaconProxy, "OwnedBeaconProxy<RelationStorage>");

        if (networkName != "mainnet") {
            await this.verifySource(MiningPool);
            await this.verifySource(UpgradeableBeacon, "UpgradeableBeacon<MiningPool>");
            await this.verifySource(OwnedBeaconProxy, "OwnedBeaconProxy<USDMiningPool>");
            await this.verifySource(OwnedBeaconProxy, "OwnedBeaconProxy<BTCMiningPool>");
            await this.verifySource(OwnedBeaconProxy, "OwnedBeaconProxy<ETHMiningPool>");
        }

        await this.verifyProxyPointer(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<WEUN>", "WrappedEUN");
        await this.verifyProxyPointer(UpgradeableBeacon, "UpgradeableBeacon<MappedSwapToken>", "MappedSwapToken");
        await this.verifyProxyPointer(OwnedBeaconProxy, "OwnedBeaconProxy<USDM>", "MappedSwapToken");
        await this.verifyProxyPointer(OwnedBeaconProxy, "OwnedBeaconProxy<BTCM>", "MappedSwapToken");
        await this.verifyProxyPointer(OwnedBeaconProxy, "OwnedBeaconProxy<ETHM>", "MappedSwapToken");
        await this.verifyProxyPointer(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<RaijinSwapFactory>", "RaijinSwapFactory");
        await this.verifyProxyPointer(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<RaijinSwapRouter>", "RaijinSwapRouter");
        await this.verifyProxyPointer(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<Pool>", "PoolCore");
        await this.verifyProxyPointer(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<PriceAdjust>", "PriceAdjust");
        await this.verifyProxyPointer(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<Payout>", "Payout");
        await this.verifyProxyPointer(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<AgentData>", "AgentData");
        await this.verifyProxyPointer(OwnedBeaconProxy, "OwnedBeaconProxy<MST>", "MappedSwapToken");
        await this.verifyProxyPointer(OwnedUpgradeableProxy, "OwnedUpgradeableProxy<Staking>", "Staking");
        await this.verifyProxyPointer(OwnedBeaconProxy, "OwnedBeaconProxy<AgentStorage>", "HashedKeyStorage");
        await this.verifyProxyPointer(OwnedBeaconProxy, "OwnedBeaconProxy<TradeStorage>", "HashedKeyStorage");
        await this.verifyProxyPointer(OwnedBeaconProxy, "OwnedBeaconProxy<RelationStorage>", "HashedKeyStorage");

        if (networkName != "mainnet") {
            await this.verifyProxyPointer(UpgradeableBeacon, "UpgradeableBeacon<MiningPool>", "MiningPool");
            await this.verifyProxyPointer(OwnedBeaconProxy, "OwnedBeaconProxy<USDMiningPool>", "MiningPool");
            await this.verifyProxyPointer(OwnedBeaconProxy, "OwnedBeaconProxy<BTCMiningPool>", "MiningPool");
            await this.verifyProxyPointer(OwnedBeaconProxy, "OwnedBeaconProxy<ETHMiningPool>", "MiningPool");
        }

        // pool core extension to pool manager
        await this.verifyProxyPointer(PoolCore, "OwnedUpgradeableProxy<Pool>", "PoolManagement", "getManagementContract");

    }

}

class RolePrinter {

    constructor(web3) {
        this.eth = web3.eth;
    }

    async printOwner(contract) {
        let owner = await contract.methods.owner().call();
        console.info(`OWNER\t\t: ${owner}`);
        return owner;
    }

    async printContractRoles(contract, role) {
        const roleHash = solidity.keccak256(["string"], [role]);
        let count = await contract.methods.getRoleMemberCount(roleHash).call();
        var addresses = "";
        for (let i = 0; i < count; i++) {
            let address = await contract.methods.getRoleMember(roleHash, i).call();
            if (addresses != "") {
                addresses += ","
            }
            addresses += address;
        }
        console.info(`${role}\t: ${addresses}`);
        return addresses
    }

    async printTokenRoles(token) {
        console.info(`== ${token} Token Roles ==`);
        let contract = new this.eth.Contract(MappedSwapToken.abi,
            SmartContractDeploy[network].smartContract[`OwnedBeaconProxy<${token}>`].address, {});
        await this.printOwner(contract);
        // minter
        await this.printContractRoles(contract, MINTER_ROLE);
        await this.printContractRoles(contract, BURNER_ROLE);
    }

    async printSwapFactoryRoles() {
        console.info("== SwapFactory Roles ==");
        let contract = new this.eth.Contract(RaijinSwapFactory.abi,
            SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<RaijinSwapFactory>"].address, {});
        await this.printOwner(contract);
        // fee to
        let feeTo = await contract.methods.feeTo().call();
        console.log(`FEE_TO\t\t: ${feeTo}`);
        // fee to setter
        let feeToSetter = await contract.methods.feeToSetter().call();
        console.log(`FEE_TO_SETTER\t: ${feeToSetter}`);
    }

    async printSwapRouterRoles() {
        console.info("== SwapRouter Roles ==");
        let contract = new this.eth.Contract(RaijinSwapRouter.abi,
            SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<RaijinSwapRouter>"].address, {});
        await this.printOwner(contract);

        await this.printContractRoles(contract, MANAGER_ROLE);
        await this.printContractRoles(contract, SELECTED_LP_ROLE);
        await this.printContractRoles(contract, SELECTED_SWAP_ROLE);
    }

    async printPoolCoreRoles() {
        console.info("== PoolCore Roles ==");
        let contract = new this.eth.Contract(PoolCore.abi,
            SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<Pool>"].address, {});
        await this.printOwner(contract);
        await this.printContractRoles(contract, AGENT_ROLE);
        await this.printContractRoles(contract, APPROVER_ROLE);
        await this.printContractRoles(contract, BACKEND_ROLE);
        await this.printContractRoles(contract, MANAGER_ROLE);
        await this.printContractRoles(contract, DEPLOYER_ROLE);
    }

    async printPriceAdjustRoles() {
        console.info("== PriceAdjust Roles ==");
        let contract = new this.eth.Contract(PriceAdjust.abi,
            SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<PriceAdjust>"].address, {});
        await this.printOwner(contract);
        await this.printContractRoles(contract, MANAGER_ROLE);
        await this.printContractRoles(contract, BACKEND_ROLE);
    }

    async printPayoutRoles() {
        console.info("== Payout Roles ==");
        let contract = new this.eth.Contract(Payout.abi,
            SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<Payout>"].address, {});
        await this.printOwner(contract);
    }

    async printAgentDataRoles() {
        console.info("== Agent Data Roles ==");
        let contract = new this.eth.Contract(AgentData.abi,
            SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<AgentData>"].address, {});
        await this.printOwner(contract);
        await this.printContractRoles(contract, INSERTER_ROLE);
        await this.printContractRoles(contract, UPDATER_ROLE);
        await this.printContractRoles(contract, APPROVER_ROLE);
    }

    async printStakingRoles() {
        console.info("== Staking Roles ==");
        let contract = new this.eth.Contract(Staking.abi,
            SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<Staking>"].address, {});
        await this.printOwner(contract);
        let lockedStakingAdder = await contract.methods.lockedStakingAdder().call();
        console.log(`LOCKED_STAKING_ADDER\t: ${lockedStakingAdder}`);
    }

    async printMiningPoolRoles(token) {
        console.info(`== ${token} Mining Pool Roles ==`);
        let contract = new this.eth.Contract(MiningPool.abi,
            SmartContractDeploy[network].smartContract[`OwnedBeaconProxy<${token}MiningPool>`].address, {});
        await this.printOwner(contract);
        await this.printContractRoles(contract, WITHDRAWER_ROLE);
    }

    async printHashedKeyStorageRoles(keyType) {
        console.info(`== ${keyType} Roles ==`);
        let contract = new this.eth.Contract(HashedKeyStorage.abi,
            SmartContractDeploy[network].smartContract[`OwnedBeaconProxy<${keyType}>`].address, {});
        await this.printOwner(contract);
        await this.printContractRoles(contract, INSERTER_ROLE);
        await this.printContractRoles(contract, UPDATER_ROLE);
        await this.printContractRoles(contract, APPROVER_ROLE);
    }

    async printAllRoles() {
        await this.printTokenRoles("USDM");
        await this.printTokenRoles("BTCM");
        await this.printTokenRoles("ETHM");
        await this.printSwapRouterRoles();
        await this.printSwapFactoryRoles();
        await this.printPoolCoreRoles();
        await this.printPriceAdjustRoles();
        await this.printPayoutRoles();
        await this.printAgentDataRoles();
        await this.printTokenRoles("MST");
        await this.printStakingRoles();
        await this.printHashedKeyStorageRoles("AgentStorage");
        await this.printHashedKeyStorageRoles("TradeStorage");
        await this.printHashedKeyStorageRoles("RelationStorage");

        if (networkName != "mainnet") {
            await this.printMiningPoolRoles("USD");
            await this.printMiningPoolRoles("BTC");
            await this.printMiningPoolRoles("ETH");
        }
    }
}

class ConfigPrinter {

    constructor(web3) {
        this.eth = web3.eth;
    }

    getTokenDecimals(token) {
        switch (token) {
            case "USDM":
            case "USD":
                return 6;
            case "BTC":
                return 8;
            default:
                return 18;
        }
    }

    convertTokenNumber(number, token) {
        const decimals = this.getTokenDecimals(token);
        return BigNumber(number).div(new BigNumber(10).pow(decimals));
    }

    async printTokenConfig(token) {
        console.info(`== ${token} Token Config ==`);
        let contract = new this.eth.Contract(MappedSwapToken.abi, SmartContractDeploy[network].smartContract[`OwnedBeaconProxy<${token}>`].address, {});

        let internalSCConfigAddr = await contract.methods.getInternalSCConfigAddress().call();
        console.log(`InternalSCConfigAddress\t: ${internalSCConfigAddr}`);

        let externalSCConfigAddr = await contract.methods.getExternalSCConfigAddress().call();
        console.log(`ExternalSCConfigAddress\t: ${externalSCConfigAddr}`);
    }

    async printSwapFactoryConfig() {
        console.info("== SwapFactory Config ==");
        let contract = new this.eth.Contract(RaijinSwapFactory.abi, SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<RaijinSwapFactory>"].address, {});

        let router = await contract.methods.getRouter().call();
        console.log(`Router\t\t\t: ${router}`, router == SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<RaijinSwapRouter>"].address);
    }

    async printSwapRouterConfig() {
        console.info("== SwapRouter Config ==");
        let contract = new this.eth.Contract(RaijinSwapRouter.abi, SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<RaijinSwapRouter>"].address, {});

        let factory = await contract.methods.factory().call();
        console.log(`Factory\t\t\t: ${factory}`, factory == SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<RaijinSwapFactory>"].address);

        let weun = await contract.methods.WEUN().call();
        console.log(`WEUN\t\t\t: ${weun}`, weun == SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<WEUN>"].address);

        let tokens = ["USDM", "BTCM", "ETHM"];
        for (const token of tokens) {
            let ret = await contract.methods.isTokenRestricted(SmartContractDeploy[network].smartContract[`OwnedBeaconProxy<${token}>`].address).call();
            console.log(`Is ${token} restricted\t?`, ret);
        }
    }

    async printPoolConfig() {
        console.info("== Pool Config ==");
        let coreContract = new this.eth.Contract(PoolCore.abi, SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<Pool>"].address, {});
        let managementContract = new this.eth.Contract(PoolManagement.abi, SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<Pool>"].address, {});

        let router = await coreContract.methods.getRouter().call();
        console.log(`Router\t\t\t: ${router}`, router == SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<RaijinSwapRouter>"].address);

        let refToken = await coreContract.methods.getReferenceToken().call();
        console.log(`ReferenceToken\t\t: ${refToken}`, refToken == SmartContractDeploy[network].smartContract["OwnedBeaconProxy<USDM>"].address);

        let allTokens = await managementContract.methods.getAllTokens().call();
        console.log(`All tokens\t\t:`, allTokens);

        let allPairs = await managementContract.methods.getAllPairs().call();
        console.log(`All pairs\t\t:`, allPairs);
    }

    async printPriceAdjustConfig() {
        console.info("== PriceAdjust Config ==");
        let contract = new this.eth.Contract(PriceAdjust.abi, SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<PriceAdjust>"].address, {});

        let pool = await contract.methods.getPool().call();
        console.log(`Pool\t\t\t: ${pool}`, pool == SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<Pool>"].address);
    }

    async printStakingConfig() {
        console.info("== Staking Config ==");
        let contract = new this.eth.Contract(Staking.abi, SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<Staking>"].address, {});

        let ret = await contract.methods.isTokenStakeable(SmartContractDeploy[network].smartContract["OwnedBeaconProxy<MST>"].address).call();
        console.log("Is MST stakeable\t?", ret);

        let redeemWaitPeriod = await contract.methods.getRedeemWaitPeriod().call();
        console.log(`Redeem wait period\t: ${redeemWaitPeriod}`);
    }

    async printMiningPoolConfig(token) {
        console.info(`== ${token} Mining Pool Config ==`);
        let contract = new this.eth.Contract(MiningPool.abi, SmartContractDeploy[network].smartContract[`OwnedBeaconProxy<${token}MiningPool>`].address, {});

        let tokenToStake = await contract.methods.getTokenToStake().call();
        console.log(`Token to stake\t\t: ${tokenToStake}`);

        let tokenToReward = await contract.methods.getTokenToReward().call();
        console.log(`Token to reward\t\t: ${tokenToReward}`);

        let v3pool = await contract.methods.getReferenceUniswapV3Pool().call();
        console.log(`Reference Uniswap pool\t: ${v3pool}`);

        let totalAnnual = await contract.methods.getTotalAnnualRewards().call();
        console.log(`Total annual rewards\t: ${this.convertTokenNumber(totalAnnual, "USD")}`);

        let cap = await contract.methods.getFixedPoolCapacityUSD().call();
        console.log(`Fixed pool size\t\t: ${this.convertTokenNumber(cap, "USD")}`);

        let lockPeriod = await contract.methods.getLockPeriod().call();
        console.log(`Lock period\t\t: ${lockPeriod}`);

        let rewardPeriod = await contract.methods.getRewardPeriod().call();
        console.log(`Reward period\t\t: ${rewardPeriod}`);

        let redeemWaitPeriod = await contract.methods.getRedeemWaitPeriod().call();
        console.log(`Redeem wait period\t: ${redeemWaitPeriod}`);
    }

    async printAllConfigs() {
        await this.printTokenConfig("USDM");
        await this.printTokenConfig("BTCM");
        await this.printTokenConfig("ETHM");
        await this.printSwapRouterConfig();
        await this.printSwapFactoryConfig();
        await this.printPoolConfig();
        await this.printPriceAdjustConfig();
        await this.printTokenConfig("MST");
        await this.printStakingConfig();

        if (networkName != "mainnet") {
            await this.printMiningPoolConfig("USD");
            await this.printMiningPoolConfig("BTC");
            await this.printMiningPoolConfig("ETH");
        }
    }
}

class BalancePrinter {

    constructor(web3) {
        this.eth = web3.eth;
        this.tokenDecimals = {};
    }

    async getTokenDecimals(token) {
        let decimals = this.tokenDecimals[token];
        if (!decimals) {
            let tokenAddress = SmartContractDeploy[network].smartContract[`OwnedBeaconProxy<${token}>`].address;
            let contract = new this.eth.Contract(ERC20.abi, tokenAddress, {});
            decimals = await contract.methods.decimals().call();
            this.tokenDecimals[token] = decimals;
        }
        return decimals;
    }

    async convertTokenNumber(number, token) {
        const decimals = await this.getTokenDecimals(token);
        return BigNumber(number).div(new BigNumber(10).pow(decimals));
    }

    async printMappedSwapTokenInfo(token, mappedSwapAddress) {
        let contract = new this.eth.Contract(PoolManagement.abi, mappedSwapAddress, {});
        const tokenInfo = await contract.methods.getTokenInfo(token).call();
        const tokenAddr = tokenInfo.tokenAddr;
        const interestRate = tokenInfo.interestRate;
        const effectiveDecimal = tokenInfo.effectiveDecimal;
        console.info(`Token Info (${token}): address ${tokenAddr}, effective decimal ${effectiveDecimal}`);
        for (let i = 0; i < tokenInfo.interestRates.length; i++) {
            let rate = tokenInfo.interestRates[i];
            let value = new BigNumber(rate.value).div(new BigNumber(1000000000));
            console.info(`\tInterest rate since ${new Date(Number(rate.effectiveTime) * 1000).toLocaleString()} value=${value.times(100)}%`);
        }
    }

    async printMappedSwapCustomerBalance(customerAddress) {
        let poolAddress = SmartContractDeploy[network].smartContract['OwnedUpgradeableProxy<Pool>'].address;
        let contract = new this.eth.Contract(PoolCore.abi, poolAddress, {});
        let customerInfo = await contract.methods.getCustomerInfo(customerAddress).call();
        console.info(`Customer ${customerAddress}`);
        //console.info(customerInfo);

        const equity = await this.convertTokenNumber(customerInfo.equity, "USDM");
        console.info(`Equity: ${equity}`);
        console.info(`Mode: ${customerInfo.mode}`);
        console.info(`MaxFunding: ${customerInfo.maxFunding}`);
        console.info(`UsedFunding: ${customerInfo.usedFunding}`);
        console.info(`StopoutRiskLevel: ${customerInfo.stopoutRiskLevel}`);

        for (let i = 0; i < customerInfo.tokens.length; i++) {
            const token = customerInfo.tokens[i];
            const realizedBalance = await this.convertTokenNumber(token.realizedBalance, token.tokenName);
            const interest = await this.convertTokenNumber(token.interest, token.tokenName);
            console.info(`Token ${token.tokenName}  balance: ${realizedBalance} \t interest ${interest}`);
        }
    }


    async printErc20TokenBalance(token, ownerAddress) {
        let tokenAddress = SmartContractDeploy[network].smartContract[`OwnedBeaconProxy<${token}>`].address;
        let contract = new this.eth.Contract(ERC20.abi, tokenAddress, {});
        let balance = await contract.methods.balanceOf(ownerAddress).call();
        let formattedBalance = await this.convertTokenNumber(balance, token);
        console.info(`Token ${token} balance of ownerAddress\t: ${formattedBalance}`);
    }

    async printRaijinSwapPairLiquidity(token0, token1) {

        let raijinSwapFactoryAddress = SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<RaijinSwapFactory>"].address;

        var token0Address = SmartContractDeploy[network].smartContract[`OwnedBeaconProxy<${token0}>`].address;
        var token1Address = SmartContractDeploy[network].smartContract[`OwnedBeaconProxy<${token1}>`].address;

        if (token0Address > token1Address) {
            // swap addresses
            var tempAddr = token0Address;
            token0Address = token1Address;
            token1Address = tempAddr;
            // swap name
            var tempName = token0;
            token0 = token1;
            token1 = tempName;
        }

        let raijinSwapFactoryContract = new this.eth.Contract(RaijinSwapFactory.abi, raijinSwapFactoryAddress, {});
        //let routerAddress = await raijinSwapFactoryContract.methods.getRouter().call();
        let pairAddress = await raijinSwapFactoryContract.methods.getPair(token0Address, token1Address).call();

        let raijinSwapPairContract = new this.eth.Contract(RaijinSwapPair.abi, pairAddress, {});

        let reserves;
        try {
            reserves = await raijinSwapPairContract.methods.getReserves().call();
        } catch (e) {
            console.log(e);
            console.warn("Cannot get the reserves of pair (pair is not deployed?)");
            return;
        }

        console.info(`-- Reserves of ${token0} - ${token1} --`);
        let reserve0 = await this.convertTokenNumber(reserves["0"], token0);
        let reserve1 = await this.convertTokenNumber(reserves["1"], token1);
        console.info(`Pair address ${pairAddress}`);
        console.info(`Token ${token0} reserve\t: ${reserve0}`);
        console.info(`Token ${token1} reserve\t: ${reserve1}`);
        if (token0 == "USDM") {
            let quote = reserve0 / reserve1;
            console.info(`${token1} price \t\t: ${quote}`);
        } else {
            let quote = reserve1 / reserve0;
            console.info(`${token0} price \t\t: ${quote}`);
        }
    }

    async printMappedSwapInfo() {
        console.info(">> MappedSwap Token Info <<");
        let mappedSwapAddress = SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<Pool>"].address;
        await this.printMappedSwapTokenInfo("USDM", mappedSwapAddress);
        await this.printMappedSwapTokenInfo("BTCM", mappedSwapAddress);
        await this.printMappedSwapTokenInfo("ETHM", mappedSwapAddress);
        console.info("--");
    }

    async printMappedSwapBalance() {
        console.info(">> MappedSwap Balance <<");
        let mappedSwapAddress = SmartContractDeploy[network].smartContract["OwnedUpgradeableProxy<Pool>"].address;
        await this.printErc20TokenBalance("USDM", mappedSwapAddress);
        await this.printErc20TokenBalance("BTCM", mappedSwapAddress);
        await this.printErc20TokenBalance("ETHM", mappedSwapAddress);
        console.info("--");
    }

    async printRaijinSwapLiquidity() {
        console.info(">> RaijinSwap Liquidity <<");
        await this.printRaijinSwapPairLiquidity("BTCM", "USDM");
        await this.printRaijinSwapPairLiquidity("ETHM", "USDM");
        console.info("--");
    }

    async printMappedSwaBotBalance() {
        console.info(">> Robot Balance <<");
        // Bot  0x90C67BB5B145c7C64962a3737C0A5dd884a5A8b7  disabled
        // let botAddress = "0x90C67BB5B145c7C64962a3737C0A5dd884a5A8b7";
        // Bot2 0xaEE528826DF6f4fDDe3C007BEbcc268181B80993 
        let botAddress = SmartContractDeploy[network].smartContract[`OwnedUpgradeableProxy<PriceAdjust>`].address;
        await this.printMappedSwapCustomerBalance(botAddress)
        console.info("--");
    }

    async printAllBalance() {
        console.info(`------ Balance @${new Date().toLocaleString()} ------`);
        await this.printMappedSwapInfo();
        await this.printMappedSwapBalance();
        await this.printRaijinSwapLiquidity();

        await this.printMappedSwaBotBalance();

    }

}

// verify code
console.info(`*** Verify contracts on ${networkName}`);
console.info(`*** Network settings:`, { "network": network, "rpcUrl": rpcUrl });
let sourceVerifier = new SourceVerifier(web3);
sourceVerifier.verifyAll().then(() => {

    // print roles
    let rolePrinter = new RolePrinter(web3);
    rolePrinter.printAllRoles().then(() => {

        // print configs
        let configPrinter = new ConfigPrinter(web3);
        configPrinter.printAllConfigs().then(() => {

            // print balance
            let balancePrinter = new BalancePrinter(web3);
            balancePrinter.printAllBalance();

        });

    });

});
