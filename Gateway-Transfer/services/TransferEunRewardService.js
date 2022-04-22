const {CONSTANTS, ENUM_TRANSFER_STATUS} = require("../utils/Constants");
const DatabaseService = require("./DatabaseService");
const util = require('../utils/utils');
const Web3 = require('web3');

const ENV = CONSTANTS.ENV;
const CONFIG = require('../utils/ConfigLoader')(ENV);

class TransferEunRewardService extends DatabaseService{

    TransferEunReward;

    constructor(sequelize) {
        super(sequelize);
        this.TransferEunReward = this.models.TransferEunReward;
    }

    async create(reward, t) {
        let item = {
            address: reward.address,
            amount: reward.amount,
            resend: false
        }
        await this.TransferEunReward.create(item, {transaction: t});
        return item;
    }

    async findTransferEunReward(address){
        return await this.TransferEunReward.find({ where: {address}});
    }

    async transferComplete(address, transferTxHash, transaction) {
        await this.TransferEunReward.update({transferStatus: ENUM_TRANSFER_STATUS.COMPLETED, transferTxHash}, {where: {address} }, {transaction});
    }

    async transferRevert(address, transferTxHash, transaction) {
        const errMsg = "Rewards transaction reverted";
        await this.TransferEunReward.update({transferStatus: ENUM_TRANSFER_STATUS.REVERTED, transferTxHash, errMsg}, {where: {address} }, {transaction});
    }

    async transferFail(address, errMsg, transaction) {
        await this.TransferEunReward.update({transferStatus: ENUM_TRANSFER_STATUS.FAIL, errMsg}, {where: {address} }, {transaction});
    }

    async isAddressExisted(address) {
        let count = await this.TransferEunReward.count({ where: {address} });
        return count !== 0;
    }


    async rewardEun(address){
        // check if send eun rewards before
        if(await this.isAddressExisted(address)){
            return false;
        }

        console.info(`Transfer EUN rewards to ${address}`);

        let eunRewards = Web3.utils.toWei(CONFIG.eunRewards, 'ether');
        //console.info(`${eunRewards.toString(10)}`);

        let rewardItem = await this.inTransaction(async (t) => {
          return await this.create({address, amount:eunRewards}, t);
        });

        return await this.sendRewardEun(rewardItem);
    }

    async sendRewardEun(rewardItem){
        try{

            let transferReceipt = await util.eunRewards(rewardItem);
            await this.inTransaction(async (t) => {     
              if(transferReceipt.status){
                // Transfer success
                await this.transferComplete(rewardItem.address, transferReceipt.transactionHash||"", t);
              }else{
                // Transfer revert
                await this.transferRevert(rewardItem.address, transferReceipt.transactionHash||"", t);
              }
            });

            return transferReceipt.status;

        }catch(e){
            let errMsg;
            if((typeof e === 'string' || e instanceof String)){
              errMsg = e;
            }else{
              errMsg = e.message || "unknown error";
            }
            // transfer fail.
            await this.inTransaction(async (t) => {   
              await this.transferFail(address, errMsg, t);
            });
            console.error("errMsg", e);
            return false;
        }
    }

}

module.exports = TransferEunRewardService;