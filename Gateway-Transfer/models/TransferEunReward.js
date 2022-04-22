const {DataTypes} = require("sequelize");
const {ENUM_TRANSFER_STATUS} = require("../utils/Constants");

module.exports = (sequelize) => {
    return sequelize.define("TransferEunReward", {
        id: {
            field: 'id',
            allowNull: false,
            primaryKey: true,
            type: DataTypes.BIGINT,
            autoIncrement: true 
        },
        address: {
            field: 'address',
            allowNull: false,
            type: DataTypes.STRING(50)
        },
        amount: {
            field: 'amount',
            allowNull: false,
            type: DataTypes.DECIMAL
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
        tableName: "t_decats_transfer_eun_rewards",
        createdAt: 'create_time',
        updatedAt: 'update_time',
        indexes: [
            {
              unique: true,
              fields: ['address']
            },
            {
                fields: ['resend', {name:'id', order: 'ASC'}]
            }
        ]
    });

}


