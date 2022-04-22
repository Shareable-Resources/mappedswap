-- Revert database:20220303_add_column_unrealized_interest_profit_daily_reports from pg

BEGIN;

-- 2022-03-03
-- for storing unrealized_interest
ALTER TABLE public.t_decats_profit_daily_reports
DROP COLUMN unrealized_interest;

COMMIT;
