-- Deploy database:20220303_create_table_profit_and_loss_reports to pg

BEGIN;

-- XXX Add DDLs here.
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
COMMENT ON TABLE public.t_decats_profit_and_loss_reports IS 'Profit And Loss Report represents everyday profit and loss of a customer';
COMMENT ON COLUMN public.t_decats_profit_and_loss_reports.equity_start IS 'sum(convert_to_usd_value(balance - unrealized_interest)) of createdDate - 2 day, convert_to_usd_value is using t_decats_block_price for reference, unrealized_interest is using 23:00:00.000-23:59:59.999 last total_interest of that date';
COMMENT ON COLUMN public.t_decats_profit_and_loss_reports.equity_end IS 'sum(convert_to_usd_value(balance - unrealized_interest)) of createdDate - 1 day, convert_to_usd_value is using t_decats_block_price for reference, unrealized_interest is using 23:00:00.000-23:59:59.999 last total_interest of that date';
COMMENT ON COLUMN public.t_decats_profit_and_loss_reports.net_cash_in_usdm IS 'net_cash_in_usdm is sum of (t_decats_balance_histories.amount * t_decats_balance_histories.price)';

COMMIT;
