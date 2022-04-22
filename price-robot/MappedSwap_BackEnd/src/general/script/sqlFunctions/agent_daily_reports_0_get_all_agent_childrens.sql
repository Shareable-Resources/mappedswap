CREATE OR REPLACE FUNCTION public.agent_daily_reports_0_get_all_agent_childrens(var_agent_id bigint)
 RETURNS TABLE(id bigint, ancestors bigint[])
 LANGUAGE sql
AS $function$
       WITH RECURSIVE tree AS (
         SELECT t_decats_agents.id, ARRAY[]::bigint[] AS ancestors
         FROM t_decats_agents  WHERE parent_agent_id IS NULL
       
         UNION ALL
       
         SELECT t_decats_agents.id, tree.ancestors || t_decats_agents.parent_agent_id
         FROM t_decats_agents , tree
         WHERE t_decats_agents.parent_agent_id = tree.id
       ) SELECT tree.id,tree.ancestors FROM tree WHERE var_agent_id = ANY(tree.ancestors);

$function$
;
