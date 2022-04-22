-- Verify database:20220404_create_table_leaderboard_rankings on pg

BEGIN;

-- XXX Add verifications here.
SELECT id from t_decats_leaderboard_rankings LIMIT 1;

ROLLBACK;
