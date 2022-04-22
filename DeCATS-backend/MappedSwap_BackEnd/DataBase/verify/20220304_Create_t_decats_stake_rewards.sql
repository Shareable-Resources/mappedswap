-- Verify database:20220304_Create_t_decats_stake_rewards on pg

BEGIN;

-- XXX Add verifications here.
select * from t_decats_stake_rewards LIMIT 1;

ROLLBACK;
