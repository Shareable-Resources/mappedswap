const {ENUM_TRANSFER_STATUS} = require("../utils/Constants");
const DatabaseService = require("./DatabaseService");
const { Op } = require("sequelize");
const util = require('../utils/utils');

class TransferHistoryService extends DatabaseService{

    TransferHistory;

    constructor(sequelize) {
        super(sequelize);
        this.TransferHistory = this.models.TransferHistory;
    }

    async create(deposit, t) {
        let item = {
            seqNo: deposit.seqNo,
            amount: deposit.amount,
            blockHash: deposit.blockHash,
            blockNo: deposit.blockNo,
            confirmStatus: deposit.confirmStatus,
            networkCode: deposit.networkCode,
            onchainStatus: deposit.onchainStatus,
            symbol: deposit.symbol,
            tag: deposit.tag,
            txHash: deposit.txHash,
            transferStatus: ENUM_TRANSFER_STATUS.PENDING,
            resend: false
        };
        await this.TransferHistory.create(item, {transaction: t});
        return item;
    }

    async getAll() {
        return await this.TransferHistory.findAll({
            where: {}
        });
    }

    async getByPk(id) {
        return await this.TransferHistory.findByPk(id);
    }

    async findLatestSeqNo() {
        return await this.TransferHistory.max('seqNo') || 0;
    }

    async findResendTransfer(){
        return await this.TransferHistory.findAll({ 
            where: {
                resend:true, 
                resendTransferId:{[Op.is]:null}
            }, 
            order:[['id', 'ASC']]});
    }

    async isExist(seqNo) {
        let count = await this.TransferHistory.count({ where: {seqNo: seqNo} });
        return count !== 0;
    }

    async transferComplete(seqNo, transferTxHash, transaction) {
        await this.TransferHistory.update({transferStatus: ENUM_TRANSFER_STATUS.COMPLETED, transferTxHash}, {where: {seqNo: seqNo} }, {transaction});
    }

    async transferRevert(seqNo, transferTxHash, transaction) {
        const errMsg = "Transaction reverted";
        await this.TransferHistory.update({transferStatus: ENUM_TRANSFER_STATUS.REVERTED, transferTxHash, errMsg}, {where: {seqNo: seqNo} }, {transaction});
    }

    async transferFail(seqNo, errMsg, transaction) {
        await this.TransferHistory.update({transferStatus: ENUM_TRANSFER_STATUS.FAIL, errMsg}, {where: {seqNo: seqNo} }, {transaction});
    }

    async delete(seqNo) {
        await this.TransferHistory.destroy({where: {seqNo: seqNo} });
    }

    async transferDeposit(deposit){
        // execute transfer if record not existed.
        if (await this.isExist(deposit.seqNo)) {
            return false;
        }
          
        let transferItem = await this.inTransaction(async (t) => {
            return await this.create(deposit, t);
        });
        
        return await this.sendTransferDeposit(transferItem)
    }

    async sendTransferDeposit(transferItem){
        try{
            let transferReceipt = await util.transfer(transferItem);
            await this.inTransaction(async (t) => {         
                if(transferReceipt.status){
                    // Transfer success
                    await this.transferComplete(transferItem.seqNo, transferReceipt.transactionHash||"", t);
                }else{
                    // Transfer revert
                    await this.transferRevert(transferItem.seqNo, transferReceipt.transactionHash||"", t);
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
            await this.transferFail(transferItem.seqNo, errMsg, t);
            });
            console.error("errMsg", e);
            return false;
        }
    }
}

module.exports = TransferHistoryService;