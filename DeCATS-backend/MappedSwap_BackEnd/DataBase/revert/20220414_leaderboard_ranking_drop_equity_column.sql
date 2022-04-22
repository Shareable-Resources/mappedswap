-- Revert database:20220414_leaderboard_ranking_drop_equity_column from pg

BEGIN;

-- XXX Add DDLs here.
ALTER TABLE t_decats_leaderboard_rankings
  ADD equity_start  DECIMAL not null;
ALTER TABLE t_decats_leaderboard_rankings
  ADD equity_end DECIMAL not null;
COMMIT;
