const {DataTypes} = require("sequelize");
const {ENUM_TRANSFER_STATUS} = require("../utils/Constants");

module.exports = (sequelize) => {
    return sequelize.define("TransferHistory", {
        id: {
            field: 'id',
            allowNull: false,
            primaryKey: true,
            type: DataTypes.BIGINT,
            autoIncrement: true 
        },
        seqNo: {
            field: 'seq_no',
            allowNull: false,
            type: DataTypes.BIGINT,
        },
        amount: {
            field: 'amount',
            allowNull: false,
            type: DataTypes.DECIMAL
        },
        blockHash: {
            field: 'block_hash',
            allowNull: false,
            type: DataTypes.STRING(80)
        },
        blockNo: {
            field: 'block_no',
            allowNull: false,
            type: DataTypes.BIGINT
        },
        confirmStatus: {
            field: 'confirm_status',
            allowNull: false,
            type: DataTypes.SMALLINT
        },
        networkCode: {
            field: 'network_code',
            allowNull: false,
            type: DataTypes.STRING(50)
        },
        onchainStatus: {
            field: 'onchain_status',
            allowNull: false,
            type: DataTypes.SMALLINT
        },
        symbol: {
            field: 'symbol',
            allowNull: false,
            type: DataTypes.STRING(10)
        },
        tag: {
            field: 'tag',
            allowNull: false,
            type: DataTypes.STRING(50)
        },
        txHash: {
            field: 'tx_hash',
            allowNull: false,
            type: DataTypes.STRING(80)
        },
        transferStatus: {
            field: 'transfer_status',
            allowNull: false,
            type: DataTypes.SMALLINT,
            defaultValue: ENUM_TRANSFER_STATUS.PENDING
        },
        transferTxHash: {
            field: 'transfer_tx_hash',
            allowNull: true,
            type: DataTypes.STRING(80)
        },       
        errMsg: {
            field: 'err_msg',
            allowNull: true,
            type: DataTypes.TEXT,
        },
        resend: {
            field: 'resend',
            allowNull: false,
            type: DataTypes.BOOLEAN,
            default: false
        },
        resendTransferId: {
            field: 'resend_transfer_id',
            allowNull: true,
            type: DataTypes.BIGINT,
        }
    }, {
        tableName: "t_decats_transfer_histories",
        createdAt: 'create_time',
        updatedAt: 'update_time',
        indexes: [
            {
              unique: true,
              fields: ['seq_no']
            },
            {
                fields: ['resend', {name:'id', order: 'ASC'}]
            }
        ] 
    });

    //sequelize.sync({force: true});
}