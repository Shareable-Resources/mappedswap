-- Revert database:20220316_create_index_on_reports from pg

BEGIN;

-- XXX Add DDLs here.
DROP index t_decats_profit_and_loss_reports_created_date;
DROP index t_decats_pair_daily_reports_created_date;
DROP index t_decats_profit_daily_reports_created_date;
DROP index t_decats_daily_statistic_reports_created_date;

COMMIT;
