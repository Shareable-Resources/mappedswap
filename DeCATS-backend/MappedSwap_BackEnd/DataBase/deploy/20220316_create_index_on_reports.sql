-- Deploy database:20220316_create_index_on_reports to pg

BEGIN;

-- XXX Add DDLs here.
--t_decats_profit_and_loss_reports
CREATE INDEX t_decats_profit_and_loss_reports_created_date ON
public.t_decats_profit_and_loss_reports
USING btree (created_date DESC);
--t_decats_pair_daily_reports
CREATE INDEX t_decats_pair_daily_reports_created_date ON
public.t_decats_pair_daily_reports
USING btree (created_date DESC);
--t_decats_profit_daily_reports
CREATE INDEX t_decats_profit_daily_reports_created_date ON
public.t_decats_profit_daily_reports
USING btree (created_date DESC);
--t_decats_daily_statistic_reports
CREATE INDEX t_decats_daily_statistic_reports_created_date ON
public.t_decats_daily_statistic_reports
USING btree (created_date DESC);
COMMIT;
