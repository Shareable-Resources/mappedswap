-- Revert database:20220304_Create_t_decats_stake_rewards from pg

BEGIN;

-- XXX Add DDLs here.
DROP TABLE t_decats_stake_rewards;
COMMIT;
