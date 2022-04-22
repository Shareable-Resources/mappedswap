-- 2022-02-24
-- for adding price column to table
ALTER TABLE t_decats_balances_histories
ADD COLUMN price numeric;

-- 2022-02-27
-- for adding association for t_decats_commission_distributions and 
ALTER TABLE public.t_decats_commission_distributions ADD CONSTRAINT t_decats_commission_distributions_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES t_decats_agents(id) ON UPDATE CASCADE ON DELETE CASCADE


-- 2022-02-27
-- for adding unrealized interest for balance snap shot to calculate PNL
ALTER TABLE public.t_decats_balances_snapshots
ADD COLUMN unrealized_interest DECIMAL(78, 0);
COMMENT ON COLUMN public.t_decats_balances_snapshots.unrealized_interest IS 'The total_interest from t_decats_interest_histories';

-- 2022-03-03
-- for storing PNL
CREATE TABLE public.t_decats_profit_and_loss_reports (
	id bigserial NOT NULL,
	customer_id int8 NOT NULL,
	equity_start numeric(78) NULL, -- sum(convert_to_usd_value(balance - unrealized_interest)) of createdDate - 2 day, convert_to_usd_value is using t_decats_block_price for reference, unrealized_interest is using 23:00:00.000-23:59:59.999 last total_interest of that date
	equity_end numeric(78) NULL, -- sum(convert_to_usd_value(balance - unrealized_interest)) of createdDate - 1 day, convert_to_usd_value is using t_decats_block_price for reference, unrealized_interest is using 23:00:00.000-23:59:59.999 last total_interest of that date
	net_cash_in_usdm numeric(78) NULL, -- net_cash_in_usdm is sum of (t_decats_balance_histories.amount * t_decats_balance_histories.price)
	date_from timestamptz NULL,
	date_to timestamptz NULL,
	created_date timestamptz NOT NULL,
	CONSTRAINT t_decats_profit_and_loss_reports_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE public.t_decats_profit_and_loss_reports IS 'Specifying sequlize config';

-- Column comments

COMMENT ON COLUMN public.t_decats_profit_and_loss_reports.equity_start IS 'sum(convert_to_usd_value(balance - unrealized_interest)) of createdDate - 2 day, convert_to_usd_value is using t_decats_block_price for reference, unrealized_interest is using 23:00:00.000-23:59:59.999 last total_interest of that date';
COMMENT ON COLUMN public.t_decats_profit_and_loss_reports.equity_end IS 'sum(convert_to_usd_value(balance - unrealized_interest)) of createdDate - 1 day, convert_to_usd_value is using t_decats_block_price for reference, unrealized_interest is using 23:00:00.000-23:59:59.999 last total_interest of that date';
COMMENT ON COLUMN public.t_decats_profit_and_loss_reports.net_cash_in_usdm IS 'net_cash_in_usdm is sum of (t_decats_balance_histories.amount * t_decats_balance_histories.price)';
-- 2022-03-04
-- for storing unrealized_interest
ALTER TABLE public.t_decats_profit_daily_reports
ADD COLUMN unrealized_interest DECIMAL(78, 0);
COMMENT ON COLUMN public.t_decats_profit_daily_reports.unrealized_interest IS 'The sum of unrealized_interest from t_decats_balance_snapshots';

-- 2022-03-04
-- for storing profit and loss
-- public.t_decats_profit_and_loss_reports definition
ALTER TABLE public.t_decats_profit_and_loss_reports
ADD COLUMN profit_and_loss DECIMAL(78, 0);
COMMENT ON COLUMN public.t_decats_profit_and_loss_reports.profit_and_loss IS  'equityEnd - equityStart - netCashInUSDM';

-- 2022-03-07
-- for storing daily statistic count
create table if not exists "public"."t_decats_daily_statistic_reports" ("id" BIGSERIAL ,
"no_of_active_addresses" DECIMAL(78) ,
"no_of_connected_wallets" DECIMAL(78) ,
"date_from" TIMESTAMP with TIME zone,
"date_to" TIMESTAMP with TIME zone,
"created_date" TIMESTAMP with TIME zone not null,
primary key ("id")); 
COMMENT ON TABLE "public"."t_decats_daily_statistic_reports" IS 'Specifying sequlize config'; 
COMMENT ON COLUMN "public"."t_decats_daily_statistic_reports"."no_of_active_addresses" IS 'The number of distinct active addresses (addresses from t_decats_balance_histories + t_decats_interest_histories)'; 
comment on
column "public"."t_decats_daily_statistic_reports"."no_of_connected_wallets" is 'The number of distinct connected wallets (addresses from t_decats_wallet_connections)';