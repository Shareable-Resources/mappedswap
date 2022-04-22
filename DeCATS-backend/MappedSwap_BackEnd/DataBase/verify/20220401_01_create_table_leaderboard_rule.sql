-- Verify database:20220401_01_create_table_leaderboard_rule on pg

BEGIN;

-- XXX Add verifications here.
SELECT id from t_decats_leaderboard_rules LIMIT 1;

ROLLBACK;
