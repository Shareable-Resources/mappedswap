CREATE OR REPLACE FUNCTION public.agent_daily_reports_5_update_transaction_fee(var_selected_date date, var_agent_id bigint)
 RETURNS TABLE("like" t_decats_agent_daily_reports)
 LANGUAGE plpgsql
AS $function$
   declare var_root_agent_fee_percentage DECIMAL;
   declare var_tx_fee_percentage DECIMAL;
begin
--0. [Set] RootAgentPercentage variable	
select 0.003 into var_tx_fee_percentage;
select fee_percentage
into var_root_agent_fee_percentage
from t_decats_agents tda where tda.id=var_agent_id limit 1;


RAISE NOTICE 'Agent Percentage: %  ', var_root_agent_fee_percentage;
--1. Update 
-- turn_over
-- direct_fee
-- direct_fee_income
-- last_modified_date
update
       t_decats_agent_daily_reports t1
set
       turn_over = t2.turn_over,
       direct_fee = t2.direct_fee,
       direct_fee_income =  t2.direct_fee_income,
       last_modified_date = t2.last_modified_date
from
(
   select 
   var_agent_id as agent_id, 
   "name" as "token",
   coalesce(turn_over,0) as turn_over,
   coalesce(direct_fee,0) as direct_fee,
   coalesce(direct_fee_income,0) as direct_fee_income,
   now()  as last_modified_date
   from t_decats_tokens t_token 
   left join
   (
       select 
               tdt.agent_id , 
               sell_token as "token",
               sum(sell_amount) as turn_over,
               (sum(sell_amount) * var_tx_fee_percentage) as direct_fee,
               (sum(sell_amount) * var_tx_fee_percentage * (var_root_agent_fee_percentage/100)) as direct_fee_income
               from t_decats_transactions tdt 
               inner join t_decats_agents a on a.id =tdt.agent_id
               where  tdt.agent_id =var_agent_id and tdt.created_date::date=var_selected_date
               group by agent_id,a.fee_percentage,sell_token 
   ) direct_info on t_token."name"=direct_info."token"
) as t2
where
   t1."token" = t2."token"
   and t1.created_date = var_selected_date
   and t1."agent_id" = var_agent_id;



-- 2. Updates 
-- 2.1 Create temp table to save sub agent information
DROP TABLE IF exists temp_agent_adj_tree_info;
CREATE temp table temp_agent_adj_tree_info 
(
   root_agent_id bigint, 
   node_agent_id bigint,
   root_agent_child_agent_id bigint,
   root_agent_child_agent_id_fee_percentage numeric
) ;
delete from temp_agent_adj_tree_info;
insert into temp_agent_adj_tree_info
   select 
   root_agent_id,
   node_agent_id,
   root_agent_child_agent_id,
   a.fee_percentage as root_agent_child_agent_id_fee_percentage
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
all_sub_agent_fee,
(all_sub_agent_fee * (a.fee_percentage/100)) as all_sub_agent_fee_income,
all_child_agent_fee_income
from
(
   select
   root_agent_id as agent_id, sum(sell_amount)  as all_sub_agent_fee, 
   "token",
   sum (tx_fee_income_for_child_agent) as all_child_agent_fee_income
   from 
   (
       select
       root_agent_id,
       node_agent_id,
       root_agent_child_agent_id,
       root_agent_child_agent_id_fee_percentage,
       tdt.sell_amount,
       tdt."sell_token" as "token",
       (root_agent_child_agent_id_fee_percentage/100)*tdt.sell_amount as  tx_fee_income_for_child_agent
       from temp_agent_adj_tree_info
       inner join t_decats_transactions tdt 
       on tdt.agent_id = temp_agent_adj_tree_info.node_agent_id
       where tdt.created_date::date=var_selected_date
   ) subagent group by root_agent_id , "token"
) fee inner join t_decats_agents a on a.id =fee.agent_id
)



-- 2.3 Actual update
-- all_sub_agent_fee
-- all_sub_agent_fee_income
-- all_child_agent_fee_income
-- last_modified_date
update
       t_decats_agent_daily_reports t1
set
       all_sub_agent_fee = t2.all_sub_agent_fee,
       all_sub_agent_fee_income = t2.all_sub_agent_fee_income,
       all_child_agent_fee_income =  t2.all_child_agent_fee_income,
       last_modified_date = now()
from 
(
   select 
       agent_sum_info.id as agent_id,	--selected_id
       t_token."name" as "token",
       coalesce(all_sub_agent_fee * var_tx_fee_percentage,0) as all_sub_agent_fee,
       coalesce(all_sub_agent_fee_income* var_tx_fee_percentage,0) as all_sub_agent_fee_income,
       coalesce(all_child_agent_fee_income* var_tx_fee_percentage,0) as all_child_agent_fee_income from t_decats_tokens t_token 
   left join
       agent_sum_info on t_token."name" =agent_sum_info."token"
) t2 where
   t1."token" = t2."token"
   and t1.created_date = var_selected_date
   and t1."agent_id" = var_agent_id;

-- 2.4 Update lump sum
-- fee_income
-- net_agent_fee_income
-- net_fee_income
-- last_modified_date
update
       t_decats_agent_daily_reports t1
set
       fee_income = t2.all_sub_agent_fee_income + t2.direct_fee_income,
       net_agent_fee_income = t2.all_sub_agent_fee_income - t2.all_child_agent_fee_income,
       net_fee_income = t2.all_sub_agent_fee_income - t2.all_child_agent_fee_income+ t2.direct_fee_income,
       last_modified_date = now(),
       status=5
from
       (
   select
       id,
       all_child_agent_fee_income,
       all_sub_agent_fee_income ,
       direct_fee_income 
   from
       t_decats_agent_daily_reports tdadr
   where  tdadr.agent_id=var_agent_id and tdadr.created_date =var_selected_date
) as t2
where t1.id=t2.id;


RAISE NOTICE 'Transaction is updated for agent (%) at %  ', var_agent_id , var_selected_date;

RAISE NOTICE 'select * from t_decats_agent_daily_reports tdadr where tdadr.created_date=var_selected_date and tdadr.agent_id=var_agent_id';
return query(
   select * from t_decats_agent_daily_reports tdadr where tdadr.created_date=var_selected_date and agent_id =var_agent_id
);
end;
$function$
;
