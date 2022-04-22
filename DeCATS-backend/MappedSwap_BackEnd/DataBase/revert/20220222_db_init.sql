-- Revert database:20220222_db_init from pg

BEGIN;

-- XXX Add DDLs here.
DROP TABLE t_decats_commission_distributions;
DROP TABLE t_decats_referral_code;
DROP TABLE t_decats_funding_code;
DROP TABLE t_decats_commission_summaries;
DROP TABLE t_decats_commission_ledgers;
DROP TABLE t_decats_commission_jobs;
DROP TABLE t_decats_balances_histories;
DROP TABLE t_decats_balances;
DROP TABLE t_decats_transfer_histories;
DROP TABLE t_decats_transfer_eun_rewards;
DROP TABLE t_decats_transactions;
DROP TABLE t_decats_tokens;
DROP TABLE t_decats_stopouts;
DROP TABLE t_decats_profit_daily_reports;
DROP TABLE t_decats_prices;
DROP TABLE t_decats_price_histories_ref;
DROP TABLE t_decats_price_histories;
DROP TABLE t_decats_pair_daily_reports;
DROP TABLE t_decats_mst_price;
DROP TABLE t_decats_mst_dist_rules;
DROP TABLE t_decats_mining_rewards_distribution;
DROP TABLE t_decats_mining_rewards;
DROP TABLE t_decats_interest_histories;
DROP TABLE t_decats_customers_credit_updates;
DROP TABLE t_decats_customers;
DROP TABLE t_decats_cron_jobs;
DROP TABLE t_decats_buy_back_details;
DROP TABLE t_decats_burn_transactions;
DROP TABLE t_decats_block_prices;
DROP TABLE t_decats_balances_snapshots;
DROP TABLE t_decats_agents;
DROP TABLE t_decats_agent_daily_reports_real_time;
DROP TABLE t_decats_agent_daily_reports;
COMMIT;
