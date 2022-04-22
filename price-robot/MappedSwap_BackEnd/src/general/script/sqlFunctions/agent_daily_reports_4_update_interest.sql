CREATE OR REPLACE FUNCTION public.agent_daily_reports_4_update_interest(var_selected_date date, var_agent_id bigint)
 RETURNS TABLE("like" t_decats_agent_daily_reports)
 LANGUAGE plpgsql
AS $function$
   declare var_root_agent_interest_percentage DECIMAL;
begin
--0. [Set] RootAgentPercentage variable	
select interest_percentage
into var_root_agent_interest_percentage
from t_decats_agents tda where tda.id=var_agent_id limit 1;


RAISE NOTICE 'Agent Percentage: %  ', var_root_agent_interest_percentage;
--1. Update 
-- direct_interest
-- direct_interest_income
-- last_modified_date
update
       t_decats_agent_daily_reports t1
set
       direct_interest = t2.direct_interest,
       direct_interest_income =  t2.direct_interest_income,
       last_modified_date = t2.last_modified_date
from
(
   select 
   var_agent_id as agent_id, 
   "name" as "token",
   coalesce(direct_interest,0) as direct_interest,
   coalesce(direct_interest_income,0) as direct_interest_income,
   now()  as last_modified_date
   from t_decats_tokens t_token 
   left join
   (
       select 
               tdih.agent_id, 
               "token",
               (sum(interest)) as direct_interest,
               (sum(interest) * (var_root_agent_interest_percentage/100)) as direct_interest_income
               from t_decats_interest_histories tdih
               inner join t_decats_agents a on a.id =tdih.agent_id
               where  tdih.agent_id =var_agent_id and tdih.created_date::date=var_selected_date
               group by agent_id,a.interest_percentage ,"token" 
   ) direct_info on t_token."name"=direct_info."token"
) as t2
where
   t1."token" = t2."token"
   and t1.created_date = var_selected_date
   and t1."agent_id" = var_agent_id;



-- 2. Updates 
-- 2.1 Create temp table to save sub agent information
DROP TABLE IF exists temp_agent_adj_tree_info_interest;
CREATE temp table temp_agent_adj_tree_info_interest 
(
   root_agent_id bigint, 
   node_agent_id bigint,
   root_agent_child_agent_id bigint,
   root_agent_child_agent_id_interest_percentage numeric
) ;
delete from temp_agent_adj_tree_info_interest;
insert into temp_agent_adj_tree_info_interest
   select 
   root_agent_id,
   node_agent_id,
   root_agent_child_agent_id,
   a.interest_percentage as root_agent_child_agent_id_interest_percentage
   from  t_decats_agents a
   inner JOIN
   (
       select 
       sub.id as node_agent_id, 
       sub.ancestors[1] as root_agent_id,
       case when sub.ancestors[2] is null then sub.id else sub.ancestors[2] end as root_agent_child_agent_id
       from 
       agent_daily_reports_0_get_all_agent_childrens (var_agent_id) as sub
   )  t2 on a.id =t2.root_agent_child_agent_id;


-- 2.2 Create temp table to save sub agent information
WITH agent_sum_info AS
(
select 
a.id,
"token",
all_sub_agent_interest,
(all_sub_agent_interest * (a.interest_percentage/100)) as all_sub_agent_interest_income,
all_child_agent_interest_income
from
(
   select
   root_agent_id as agent_id, sum(interest)  as all_sub_agent_interest, 
   "token",
   sum (tx_interest_income_for_child_agent) as all_child_agent_interest_income
   from 
   (
       select
       root_agent_id,
       node_agent_id,
       root_agent_child_agent_id,
       root_agent_child_agent_id_interest_percentage,
       tdih.interest ,
       tdih."token" as "token",
       (root_agent_child_agent_id_interest_percentage/100) * tdih.interest as  tx_interest_income_for_child_agent
       from temp_agent_adj_tree_info_interest
       inner join t_decats_interest_histories tdih on tdih.agent_id = temp_agent_adj_tree_info_interest.node_agent_id
       where tdih.created_date::date=var_selected_date
       ) subagent group by root_agent_id , "token"
) interest inner join t_decats_agents a on a.id =interest.agent_id
)



-- 2.3 Actual update
-- all_sub_agent_interest
-- all_sub_agent_interest_income
-- all_child_agent_interest_income
-- last_modified_date
update
       t_decats_agent_daily_reports t1
set
       all_sub_agent_interest = t2.all_sub_agent_interest,
       all_sub_agent_interest_income = t2.all_sub_agent_interest_income,
       all_child_agent_interest_income =  t2.all_child_agent_interest_income,
       last_modified_date = now()
from 
(
   select 
       agent_sum_info.id as agent_id,	--selected_id
       t_token."name" as "token",
       coalesce(all_sub_agent_interest,0) as all_sub_agent_interest,
       coalesce(all_sub_agent_interest_income,0) as all_sub_agent_interest_income,
       coalesce(all_child_agent_interest_income,0) as all_child_agent_interest_income from t_decats_tokens t_token 
   left join
       agent_sum_info on t_token."name" =agent_sum_info."token"
) t2 where
   t1."token" = t2."token"
   and t1.created_date = var_selected_date
   and t1."agent_id" = var_agent_id;

-- 2.4 Update lump sum
-- interest_income
-- net_agent_interest_income
-- net_interest_income
-- last_modified_date
update
       t_decats_agent_daily_reports t1
set
       interest_income = t2.all_sub_agent_interest_income + t2.direct_interest_income,
       net_agent_interest_income = t2.all_sub_agent_interest_income - t2.all_child_agent_interest_income,
       net_interest_income = t2.all_sub_agent_interest_income - t2.all_child_agent_interest_income+ t2.direct_interest_income,
       last_modified_date = now(),
       status=4
from
       (
   select
       id,
       all_child_agent_interest_income,
       all_sub_agent_interest_income ,
       direct_interest_income 
   from
       t_decats_agent_daily_reports tdadr
   where  tdadr.agent_id=var_agent_id and tdadr.created_date =var_selected_date
) as t2
where t1.id=t2.id;


RAISE NOTICE 'Interest is updated for agent (%) at %  ', var_agent_id , var_selected_date;

RAISE NOTICE 'select * from t_decats_agent_daily_reports tdadr where tdadr.created_date=var_selected_date and tdadr.agent_id=var_agent_id';
return query(
select * from t_decats_agent_daily_reports tdadr where tdadr.created_date=var_selected_date and agent_id =var_agent_id
);
end;
$function$
;
