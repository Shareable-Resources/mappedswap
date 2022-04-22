-- Revert database:20220227_add_column_unrealized_interest_balances_snapshots from pg

BEGIN;

-- 2022-02-27
-- for adding unrealized interest for balance snap shot to calculate PNL
ALTER TABLE public.t_decats_balances_snapshots
DROP COLUMN unrealized_interest;

COMMIT;
