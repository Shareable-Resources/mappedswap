-- Revert database:20220304_add_column_profit_and_loss_profit_and_loss_reports from pg

BEGIN;

-- 2022-03-04
-- for storing profit_and_loss
ALTER TABLE public.t_decats_profit_and_loss_reports
DROP COLUMN profit_and_loss;

COMMIT;
