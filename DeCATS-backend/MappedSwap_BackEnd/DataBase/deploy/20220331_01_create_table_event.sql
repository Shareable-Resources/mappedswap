-- Deploy database:20220331_01_create_table_event to pg

BEGIN;

-- XXX Add DDLs here.

-- t_decats_events
CREATE TABLE IF NOT EXISTS "public"."t_decats_events" (
  "id" BIGSERIAL, 
  "code" VARCHAR(10) UNIQUE, 
  "name" VARCHAR(64), 
  "created_date" TIMESTAMP WITH TIME ZONE NOT NULL, 
  "created_by_id" BIGINT NOT NULL, 
  "last_modified_by_id" BIGINT NOT NULL, 
  "last_modified_date" TIMESTAMP WITH TIME ZONE NOT NULL, 
  "status" SMALLINT NOT NULL, 
  "budget" DECIMAL, 
  "quota" DECIMAL, 
  "token" VARCHAR(64) NOT NULL, 
  "dist_type" SMALLINT NOT NULL, 
  PRIMARY KEY ("id")
);
COMMENT ON TABLE "public"."t_decats_events" IS 'Event can be created by agent to promote and grant rewards';
COMMENT ON COLUMN "public"."t_decats_events"."code" IS 'Event code';
COMMENT ON COLUMN "public"."t_decats_events"."name" IS 'Name of the event';
COMMENT ON COLUMN "public"."t_decats_events"."created_date" IS 'Created Date';
COMMENT ON COLUMN "public"."t_decats_events"."last_modified_date" IS 'Last Modified Date';
COMMENT ON COLUMN "public"."t_decats_events"."status" IS '0 (Inactive), 1 (Active)';
COMMENT ON COLUMN "public"."t_decats_events"."budget" IS 'Budget of the event';
COMMENT ON COLUMN "public"."t_decats_events"."quota" IS 'No of participants that can join the event';
COMMENT ON COLUMN "public"."t_decats_events"."token" IS 'Token name';
COMMENT ON COLUMN "public"."t_decats_events"."dist_type" IS '0 (M Token), 1 (MST Token)';


-- t_decats_event_approvals
CREATE TABLE IF NOT EXISTS "public"."t_decats_event_approvals" (
  "id" BIGSERIAL, 
  "event_id" BIGINT NOT NULL REFERENCES "public"."t_decats_events" ("id") ON DELETE CASCADE ON UPDATE CASCADE, 
  "created_date" TIMESTAMP WITH TIME ZONE NOT NULL, 
  "created_by_id" BIGINT NOT NULL, 
  "last_modified_by_id" BIGINT NOT NULL, 
  "last_modified_date" TIMESTAMP WITH TIME ZONE NOT NULL, 
  "amt" DECIMAL NOT NULL, 
  "tx_hash" VARCHAR(255) NOT NULL, 
  "status" SMALLINT NOT NULL, 
  PRIMARY KEY ("id")
);
COMMENT ON TABLE "public"."t_decats_event_approvals" IS 'Each approval record represents a successful upload of address for event distribution';
COMMENT ON COLUMN "public"."t_decats_event_approvals"."event_id" IS 'Event id';
COMMENT ON COLUMN "public"."t_decats_event_approvals"."created_date" IS 'Created Date';
COMMENT ON COLUMN "public"."t_decats_event_approvals"."last_modified_date" IS 'Last Modified Date';
COMMENT ON COLUMN "public"."t_decats_event_approvals"."amt" IS 'Approved Allowance';
COMMENT ON COLUMN "public"."t_decats_event_approvals"."tx_hash" IS 'Transaction Hash from contract call';
COMMENT ON COLUMN "public"."t_decats_event_approvals"."status" IS '0 (Approved), 1 (Distributed)';


-- t_decats_event_participants
CREATE TABLE IF NOT EXISTS "public"."t_decats_event_participants" (
  "id" BIGSERIAL, 
  "event_id" BIGINT NOT NULL REFERENCES "public"."t_decats_events" ("id") ON DELETE CASCADE ON UPDATE CASCADE, 
  "approval_id" BIGINT NOT NULL, 
  "created_date" TIMESTAMP WITH TIME ZONE NOT NULL, 
  "address" VARCHAR(64) NOT NULL, 
  "amt" DECIMAL, 
  "tx_hash" VARCHAR(255) NOT NULL, 
  "status" SMALLINT NOT NULL, 
  "disted_date" TIMESTAMP WITH TIME ZONE NOT NULL, 
  "disted_by_id" BIGINT, 
  "last_modified_date" TIMESTAMP WITH TIME ZONE NOT NULL, 
  PRIMARY KEY ("id")
);
COMMENT ON TABLE "public"."t_decats_event_participants" IS 'participants of an event ';
COMMENT ON COLUMN "public"."t_decats_event_participants"."event_id" IS 'Event id';
COMMENT ON COLUMN "public"."t_decats_event_participants"."approval_id" IS 'Approval id';
COMMENT ON COLUMN "public"."t_decats_event_participants"."created_date" IS 'Created Date';
COMMENT ON COLUMN "public"."t_decats_event_participants"."address" IS '0 (Inactive), 1 (Active)';
COMMENT ON COLUMN "public"."t_decats_event_participants"."amt" IS 'Amount of distribution';
COMMENT ON COLUMN "public"."t_decats_event_participants"."tx_hash" IS 'Transaction Hash from contract call';
COMMENT ON COLUMN "public"."t_decats_event_participants"."status" IS '0 (pending), 1(disted)';
COMMENT ON COLUMN "public"."t_decats_event_participants"."disted_date" IS 'Distribute Date';
COMMENT ON COLUMN "public"."t_decats_event_participants"."disted_by_id" IS 'Distributed by which agent';
COMMENT ON COLUMN "public"."t_decats_event_participants"."last_modified_date" IS 'Last Modified Date';

COMMIT;
