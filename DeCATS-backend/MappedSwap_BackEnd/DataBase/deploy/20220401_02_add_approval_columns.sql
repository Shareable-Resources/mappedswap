-- Deploy database:20220401_02_add_approval_columns to pg

BEGIN;

-- XXX Add DDLs here.
ALTER TABLE public.t_decats_event_approvals
ADD COLUMN approved_by_id DECIMAL(78, 0) NULL;
COMMENT ON COLUMN public.t_decats_event_approvals.approved_by_id IS 'Approved by who from front end approval';

ALTER TABLE public.t_decats_event_approvals
ADD COLUMN approved_date timestamptz NULL;
COMMENT ON COLUMN public.t_decats_event_approvals.approved_date IS 'Approved date from front end approval';

ALTER TABLE public.t_decats_event_approvals
ADD COLUMN round_id DECIMAL(78, 0) NULL;
COMMENT ON COLUMN public.t_decats_event_approvals.round_id IS 'Round id from front end approval';


COMMENT ON COLUMN public.t_decats_event_approvals.status IS '0 (Pending), 1 (Approved), 2 (Disted)';

COMMENT ON COLUMN public.t_decats_event_participants.address IS 'Wallet address';


ALTER TABLE public.t_decats_event_approvals ADD CONSTRAINT t_decats_event_approvals_round_id_key UNIQUE (round_id);
ALTER TABLE public.t_decats_event_participants ADD CONSTRAINT t_decats_event_participants_event_id_approval_id_address_key UNIQUE (event_id, approval_id, address);

COMMIT;
