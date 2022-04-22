import Customer from '../../../general/model/dbModel/Customer';
import seq from '../sequelize';
import { Op, QueryTypes, Transaction } from 'sequelize';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import globalVar from '../const/globalVar';
export async function getBotCustomer() {
  const modelModule = seq.sequelize.models;
  let botCustomer: Customer = (await modelModule[
    SeqModel.name.Customer
  ].findOne({
    where: {
      address: {
        [Op.iLike]: `%${globalVar.foundationConfig.smartcontract.MappedSwap['OwnedUpgradeableProxy<PriceAdjust>'].address}%`,
      },
    },
  })) as any;
  if (!botCustomer) {
    throw new Error('Bot customer does not exists');
  }
  botCustomer = JSON.parse(JSON.stringify(botCustomer));
  return botCustomer;
}
