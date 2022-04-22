const {CONSTANTS} = require("./Constants");
const ENV = CONSTANTS.ENV;
const Sequelize = require('sequelize');
const Models = require("../models/Models");
const CONFIG = require('./ConfigLoader')(ENV);
const prompt = require('./prompt');

const Web3 = require('web3');
const BN = Web3.utils.BN;
const HDWalletProvider = require('@truffle/hdwallet-provider');
const MappedSwapToken = require('../abi/MappedSwapToken.json');

let _web3 = null;
async function getWeb3(){

    const myKey = await prompt.getKey();
    const myPrivateKey = myKey.privateKey;

    if(!_web3){
        _web3 = new Web3(
            new HDWalletProvider(
                {
                    privateKeys: [myPrivateKey],
                    providerOrUrl: CONFIG.rpc,
                    pollingInterval: 80000
                }));
    }
    return _web3;
}

async function getTxOptions(web3){
    
    const myKey = await prompt.getKey();
    let nonce = await web3.eth.getTransactionCount(myKey.address);
    return {nonce, from:myKey.address};

}

exports.connectToPostgres = async (sync = false) => {
    const key = await prompt.getKey();
    const password = await key.decrypt(CONFIG.postgre.options.password);
    const sequelize = new Sequelize({...CONFIG.postgre.options, password});

    try{
        await sequelize.authenticate();
        console.log("sucessfully connected to Postgres");

        Models(sequelize, sync);
    }catch(e){
        console.error(e);
        process.exit(1);
    }
  
    return sequelize;
}

function getTokenAddress(sToken) {
    const token = CONFIG.tokens[sToken];
    if(token){
        return token;
    }else{
        throw new Error(`getTokenAddress > Token(${sToken}) not found!`)
    }
}

exports.transfer = async (element) => {
    try {
        let web3 = await getWeb3();
        const symbolMappingValue = CONSTANTS.SYMBOL_MAPPING[element.symbol];

        if(!symbolMappingValue){
          throw new Error(`Not support token ${element.symbol}`);
        }

        // is valid address
        if(!web3.utils.isAddress(element.tag)){
            throw new Error(`Invalid address '${element.tag}'`);
        }

        let targetToken = getTokenAddress(symbolMappingValue.targetToken);
        let tokenAddr = targetToken.address;
        let poolAddr = CONFIG.pool.address;

        //let recipientAddr = "0xC0C0A43D2819eFca5a2774F9Efcb1F60Ff9873D9";
        //tokenAddr = "aa";
        //recipientAddr = "abc";

        let amount = new BN(element.amount);
        const exponent = new BN(targetToken.decimals).sub(new BN(symbolMappingValue.decimals));
        amount = amount.mul(new BN(10).pow(exponent));
        
        let contract = new web3.eth.Contract(MappedSwapToken, tokenAddr);
        const method = contract.methods.transfer(poolAddr, amount, web3.utils.padLeft(element.tag, 64));
        const options = await getTxOptions(web3);
        const receipt = await method.send(options);

        console.log(`Transfer token ${element.symbol} to ${element.tag}`, receipt);
        return receipt;
    }
    catch(e) {
        console.error("Err > Transfer > ", e);
        throw e;
    }
}

exports.eunRewards = async (rewardItem) => {
    try{
        let web3 = await getWeb3();
        // is valid address
        if(!web3.utils.isAddress(rewardItem.address)){
            throw new Error(`Invalid address ${element.tag}`);
        }

        const options = await getTxOptions(web3);

        let tx = {
            value: web3.utils.toHex(rewardItem.amount),
            to: rewardItem.address,
            gas: CONSTANTS.EUN_REWARD_GAS,
            ...options
        };
        
        const receipt = await web3.eth.sendTransaction(tx);

        console.log(`Transfer EUN rewards to ${rewardItem.address}`, receipt);
        return receipt;
    }
    catch(e) {
        console.error("Err > EunRewards > ", e);
        throw e;
    }
    
}
