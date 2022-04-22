-- Revert database:20220227_add_constraint_commission_distributions from pg

BEGIN;

-- 2022-02-27
-- for adding association for t_decats_commission_distributions and 
ALTER TABLE public.t_decats_commission_distributions DROP CONSTRAINT t_decats_commission_distributions_agent_id_fkey;

COMMIT;
