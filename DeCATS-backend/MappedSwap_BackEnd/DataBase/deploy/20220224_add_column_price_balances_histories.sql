-- Deploy database:20220224_add_column_price_balances_histories to pg

BEGIN;

-- 2022-02-24
-- for adding price column to table
ALTER TABLE t_decats_balances_histories
ADD COLUMN price numeric;


COMMIT;
