-- Verify database:20220223_data_init on pg

BEGIN;

-- XXX Add verifications here.
SELECT * FROM t_decats_commission_distributions LIMIT 1;
SELECT * FROM t_decats_referral_code LIMIT 1;
SELECT * FROM t_decats_funding_code LIMIT 1;
SELECT * FROM t_decats_commission_summaries LIMIT 1;
SELECT * FROM t_decats_commission_ledgers LIMIT 1;
SELECT * FROM t_decats_commission_jobs LIMIT 1;
SELECT * FROM t_decats_balances_histories LIMIT 1;
SELECT * FROM t_decats_balances LIMIT 1;
SELECT * FROM t_decats_transfer_histories LIMIT 1;
SELECT * FROM t_decats_transfer_eun_rewards LIMIT 1;
SELECT * FROM t_decats_transactions LIMIT 1;
SELECT * FROM t_decats_tokens LIMIT 1;
SELECT * FROM t_decats_stopouts LIMIT 1;
SELECT * FROM t_decats_profit_daily_reports LIMIT 1;
SELECT * FROM t_decats_prices LIMIT 1;
SELECT * FROM t_decats_price_histories_ref LIMIT 1;
SELECT * FROM t_decats_price_histories LIMIT 1;
SELECT * FROM t_decats_pair_daily_reports LIMIT 1;
SELECT * FROM t_decats_mst_price LIMIT 1;
SELECT * FROM t_decats_mst_dist_rules LIMIT 1;
SELECT * FROM t_decats_mining_rewards_distribution LIMIT 1;
SELECT * FROM t_decats_mining_rewards LIMIT 1;
SELECT * FROM t_decats_interest_histories LIMIT 1;
SELECT * FROM t_decats_customers_credit_updates LIMIT 1;
SELECT * FROM t_decats_customers LIMIT 1;
SELECT * FROM t_decats_cron_jobs LIMIT 1;
SELECT * FROM t_decats_buy_back_details LIMIT 1;
SELECT * FROM t_decats_burn_transactions LIMIT 1;
SELECT * FROM t_decats_block_prices LIMIT 1;
SELECT * FROM t_decats_balances_snapshots LIMIT 1;
SELECT * FROM t_decats_agents LIMIT 1;
SELECT * FROM t_decats_agent_daily_reports_real_time LIMIT 1;
SELECT * FROM t_decats_agent_daily_reports LIMIT 1;
ROLLBACK;
