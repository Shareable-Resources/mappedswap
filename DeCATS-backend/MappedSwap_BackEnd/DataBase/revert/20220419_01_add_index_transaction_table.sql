-- Revert database:20220419_01_add_index_transaction_table from pg

BEGIN;

-- XXX Add DDLs here.
DROP index t_decats_transactions_created_date;

COMMIT;
