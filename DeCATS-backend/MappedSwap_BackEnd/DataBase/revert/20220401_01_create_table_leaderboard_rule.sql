-- Revert database:20220401_01_create_table_leaderboard_rule from pg

BEGIN;

-- XXX Add DDLs here.
DROP TABLE t_decats_leaderboard_rules;

COMMIT;
