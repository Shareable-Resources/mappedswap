-- Verify database:20220331_01_create_table_event on pg

BEGIN;

-- XXX Add verifications here.
SELECT * from "public"."t_decats_events" LIMIT 1;
SELECT * from "public"."t_decats_event_approvals" LIMIT 1;
SELECT * from "public"."t_decats_event_participants" LIMIT 1;
ROLLBACK;
