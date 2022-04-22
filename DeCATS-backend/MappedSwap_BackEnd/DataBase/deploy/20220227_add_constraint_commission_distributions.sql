-- Deploy database:20220227_add_constraint_commission_distributions to pg

BEGIN;

-- 2022-02-27
-- for adding association for t_decats_commission_distributions and 
ALTER TABLE public.t_decats_commission_distributions ADD CONSTRAINT t_decats_commission_distributions_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES t_decats_agents(id) ON UPDATE CASCADE ON DELETE CASCADE;


COMMIT;
