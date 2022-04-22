-- Revert database:20220331_02_alter_table_event_txHash_null from pg

BEGIN;

-- XXX Add DDLs here.
ALTER TABLE t_decats_event_participants ALTER COLUMN tx_hash SET NOT NULL;
ALTER TABLE t_decats_event_approvals ALTER COLUMN tx_hash SET NOT NULL;

COMMIT;
