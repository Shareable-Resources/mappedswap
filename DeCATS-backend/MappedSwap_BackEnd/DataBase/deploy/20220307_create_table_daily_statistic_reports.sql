-- Deploy database:20220307_create_table_daily_statistic_reports to pg

BEGIN;

-- XXX Add DDLs here.
create table if not exists "public"."t_decats_daily_statistic_reports" ("id" BIGSERIAL ,
"no_of_active_addresses" DECIMAL(78) ,
"no_of_connected_wallets" DECIMAL(78) ,
"date_from" TIMESTAMP with TIME zone,
"date_to" TIMESTAMP with TIME zone,
"created_date" TIMESTAMP with TIME zone not null,
primary key ("id")); 
COMMENT ON TABLE "public"."t_decats_daily_statistic_reports" IS 'daily count for statistic'; 
COMMENT ON COLUMN "public"."t_decats_daily_statistic_reports"."no_of_active_addresses" IS 'The number of distinct active addresses (addresses from t_decats_balance_histories + t_decats_interest_histories)'; 
comment on
column "public"."t_decats_daily_statistic_reports"."no_of_connected_wallets" is 'The number of distinct connected wallets (addresses from t_decats_wallet_connections)';

COMMIT;
