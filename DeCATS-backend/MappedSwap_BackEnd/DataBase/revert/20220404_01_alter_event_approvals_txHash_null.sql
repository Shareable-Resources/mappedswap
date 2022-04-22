-- Revert database:20220404_01_alter_event_approvals_txHash_null from pg

BEGIN;

-- XXX Add DDLs here.
ALTER TABLE t_decats_event_approvals ALTER COLUMN tx_hash SET NOT NULL;
COMMIT;
