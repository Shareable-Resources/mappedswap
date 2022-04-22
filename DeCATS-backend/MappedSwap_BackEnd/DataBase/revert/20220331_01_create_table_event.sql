-- Revert database:20220331_01_create_table_event from pg

BEGIN;

-- XXX Add DDLs here.
DROP TABLE "public"."t_decats_event_participants" ;
DROP TABLE "public"."t_decats_event_approvals" ;
DROP TABLE "public"."t_decats_events" ;



COMMIT;
