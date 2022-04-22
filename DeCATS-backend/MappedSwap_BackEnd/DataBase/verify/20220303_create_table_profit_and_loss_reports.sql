-- Verify database:20220303_create_table_profit_and_loss_reports on pg

BEGIN;

-- XXX Add verifications here.
SELECT unrealized_interest from t_decats_profit_daily_reports LIMIT 1;

ROLLBACK;
