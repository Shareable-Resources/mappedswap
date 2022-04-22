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
