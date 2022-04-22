-- Verify database:20220303_add_column_unrealized_interest_profit_daily_reports on pg

BEGIN;

-- XXX Add verifications here.
SELECT unrealized_interest from t_decats_profit_daily_reports  LIMIT 1;

ROLLBACK;
