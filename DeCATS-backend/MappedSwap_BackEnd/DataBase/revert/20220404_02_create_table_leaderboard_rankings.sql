-- Revert database:20220404_create_table_leaderboard_rankings from pg

BEGIN;

-- XXX Add DDLs here.
DROP TABLE t_decats_leaderboard_rankings;

COMMIT;