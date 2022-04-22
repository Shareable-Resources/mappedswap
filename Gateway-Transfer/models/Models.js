const TransferHistoryModel = require("./TransferHistory");
const TransferEunRewardModel = require("./TransferEunReward");

module.exports = (sequelize, sync=false) => {
    let TransferHistory = TransferHistoryModel(sequelize);
    let TransferEunReward = TransferEunRewardModel(sequelize);

    if(sync){
        sequelize.sync({force: true});
    }

    return {TransferHistory, TransferEunReward}
};