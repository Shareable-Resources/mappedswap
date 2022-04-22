-- Verify database:20220318_create_table_example_table on pg

BEGIN;

-- XXX Add verifications here.
SELECT * from "public"."t_decats_example_tables" LIMIT 1;

ROLLBACK;
