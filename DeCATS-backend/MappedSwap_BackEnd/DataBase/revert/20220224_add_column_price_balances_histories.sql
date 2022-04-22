-- Revert database:20220224_add_column_price_balances_histories from pg

BEGIN;

ALTER TABLE t_decats_balances_histories
DROP COLUMN price;

COMMIT;
