-- Revert database:20220401_02_add_approval_columns from pg

BEGIN;

-- XXX Add DDLs here.
ALTER TABLE public.t_decats_event_approvals
DROP COLUMN approved_by_id;
ALTER TABLE public.t_decats_event_approvals
DROP COLUMN approved_date;
ALTER TABLE public.t_decats_event_approvals
DROP COLUMN round_id;

COMMENT ON COLUMN public.t_decats_event_approvals.status IS '0 (Approved), 1 (Distributed)';
COMMENT ON COLUMN public.t_decats_event_participants.address IS '0 (Inactive), 1 (Active)';

--ALTER TABLE public.t_decats_event_approvals DROP CONSTRAINT t_decats_event_approvals_round_id_key;
ALTER TABLE public.t_decats_event_participants DROP CONSTRAINT t_decats_event_participants_event_id_approval_id_address_key;
COMMIT;
