-- Verify database:20220227_add_column_unrealized_interest_balances_snapshots on pg

BEGIN;

-- XXX Add verifications here.
SELECT unrealized_interest from t_decats_balances_snapshots LIMIT 1;

ROLLBACK;
