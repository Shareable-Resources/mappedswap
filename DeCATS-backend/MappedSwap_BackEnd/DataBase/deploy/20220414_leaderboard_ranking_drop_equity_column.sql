-- Deploy database:20220414_leaderboard_ranking_drop_equity_column to pg

BEGIN;

-- XXX Add DDLs here.
ALTER TABLE t_decats_leaderboard_rankings
  DROP COLUMN equity_start;
ALTER TABLE t_decats_leaderboard_rankings
  DROP COLUMN equity_end;
COMMIT;
