-- Deploy database:20220303_add_column_unrealized_interest_profit_daily_reports to pg

BEGIN;

-- XXX Add DDLs here.
-- for storing unrealized_interest
ALTER TABLE public.t_decats_profit_daily_reports
ADD COLUMN unrealized_interest DECIMAL(78, 0);
COMMENT ON COLUMN public.t_decats_profit_daily_reports.unrealized_interest IS 'The sum of unrealized_interest from t_decats_balance_snapshots';

COMMIT;
