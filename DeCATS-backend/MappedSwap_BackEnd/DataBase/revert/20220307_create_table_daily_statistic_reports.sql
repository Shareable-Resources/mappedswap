-- Revert database:20220307_create_table_daily_statistic_reports from pg

BEGIN;

-- XXX Add DDLs here.
-- for storing daily statistic count
DROP TABLE t_decats_daily_statistic_reports;

COMMIT;
