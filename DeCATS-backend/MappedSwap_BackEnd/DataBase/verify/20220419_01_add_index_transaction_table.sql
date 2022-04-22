-- Verify database:20220419_01_add_index_transaction_table on pg

BEGIN;

-- XXX Add verifications here.
select *
from pg_indexes
where indexname ='t_decats_transactions_created_date' limit 1;

ROLLBACK;
