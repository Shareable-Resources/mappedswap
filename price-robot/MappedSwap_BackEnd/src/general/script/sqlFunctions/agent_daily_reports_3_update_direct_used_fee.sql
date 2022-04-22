CREATE OR REPLACE FUNCTION public.agent_daily_reports_3_update_direct_used_fee(var_selected_date date, var_agent_id bigint)
 RETURNS TABLE("like" t_decats_agent_daily_reports)
 LANGUAGE plpgsql
AS $function$
   declare cnt INTEGER;

begin
--1. Update 
-- direct_used_fee
-- last_modified_date
-- Create records of different token for var_agent_id at var_selected_date
   update
       t_decats_agent_daily_reports t1
   set
       direct_used_fee = coalesce(t2.direct_used_fee,0),
       last_modified_date = now()
   from
       (
       select 
            "name" as "token",
            direct_used_fee
       from t_decats_tokens t_token 
       left join 
       (
           select
                           "token",
                           sum(case when balance >= 0 then 0 else balance * -1 end) as direct_used_fee
           from
                           t_decats_balances tdb
           where
                           tdb.customer_id in(
               select
                               id as customer_id
               from
                               t_decats_customers tdc
               where
                               tdc.agent_id = var_agent_id
           )
           group by
               "token"
       ) direct_info on t_token."name"=direct_info."token"
       ) as t2 where t1."token"=t2."token" and t1.created_date=var_selected_date and t1."agent_id"=var_agent_id;
 
-- 2. Updates 
-- 2.1 Create temp table to save sub agent information
DROP TABLE IF exists temp_agent_adj_tree_info_direct_used_fee;
CREATE temp table temp_agent_adj_tree_info_direct_used_fee 
(
   root_agent_id bigint, 
   node_agent_id bigint,
   root_agent_child_agent_id bigint
) ;
delete from temp_agent_adj_tree_info_direct_used_fee;
insert into temp_agent_adj_tree_info_direct_used_fee
   select 
   root_agent_id,
   node_agent_id,
   root_agent_child_agent_id
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
all_sub_agent_direct_used_fee
from
	(
	   select
	   root_agent_id as agent_id, sum(case when balance >= 0 then 0 else balance * -1 end)  as all_sub_agent_direct_used_fee, 
	   "token"
	   from 
	   (
	       select
	       root_agent_id,
	       node_agent_id,
	       root_agent_child_agent_id,
	       balance,
	       tdb."token" as "token"
	       from temp_agent_adj_tree_info_direct_used_fee
	       inner join t_decats_balances tdb on tdb.agent_id = temp_agent_adj_tree_info_direct_used_fee.node_agent_id
	       ) subagent group by root_agent_id, "token"
	) used_fee inner join t_decats_agents a on a.id =used_fee.agent_id
)


-- 2.3 Actual update
-- all_sub_agent_direct_used_fee
-- last_modified_date
update
       t_decats_agent_daily_reports t1
set
       all_sub_agent_direct_used_fee = t2.all_sub_agent_direct_used_fee,
       last_modified_date = now(),
       status=3
from 
(
   select 
       agent_sum_info.id as agent_id,	--selected_id
       t_token."name" as "token",
       coalesce(all_sub_agent_direct_used_fee,0) as all_sub_agent_direct_used_fee from t_decats_tokens t_token 
   left join
       agent_sum_info on t_token."name" =agent_sum_info."token"
) t2 where
   t1."token" = t2."token"
   and t1.created_date = var_selected_date
   and t1."agent_id" = var_agent_id;
  
  
  
  
RAISE NOTICE 'Direct used fee is updated for agent (%) at %  ', var_agent_id , var_selected_date;

RAISE NOTICE 'select * from t_decats_agent_daily_reports tdadr where tdadr.created_date=var_selected_date and tdadr.agent_id=var_agent_id';
return query(
select * from t_decats_agent_daily_reports tdadr where tdadr.created_date=var_selected_date and agent_id =var_agent_id
);

end;
$function$
;
