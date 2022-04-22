-- Deploy database:20220331_02_alter_table_event_txHash_null to pg

BEGIN;

-- XXX Add DDLs here.
ALTER TABLE t_decats_event_participants ALTER COLUMN tx_hash DROP NOT NULL;
ALTER TABLE t_decats_event_approvals ALTER COLUMN tx_hash DROP NOT NULL;
COMMIT;
