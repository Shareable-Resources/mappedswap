-- Revert database:20220228_Create_t_decats_testSqitch from pg

BEGIN;

-- XXX Add DDLs here.
drop table t_decats_testsqitch;

COMMIT;
