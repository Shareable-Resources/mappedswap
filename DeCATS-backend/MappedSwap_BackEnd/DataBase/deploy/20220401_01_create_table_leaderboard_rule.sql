-- Deploy database:20220401_01_create_table_leaderboard_rule to pg

BEGIN;

-- XXX Add DDLs here.
 CREATE TABLE IF NOT EXISTS "public"."t_decats_leaderboard_rules" (
     "id"   BIGSERIAL , 
     "rank" SMALLINT NOT NULL, 
     "percentage_of_price" DECIMAL NOT NULL, PRIMARY KEY ("id")
); COMMENT ON TABLE "public"."t_decats_leaderboard_rules" IS 'Specifying sequlize config'; 

CREATE UNIQUE INDEX "t_decats_leaderboard_rules_rank" ON "public"."t_decats_leaderboard_rules" ("rank") ;
COMMENT ON TABLE public.t_decats_leaderboard_rules IS 'Describe the percentage of rewards for leader board activities';



COMMIT;
