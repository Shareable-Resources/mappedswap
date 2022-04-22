-- Verify database:20220309_2_t_decats_connected_wallets on pg

BEGIN;

-- XXX Add verifications here.
SELECT id from t_decats_connected_wallets LIMIT 1;
ROLLBACK;
