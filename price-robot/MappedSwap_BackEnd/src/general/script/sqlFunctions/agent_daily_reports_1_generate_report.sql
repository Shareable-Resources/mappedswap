CREATE OR REPLACE FUNCTION public.agent_daily_reports_1_generate_report(var_selected_date date, var_agent_id bigint)
 RETURNS TABLE("like" t_decats_agent_daily_reports)
 LANGUAGE plpgsql
AS $function$
   declare cnt INTEGER;

begin
-- Check if the report already exists, if status = 6 means the report already finish
select
   into
   cnt COUNT(*)
from
   t_decats_agent_daily_reports report
where 
   report.status = '7'
   and report.agent_id = var_agent_id
   and report.created_date::date = var_selected_date::date;

if (cnt > 0) then 
   RAISE NOTICE 'Report already generated for agent % at %',var_agent_id,var_selected_date;
else
   
   -- 2. Remove report from var_selected_date of this agent id, and insert to agent_daily_reports
	--> token
	--> agent_id
	--> parent_agent_id
	--> fee_percentage
	--> interest_percentage
	--> created_date
	--> last_modified_date
	--> status = 2
   perform agent_daily_reports_2_upsert_report(var_selected_date,var_agent_id);
   -- 3. Update direct_used_fee
	--> direct_used_fee
	--> all_sub_agent_direct_used_fee
	--> last_modified_date
	--> status = 3
   perform agent_daily_reports_3_update_direct_used_fee(var_selected_date,var_agent_id);
   -- 4. Update interest fees
	--> direct_interest
	--> direct_interest_income
	--> last_modified_date
	--> all_sub_agent_interest
	--> all_sub_agent_interest_income
	--> all_child_agent_interest_income
	--> interest_income
	--> net_agent_interest_income
	--> net_fee_income
	--> net_interest_income
	--> status = 4
   perform agent_daily_reports_4_update_interest(var_selected_date,var_agent_id);
   -- 5. Update transaction fees
	--> turn_over
	--> direct_fee
	--> direct_fee_income
	--> all_sub_agent_fee
	--> all_sub_agent_fee_income
	--> all_child_agent_fee_income
	--> ee_income
	--> net_agent_fee_income
	--> net_fee_income
	--> last_modified_date
	--> status = 5 
   perform agent_daily_reports_5_update_transaction_fee(var_selected_date,var_agent_id);
   
   -- 6. Update total_income
    --> total_income
  	--> status = 6
   perform agent_daily_reports_6_update_lump_sum(var_selected_date,var_agent_id);
   -- 7. Truncate total_income to keep 6 decimals only
    --> total_income
    --> status = 7
   perform agent_daily_reports_7_update_total_income_truncate(var_selected_date,var_agent_id);
  
end if;

return query(
select
   *
from
   t_decats_agent_daily_reports where created_date=var_selected_date and agent_id=var_agent_id
);
end;

$function$
;
