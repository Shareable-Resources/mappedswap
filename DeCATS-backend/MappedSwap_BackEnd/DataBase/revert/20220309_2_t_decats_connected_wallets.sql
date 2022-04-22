-- Revert database:20220309_2_t_decats_connected_wallets from pg

BEGIN;

-- XXX Add DDLs here.
DROP TABLE t_decats_connected_wallets;

COMMIT;
