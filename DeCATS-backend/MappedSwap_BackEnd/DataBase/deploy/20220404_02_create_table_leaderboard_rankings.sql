-- Deploy database:20220404_create_table_leaderboard_rankings to pg

BEGIN;

-- XXX Add DDLs here.
create table if not exists "public"."t_decats_leaderboard_rankings" ("id" BIGSERIAL ,
"customer_id" BIGINT not null references "public"."t_decats_customers" ("id") on
delete
	cascade on
	update
		cascade,
		"equity_start" DECIMAL not null,
		"equity_end" DECIMAL not null,
		"net_cast_in_usdm" DECIMAL not null,
		"profit_and_loss" DECIMAL not null,
		"rule_id" BIGINT not null,
		primary key ("id"));

CREATE UNIQUE INDEX "t_decats_leaderboard_rankings_id" ON "public"."t_decats_leaderboard_rankings" ("id");
COMMENT ON TABLE public.t_decats_leaderboard_rankings IS 'Top 20 customers with highest PNL, (calculation start from leader board event start), calculate every 15 mins';
COMMENT ON TABLE public.t_decats_leaderboard_rankings IS 'id is a serial, auto-increment id';
COMMENT ON TABLE public.t_decats_leaderboard_rankings IS 'customer_id is id from t_decats_customer';
COMMENT ON TABLE public.t_decats_leaderboard_rankings IS 'rule_id is id from t_decats_leaderboard_rules';

COMMIT;
