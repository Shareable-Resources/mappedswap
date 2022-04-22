-- Deploy database:20220304_add_column_profit_and_loss_profit_and_loss_reports to pg

BEGIN;

-- 2022-03-04
-- for storing profit and loss
-- public.t_decats_profit_and_loss_reports definition
ALTER TABLE public.t_decats_profit_and_loss_reports
ADD COLUMN profit_and_loss DECIMAL(78, 0);
COMMENT ON COLUMN public.t_decats_profit_and_loss_reports.profit_and_loss IS  'equityEnd - equityStart - netCashInUSDM';

COMMIT;
