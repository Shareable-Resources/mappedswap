-- Revert database:20220310_Alter_t_decats_stake_rewards from pg

BEGIN;

-- XXX Add DDLs here.
DROP TABLE IF EXISTS t_decats_stake_rewards CASCADE;

COMMIT;
