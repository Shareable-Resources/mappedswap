CREATE OR REPLACE FUNCTION public.agent_daily_reports_6_update_lump_sum(var_selected_date date, var_agent_id bigint)
 RETURNS TABLE("like" t_decats_agent_daily_reports)
 LANGUAGE plpgsql
AS $function$

begin
   
-- Update lump sum
-- total_income
update
       t_decats_agent_daily_reports t1
set
       total_income = t2.net_fee_income + t2.net_interest_income,
       status=6
from
       (
   select
       id,
       net_fee_income,
       net_interest_income
   from
       t_decats_agent_daily_reports tdadr
   where  tdadr.agent_id=var_agent_id and tdadr.created_date =var_selected_date
) as t2
where t1.id=t2.id;

RAISE NOTICE 'Lump sum of agent daily report is updated for agent (%) at %  ', var_agent_id , var_selected_date;
RAISE NOTICE 'select * from t_decats_agent_daily_reports tdadr where tdadr.created_date=var_selected_date and tdadr.agent_id=var_agent_id';
return query(
select * from t_decats_agent_daily_reports tdadr where tdadr.created_date=var_selected_date and agent_id =var_agent_id
);
end;
$function$
;
