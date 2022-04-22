-- Verify database:202204142_create_table_event_trade_volumes on pg

BEGIN;

-- XXX Add verifications here.
select id from t_decats_event_trade_volumes LIMIT 1;
ROLLBACK;
