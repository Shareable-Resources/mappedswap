-- Verify database:20220224_add_column_price_balances_histories on pg

BEGIN;

SELECT price from t_decats_balances_histories LIMIT 1;

ROLLBACK;
