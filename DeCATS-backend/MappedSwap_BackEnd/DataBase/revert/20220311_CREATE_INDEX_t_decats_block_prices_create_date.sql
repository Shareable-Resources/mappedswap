-- Revert database:20220311_CREATE_INDEX_t_decats_block_prices_create_date from pg

BEGIN;

-- XXX Add DDLs here.
DROP index if EXISTS t_decats_block_prices_create_date;

COMMIT;
