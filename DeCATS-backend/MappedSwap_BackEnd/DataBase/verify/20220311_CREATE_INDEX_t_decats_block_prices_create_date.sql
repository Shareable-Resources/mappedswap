-- Verify database:20220311_CREATE_INDEX_t_decats_block_prices_create_date on pg

BEGIN;

-- XXX Add verifications here.
select *
from pg_indexes
where indexname ='t_decats_block_prices_create_date' limit 1;

ROLLBACK;
