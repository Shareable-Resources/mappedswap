-- Revert database:202204142_create_table_event_trade_volumes from pg

BEGIN;

-- XXX Add DDLs here.
DROP TABLE t_decats_event_trade_volumes;

COMMIT;
