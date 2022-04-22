-- Verify database:20220304_add_column_profit_and_loss_profit_and_loss_reports on pg

BEGIN;

-- XXX Add verifications here.
SELECT profit_and_loss from t_decats_profit_and_loss_reports LIMIT 1;
ROLLBACK;
