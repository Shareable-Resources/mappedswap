-- Verify database:20220307_create_table_daily_statistic_reports on pg

BEGIN;

-- XXX Add verifications here.
SELECT id from t_decats_daily_statistic_reports LIMIT 1;

ROLLBACK;
