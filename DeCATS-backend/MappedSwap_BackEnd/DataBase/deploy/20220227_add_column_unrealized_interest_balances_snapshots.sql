-- Deploy database:20220227_add_column_unrealized_interest_balances_snapshots to pg

BEGIN;

-- 2022-02-27
-- for adding unrealized interest for balance snap shot to calculate PNL
ALTER TABLE public.t_decats_balances_snapshots
ADD COLUMN unrealized_interest DECIMAL(78, 0);
COMMENT ON COLUMN public.t_decats_balances_snapshots.unrealized_interest IS 'The total_interest from t_decats_interest_histories';


COMMIT;
