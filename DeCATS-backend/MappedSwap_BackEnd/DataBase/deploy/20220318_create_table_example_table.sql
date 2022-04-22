-- Deploy database:20220318_create_table_example_table to pg

BEGIN;

-- XXX Add DDLs here.
CREATE TABLE IF NOT EXISTS "public"."t_decats_example_tables" 
(
    "id"   BIGSERIAL , 
    "name" VARCHAR(64) NOT NULL, 
    "name_abbr" VARCHAR(64) NOT NULL, 
    "type" SMALLINT NOT NULL, 
    PRIMARY KEY ("id")
); 
COMMENT ON TABLE "public"."t_decats_example_tables" is 'Example table, please check ./doc/2_creating_table.md';

COMMIT;
