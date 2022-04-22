const agent_daily_reports_0_get_all_agent_childrens = `
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
`;

const agent_daily_reports_1_generate_report = `
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

`;

const agent_daily_reports_2_upsert_report = `
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
`;

const agent_daily_reports_3_update_direct_used_fee = `
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
`;

const agent_daily_reports_4_update_interest = `
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

`;

const agent_daily_reports_5_update_transaction_fee = `
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
`;

const agent_daily_reports_6_update_lump_sum = `
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
`;

const first_agg = `
CREATE OR REPLACE FUNCTION public.first_agg(anyelement, anyelement)
 RETURNS anyelement
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
        SELECT $1;
$function$
;


`;
const last_agg = `
CREATE OR REPLACE FUNCTION public.last_agg(anyelement, anyelement)
 RETURNS anyelement
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
        SELECT $2;
$function$
;
`;

const commision_job_1_get_n_days_record = `
create or replace
function public.commision_job_1_get_n_days_record(var_date_from date,
var_date_to date,
var_job_id bigint)
 returns table(job_id bigint,
token character varying,
agent_id bigint,
address character varying,
sign_data character varying,
dist_commision numeric,
created_date timestamp with time zone)
 language plpgsql
as $function$
begin
return query(
with dayReport as
(
select
	t1.agent_id,
	t1."token",
	sum(total_income) as total_income
from
	t_decats_agent_daily_reports t1
where
	t1.created_date between var_date_from and var_date_to
group by
	t1.agent_id,
	t1."token"
order by
	t1.agent_id
)
select
	var_job_id::bigint as job_id,
	dayReport."token" as "token",
	dayReport."agent_id" as agent_id,
	tda."address" as address,
	tda.sign_data as sign_data,
	dayReport."total_income" as dist_commision,
	now() as created_date
from
	dayReport
inner join t_decats_agents tda on
	tda.id = dayReport.agent_id
order by
	"agent_id",
	"token");
end;

$function$
;
`;

const agent_daily_reports_7_update_total_income_truncate = `
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
`;

const first = `
CREATE AGGREGATE public.first (
   sfunc    = public.first_agg,
   basetype = anyelement,
   stype    = anyelement
);
`;
const last = `
CREATE AGGREGATE public.last (
   sfunc    = public.last_agg,
   basetype = anyelement,
   stype    = anyelement
);
`;
const sqlFuncs = [
  /*
  {
    name: 'agent_daily_reports_0_get_all_agent_childrens',
    sql: agent_daily_reports_0_get_all_agent_childrens,
  },
  {
    name: 'agent_daily_reports_1_generate_report',
    sql: agent_daily_reports_1_generate_report,
  },
  {
    name: 'agent_daily_reports_2_upsert_report',
    sql: agent_daily_reports_2_upsert_report,
  },
  {
    name: 'agent_daily_reports_3_update_direct_used_fee',
    sql: agent_daily_reports_3_update_direct_used_fee,
  },
  {
    name: 'agent_daily_reports_4_update_interest',
    sql: agent_daily_reports_4_update_interest,
  },
  {
    name: 'agent_daily_reports_5_update_transaction_fee',
    sql: agent_daily_reports_5_update_transaction_fee,
  },
  {
    name: 'agent_daily_reports_6_update_lump_sum',
    sql: agent_daily_reports_6_update_lump_sum,
  },
  {
    name: 'agent_daily_reports_7_update_total_income_truncate',
    sql: agent_daily_reports_7_update_total_income_truncate,
  },
  {
    name: 'commision_job_1_get_n_days_record',
    sql: commision_job_1_get_n_days_record,
  },*/
  {
    name: 'first_agg',
    sql: first_agg,
  },
  {
    name: 'last_agg',
    sql: last_agg,
  },
  {
    name: 'last',
    sql: last,
  },
  {
    name: 'first',
    sql: first,
  },
];
export default sqlFuncs;
