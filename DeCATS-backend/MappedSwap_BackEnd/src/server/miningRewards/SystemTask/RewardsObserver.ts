import seq from '../sequelize';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import logger from '../util/ServiceLogger';
import Web3 from 'web3';
import schedule from 'node-schedule';
import globalVar from '../const/globalVar';
import { MiningRewardsStatus } from '../../../general/model/dbModel/MiningRewards';
import { crytoDecimalPlace } from '../../../general/model/dbModel/Prices';
import miningRewardsService from '../service/MiningRewardsService';
import BN from 'bn.js';

const modelModule = seq.sequelize.models;

export class RewardsObserver {
  async observeMiningRewardJob(inputCurrentTime?: any) {
    const date = new Date();
    logger.info(`start observeMiningRewardJobs ${date}`);

    const t = await seq.sequelize.transaction();

    const MSTMiningPoolAddress =
      globalVar.foundationConfig.smartcontract.MappedSwap[
        'OwnedBeaconProxy<MST>'
      ].address;

    const tokenList: any = [];
    tokenList.push(MSTMiningPoolAddress.toString());

    const payoutList: [string, (number | string | BN)[]][] = [];

    try {
      const processingRecord = await modelModule[
        SeqModel.name.MiningRewards
      ].findAll({
        transaction: t,
        where: {
          status: MiningRewardsStatus.Processing,
        },
      });

      if (processingRecord && processingRecord.length > 0) {
        for (let i = 0; i < processingRecord.length; i++) {
          const mstPrice = processingRecord[i]
            .getDataValue('mstExchangeRate')
            .toString();

          if (mstPrice) {
            const jobId = processingRecord[i].getDataValue('id').toString();
            const roundId = processingRecord[i]
              .getDataValue('roundId')
              .toString();

            const distributionsResult = await modelModule[
              SeqModel.name.MiningRewardsDistribution
            ].findAll({
              transaction: t,
              where: {
                jobId: jobId,
              },
            });

            if (distributionsResult && distributionsResult.length > 0) {
              for (let j = 0; j < distributionsResult.length; j++) {
                let amountList: (number | string | BN)[] = [];

                const distributionsId = distributionsResult[j]
                  .getDataValue('id')
                  .toString();
                const usdcAmount = distributionsResult[j]
                  .getDataValue('UsdcAmount')
                  .toString();

                const uAddress = distributionsResult[j]
                  .getDataValue('address')
                  .toString();

                // const updateAmount = Math.trunc(
                //   (usdcAmount / mstPrice) * 10 ** crytoDecimalPlace.MST,
                // );

                const bnUsdcAmount = new BN(usdcAmount, 0);
                const bnMstPrice = new BN(mstPrice, 0);
                const crytoDecimal = 10 ** crytoDecimalPlace.MST;
                const bnCrytoDecimalPlace = new BN(
                  crytoDecimal.toLocaleString('fullwide', {
                    useGrouping: false,
                  }),
                  0,
                );

                // const updateAmount = bnUsdcAmount
                //   .div(bnMstPrice)
                //   .mul(bnCrytoDecimalPlace);
                const updateAmount = bnUsdcAmount
                  .mul(bnCrytoDecimalPlace)
                  .div(bnMstPrice);

                logger.info(`bnUsdcAmount: ${bnUsdcAmount.toString()}`);
                logger.info(`bnMstPrice: ${bnMstPrice.toString()}`);
                logger.info(`updateAmount: ${updateAmount.toString()}`);

                // const updateAmount: any = bnUsdcAmount.div(bnMstPrice);

                // updateAmount.toString(null, crytoDecimal)

                // const updateAmount = new BN(usdcAmount, 0)
                //   .div(new BN(mstPrice, 0))
                //   .mul(new BN(10 ** crytoDecimalPlace.MST, 0));

                // const updateAmount = Math.trunc((usdcAmount / mstPrice) * 10 ** crytoDecimalPlace.MST);

                const miningRewardsDistribution: DBModel.MiningRewardsDistribution =
                  new DBModel.MiningRewardsDistribution();

                // miningRewardsDistribution.amount = updateAmount.toLocaleString(
                //   'fullwide',
                //   {
                //     useGrouping: false,
                //   },
                // );

                // amountList.push(
                //   updateAmount.toLocaleString('fullwide', {
                //     useGrouping: false,
                //   }),
                // );

                miningRewardsDistribution.amount = updateAmount.toString();
                amountList.push(updateAmount.toString());

                const updateMiningRewardsDistributionResult: any =
                  await modelModule[
                    SeqModel.name.MiningRewardsDistribution
                  ].update(miningRewardsDistribution, {
                    fields: ['amount'],
                    where: {
                      id: distributionsId,
                    },
                    transaction: t,
                  });

                if (updateMiningRewardsDistributionResult[0] <= 0) {
                  await t.rollback();

                  logger.info(
                    `update error on distributions id: ${jobId}`,
                    miningRewardsDistribution,
                  );

                  return;
                } else {
                  payoutList.push([uAddress, amountList]);
                  amountList = [];
                }
              }

              const miningReward: DBModel.MiningRewards =
                new DBModel.MiningRewards();

              miningReward.status = MiningRewardsStatus.Finished;
              miningReward.lastModifiedDate = date;

              const updateMiningRewardsResult: any = await modelModule[
                SeqModel.name.MiningRewards
              ].update(miningReward, {
                fields: ['status', 'lastModifiedDate'],
                where: {
                  id: jobId,
                },
                transaction: t,
              });

              if (updateMiningRewardsResult[0] > 0) {
                logger.info(`update distributions with jobId ${jobId} success`);

                const miningReward = {
                  tokenList: tokenList,
                  payoutList: payoutList,
                };

                const service: miningRewardsService =
                  new miningRewardsService();

                await service.proccessCreatedEvent(roundId, miningReward, t);

                // await t.commit();
              } else {
                logger.info(`update distributions with jobId ${jobId} failed`);

                await t.rollback();
              }
            } else {
              await t.rollback();

              logger.info(`No distributions found with jobId: ${jobId}`);
            }
          } else {
            await t.rollback();

            logger.info(`No mst price found`);
          }
        }
      } else {
        await t.rollback();

        logger.info(`No processing record found`);
      }
    } catch (e: any) {
      await t.rollback();

      logger.error(e);
      return e;
    }

    logger.info(`end observeMiningRewardJobs ${date}`);
  }
}
