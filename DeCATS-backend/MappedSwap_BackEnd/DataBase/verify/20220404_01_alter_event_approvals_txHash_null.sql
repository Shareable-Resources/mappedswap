-- Verify database:20220404_01_alter_event_approvals_txHash_null on pg

BEGIN;

-- XXX Add verifications here.
SELECT tx_hash from t_decats_event_approvals LIMIT 1;
ROLLBACK;
