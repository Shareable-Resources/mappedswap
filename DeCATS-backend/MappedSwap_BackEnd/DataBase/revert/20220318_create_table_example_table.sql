-- Revert database:20220318_create_table_example_table from pg

BEGIN;

-- XXX Add DDLs here.
DROP TABLE "public"."t_decats_example_tables" ;

COMMIT;
