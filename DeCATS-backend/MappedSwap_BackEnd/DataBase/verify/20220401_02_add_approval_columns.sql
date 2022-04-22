-- Verify database:20220401_02_add_approval_columns on pg

BEGIN;

-- XXX Add verifications here.
SELECT approved_by_id from t_decats_event_approvals LIMIT 1;
ROLLBACK;
