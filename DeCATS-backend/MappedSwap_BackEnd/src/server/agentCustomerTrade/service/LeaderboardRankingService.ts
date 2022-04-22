import seq from '../sequelize';
import { Op, QueryTypes, Transaction } from 'sequelize';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import globalVar from '../const/globalVar';
import moment from 'moment';

import {
  Customer,
  LeaderBoardRanking,
  LeaderBoardRule,
} from '../../../general/model/dbModel/0_index';
import logger from '../util/ServiceLogger';
import { ResponseBase } from '../../../foundation/server/ApiMessage';
import ProfitAndLossReport from '../../../general/model/dbModel/ProfitAndLossReport';
import { on } from 'winston-daily-rotate-file';
const foundationConfig = globalVar.foundationConfig;
const modelModule = seq.sequelize.models;
export default class Service {
  /**
   * Write top 20 into t_decats_leaderboard_rankings
   */
  async writeTop20Leaderboards() {
    logger.info(`[LeaderboardRankingService] writeTop20Leaderboards`);
    logger.info(`WriteTop20Leaderboards at ${moment().utc().toDate()}`);
    const resp = new ResponseBase();
    const t = await seq.sequelize.transaction();
    try {
      const modelModule = seq.sequelize.models;
      let botCustomer: Customer = (await modelModule[
        SeqModel.name.Customer
      ].findOne({
        where: {
          address: {
            [Op.iLike]: `%${globalVar.foundationConfig.smartcontract.MappedSwap['OwnedUpgradeableProxy<PriceAdjust>'].address}%`,
          },
        },
        transaction: t,
      })) as any;
      if (!botCustomer) {
        throw new Error('Bot customer does not exists');
      }
      botCustomer = JSON.parse(JSON.stringify(botCustomer));
      const botId = botCustomer.id;

      const createdFrom = moment
        .utc(globalVar.eventConfig.top20Leaderboards.dateFrom)
        .startOf('day')
        .add(1, 'day')
        .toDate();
      const createdTo = moment
        .utc(globalVar.eventConfig.top20Leaderboards.dateTo)
        .startOf('day')
        .add(1, 'day')
        .toDate();

      const sql = `
      -- token0, token1 is determined by sorting of ERC20 tokens address
      with recursive token_list as (
        select
            name as "token",
            decimals as "decimals",
            usdm_address,
            usdm_decimals,
            case
                when usdm_address<address then usdm_address
                else address
            end as "token_0_addr",
            case
                when usdm_address<address then usdm_decimals
                else decimals
            end as "token_0_decimal",
            case
                when usdm_address<address then address
                else usdm_address
            end as "token_1_addr",
            case
                when usdm_address<address then decimals
                else usdm_decimals
            end as "token_1_decimal"
        from
            t_decats_tokens,
            (
            select
                address as usdm_address,
                decimals as usdm_decimals
            from
                t_decats_tokens
            where
                name = 'USDM') usdm
        where
            name in ('ETHM', 'BTCM')
              ),
              temp_reserves as (
        select
            token_list."token",
            token_list."decimals",
            "token_0_addr",
            token_list."token_0_decimal",
            "token_1_addr",
            token_list."token_1_decimal",
            "reserve0",
            "reserve1",
            usdm_decimals,
            reserve0 / 10 ^token_list."token_0_decimal" as "reserve0WithDecimal",
            reserve1 / 10 ^token_list."token_1_decimal" as "reserve1WithDecimal",
            case
                when "token_0_addr" = "usdm_address" then 
                      (reserve0 / 10 ^token_list."token_0_decimal")/(reserve1 / 10 ^token_list."token_1_decimal")
                else (reserve1 / 10 ^token_list."token_1_decimal")/(reserve0 / 10 ^token_list."token_0_decimal")
            end as "to_usdm_exchange_rate"
        from
            token_list
        inner join
              (
            select
                replace(replace(pair_name, '/', ''), 'USDM', '') as "token",
                reserve0,
                reserve1
            from
                t_decats_prices) prices on
            token_list."token" = prices."token"
              ),
              tokens_rate as (
        select
            "name" as "token",
            t_decats_tokens."decimals",
            t_decats_tokens.address,
            (
            select
                decimals
            from
                t_decats_tokens tdt
            where
                "name" = 'USDM') as usdm_decimals ,
            case
                when "name" = 'USDM' then 1
                else temp_reserves."to_usdm_exchange_rate"
            end as "to_usdm_exchange_rate"
        from
            t_decats_tokens
        left join temp_reserves on
            temp_reserves."token" = t_decats_tokens."name"
              ),
              equity_of_each_token as (
        select
            null as id,
            tdb."token",
            tokens_rate."to_usdm_exchange_rate",
            tdb.customer_id as "customer_id",
            tdb.balance as "balance",
            tdb.interest as "unrealizedInterest",
            tdb.update_time as "updateTime",
            cast(((tdb.balance-tdb.interest)/ 10 ^tokens_rate.decimals) * tokens_rate."to_usdm_exchange_rate" * 10 ^tokens_rate.usdm_decimals as BIGINT) as "equityOfAnToken"
        from
            t_decats_balances tdb
        inner join tokens_rate on
            tokens_rate."token" = tdb."token")
              ,
              t_equity_end as (
        select
            "customer_id",
            SUM("equityOfAnToken") as "equity_end"
        from
            equity_of_each_token
        group by
            "customer_id" )
              ,
              equity_all as (
        select
            t_equity_end."customer_id",
            t_equity_end."equity_end",
            t_decats_profit_and_loss_reports.equity_end as "equity_start"
        from
            t_equity_end
        left join t_decats_profit_and_loss_reports on
            t_equity_end."customer_id" = t_decats_profit_and_loss_reports.customer_id
            and timezone('UTC',
            t_decats_profit_and_loss_reports.created_date)= current_date::timestamp)
        --select * from equity_all ;
        --select * from tokens_rate;
        -- netCashIn
              ,
              net_cash_in as (
        select
            "customer_id" as "customer_id",
            coalesce ("deposit_amt_in_usdm",
            0) "deposit_amt_in_usdm",
            coalesce ("withdraw_amt_in_usdm",
            0) "withdraw_amt_in_usdm",
            (coalesce ("deposit_amt_in_usdm",
            0) - coalesce ("withdraw_amt_in_usdm",
            0)) as "net_cash_in_usdm"
        from
            (
            select
                "customer_id",
                sum(case when "type" in (3) then (amount /(10 ^tokens_rate.decimals) * price) * 10 ^tokens_rate.usdm_decimals else 0 end) "deposit_amt_in_usdm",
                sum(case when "type" in (4) then (amount /(10 ^tokens_rate.decimals) * price) * 10 ^tokens_rate.usdm_decimals else 0 end) "withdraw_amt_in_usdm"
            from
                t_decats_balances_histories
            inner join tokens_rate on
                t_decats_balances_histories."token" = tokens_rate."token"
            where
                created_date >= current_date::timestamp
                and created_date <= NOW()
            group by
                "customer_id") as t1 ),
              t_curr_profit_and_loss as (
        select
            case
                when net_cash_in."customer_id" is null then equity_all."customer_id"
                else net_cash_in."customer_id"
            end as "customer_id" ,
            coalesce ("deposit_amt_in_usdm",
            0) "deposit_amt_in_usdm",
            coalesce ("withdraw_amt_in_usdm",
            0) "withdraw_amt_in_usdm",
            coalesce ("net_cash_in_usdm",
            0) "net_cash_in_usdm",
            coalesce ("equity_end",
            0) "equity_end",
            coalesce ("equity_start",
            0) "equity_start",
            coalesce ("equity_end",
            0) - coalesce ("equity_start",
            0) - coalesce (net_cash_in."net_cash_in_usdm",
            0) as "profit_and_loss"
        from
            net_cash_in
        full outer join equity_all on
            net_cash_in."customer_id" = equity_all."customer_id" )
          select
            customer_id "customerId",
            --"equityEnd",
            --"equityStart",
            sum(net_cash_in_usdm) "netCashInUSDM",
            sum(profit_and_loss) "profitAndLoss",
            current_date::timestamp as "dateFrom",
            NOW() as "dateTo",
            NOW() as "createdDate",
            NOW() as "lastModifiedDate"
        from
            (
            -- t_curr_profit_and_loss is the pnl from today start till now
            select
                customer_id,
                net_cash_in_usdm,
                --equity_start,
                --equity_end,
                profit_and_loss
            from
                t_curr_profit_and_loss
        union all
            -- t_curr_and_old_profit_and_loss are pnl from previous date
            select
                customer_id,
                sum(net_cash_in_usdm) net_cash_in_usdm,
                --equity_start,
                --equity_end,
                sum(profit_and_loss) profit_and_loss
            from
                t_decats_profit_and_loss_reports
            where
                created_date >= :createdFrom and created_date <=:createdTo
            group by customer_id
          ) t_curr_and_old_profit_and_loss where "customer_id" <> ${botId}
        group by
            customer_id
            order by "profitAndLoss" DESC LIMIT 20`;
      const currentPNLOfAllUsers: ProfitAndLossReport[] =
        (await seq.sequelize.query(sql, {
          raw: true, // Without this `nest` hasn't effect, IDK why,
          type: QueryTypes.SELECT,
          replacements: {
            botId: botId,
            createdFrom: createdFrom,
            createdTo: createdTo,
          },
          transaction: t,
        })) as any;

      const leaderBoardRankings: LeaderBoardRanking[] = [];
      for (let i = 0; i < currentPNLOfAllUsers.length; i++) {
        leaderBoardRankings.push({
          id: null,
          customerId: currentPNLOfAllUsers[i].customerId,
          netCastInUSDM: currentPNLOfAllUsers[i].netCashInUSDM,
          profitAndLoss: currentPNLOfAllUsers[i].profitAndLoss,
          ruleId: i + 1,
        });
      }
      //delete all
      const deleteResults: any = await modelModule[
        SeqModel.name.LeaderBoardRanking
      ].destroy({ where: {}, truncate: true, transaction: t });
      //write 20
      const insertResult: any = await modelModule[
        SeqModel.name.LeaderBoardRanking
      ].bulkCreate(leaderBoardRankings, {
        transaction: t,
      });
      await t.commit();
      resp.success = true;
    } catch (e) {
      resp.success = false;
      resp.msg = `[LeaderboardRankingService] writeTop20Leaderboards cannot create on ${moment()
        .utc()
        .toDate()}`;
      logger.error(resp.msg);
      logger.error(e);
      await t.rollback();
    }
    return resp;
  }
}
