-- Verify database:20220316_create_index_on_reports on pg

BEGIN;

-- XXX Add verifications here.
select *
from pg_indexes
where indexname ='t_decats_profit_and_loss_reports_created_date' limit 1;
select *
from pg_indexes
where indexname ='t_decats_pair_daily_reports_created_date' limit 1;
select *
from pg_indexes
where indexname ='t_decats_profit_daily_reports_created_date' limit 1;
select *
from pg_indexes
where indexname ='t_decats_daily_statistic_reports_created_date' limit 1;

ROLLBACK;
