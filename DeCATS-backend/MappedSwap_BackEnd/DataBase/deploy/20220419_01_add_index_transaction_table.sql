-- Deploy database:20220419_01_add_index_transaction_table to pg

BEGIN;

-- XXX Add DDLs here.
CREATE INDEX t_decats_transactions_created_date ON t_decats_transactions
(
    created_date 
);

COMMIT;
