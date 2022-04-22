-- Verify database:20220311_Add_indexes on pg

BEGIN;

-- XXX Add verifications here.
select *
from pg_indexes
where indexname ='t_decats_price_histories_pair_name_interval_created_date' limit 1;
select *
from pg_indexes
where indexname ='t_decats_block_prices_pair_name_created_date' limit 1;
select *
from pg_indexes
where indexname ='t_decats_transactions_created_date_customer_id' limit 1;
select *
from pg_indexes
where indexname ='t_decats_interest_histories_created_date' limit 1;
select *
from pg_indexes
where indexname ='t_decats_interest_histories_customer_id_created_date' limit 1;

ROLLBACK;
