-- Verify database:20220331_02_alter_table_event_txHash_null on pg

BEGIN;

-- XXX Add verifications here.
SELECT * from "public"."t_decats_event_approvals" LIMIT 1;
SELECT * from "public"."t_decats_event_participants" LIMIT 1;
ROLLBACK;
