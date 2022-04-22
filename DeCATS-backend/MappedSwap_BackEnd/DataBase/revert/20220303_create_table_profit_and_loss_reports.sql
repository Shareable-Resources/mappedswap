-- Revert database:20220303_create_table_profit_and_loss_reports from pg

BEGIN;

-- XXX Add DDLs here.
DROP TABLE t_decats_profit_and_loss_reports;

COMMIT;
