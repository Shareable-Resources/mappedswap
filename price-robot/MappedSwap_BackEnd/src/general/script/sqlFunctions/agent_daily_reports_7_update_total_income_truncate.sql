CREATE OR REPLACE FUNCTION public.agent_daily_reports_7_update_total_income_truncate(var_selected_date date, var_agent_id bigint)
 RETURNS TABLE("like" t_decats_agent_daily_reports)
 LANGUAGE plpgsql
AS $function$
   declare var_keep_decimals INTEGER :=6;					     -- the keeped decimals
   
begin
update
       t_decats_agent_daily_reports t1
set
       total_income = t2.total_income_truncate,
       status=7
from
       (
		select
			tdadr.id,
			agent_id,
			"token",
			total_income,
			case when total_income =0 then 0 else 
			total_income-(total_income%((10^(tdt.decimals-6))::bigint)) end as total_income_truncate,
			tdt.decimals,
			created_date
			--,tdt.decimals-var_keep_decimals as noOfZero,
		from
			t_decats_agent_daily_reports tdadr 
		inner join t_decats_tokens tdt on tdadr."token" =tdt."name" 
		where  tdadr.agent_id=var_agent_id and tdadr.created_date =var_selected_date

) as t2
where
   t1."id" = t2."id";
RAISE NOTICE 'total_income of agent daily report is trucated for agent (%) at %  ', var_agent_id , var_selected_date;
return query(
	select * from t_decats_agent_daily_reports tdadr where tdadr.created_date=var_selected_date and agent_id =var_agent_id
);
end;
$function$
;
