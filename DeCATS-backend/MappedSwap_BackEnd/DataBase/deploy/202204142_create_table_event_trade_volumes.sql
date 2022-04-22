-- Deploy database:202204142_create_table_event_trade_volumes to pg

BEGIN;

-- XXX Add DDLs here.
CREATE TABLE IF NOT EXISTS "public"."t_decats_event_trade_volumes" (
    "id"   BIGSERIAL , "customer_id" BIGINT NOT NULL , 
    "address" VARCHAR(50) NOT NULL , 
    "amt" DECIMAL NOT NULL , 
    "acheived_date" TIMESTAMP WITH TIME ZONE , 
    "first_tx_date" TIMESTAMP WITH TIME ZONE NOT NULL , 
    "last_tx_date" TIMESTAMP WITH TIME ZONE NOT NULL , 
    "last_scanned_id" BIGINT NOT NULL , 
    PRIMARY KEY ("id")
); 

CREATE UNIQUE INDEX "t_decats_event_trade_volumes_customer_id" ON "public"."t_decats_event_trade_volumes" ("customer_id");
COMMENT ON TABLE "public"."t_decats_event_trade_volumes" IS 'Specifying sequlize config'; 
COMMENT ON COLUMN "public"."t_decats_event_trade_volumes"."customer_id" IS 'Customer id';
COMMENT ON COLUMN "public"."t_decats_event_trade_volumes"."address" IS 'address'; 
COMMENT ON COLUMN "public"."t_decats_event_trade_volumes"."amt" IS 'amount of trade volume till now'; 
COMMENT ON COLUMN "public"."t_decats_event_trade_volumes"."acheived_date" IS 'Wallet address';
COMMENT ON COLUMN "public"."t_decats_event_trade_volumes"."first_tx_date" IS 'First tx date'; 
COMMENT ON COLUMN "public"."t_decats_event_trade_volumes"."last_tx_date" IS 'Last tx date';
COMMENT ON COLUMN "public"."t_decats_event_trade_volumes"."last_scanned_id" IS 'Last scanned id from t_decats_transactions';


COMMIT;
