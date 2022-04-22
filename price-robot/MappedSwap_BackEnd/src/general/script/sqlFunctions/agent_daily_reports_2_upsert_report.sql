CREATE OR REPLACE FUNCTION public.agent_daily_reports_2_upsert_report(var_selected_date date, var_agent_id bigint)
 RETURNS TABLE("like" t_decats_agent_daily_reports)
 LANGUAGE plpgsql
AS $function$
   declare cnt INTEGER;

begin
-- Create records of different token for var_agent_id at var_selected_date
   RAISE NOTICE 'Delete report for agent : % at %: ', var_agent_id, var_selected_date; 
   delete from t_decats_agent_daily_reports tdadr  where tdadr.agent_id =var_agent_id and tdadr.created_date =var_selected_date;
   
   insert into t_decats_agent_daily_reports ("token","agent_id","parent_agent_id","fee_percentage","interest_percentage","created_date","last_modified_date","status")
   select 
   tdt.name as "token",
   tdg.id as agent_id,
   tdg.parent_agent_id  as parent_agent_id,
   tdg.fee_percentage  as fee_percentage,
   tdg.interest_percentage  as interest_percentage,
   var_selected_date as created_date,
   now() as last_modified_date,
   2 as status
   from 
   t_decats_tokens tdt,
   t_decats_agents tdg where tdg.id =var_agent_id;

   RAISE NOTICE 'Upsert report for agent : % at %: ', var_agent_id, var_selected_date; 
end;
$function$
;
