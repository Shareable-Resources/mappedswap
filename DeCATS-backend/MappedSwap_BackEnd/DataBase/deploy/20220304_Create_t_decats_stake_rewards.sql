-- Deploy database:20220304_Create_t_decats_stake_rewards to pg

BEGIN;

-- XXX Add DDLs here.
CREATE TABLE public.t_decats_stake_rewards (
	id bigserial NOT NULL,
	pool_token varchar(225),
	address varchar(50) NULL,
	stake_amount numeric,
	stake_rewards_amount numeric,
	stake_time int8,
	node_id varchar(100), 
	stake_hash varchar(500),
	block_number varchar(100),
	status int2,
	created_date timestamptz NULL,
	last_modified_date timestamptz NULL,
	CONSTRAINT t_decats_stake_rewards_pkey PRIMARY KEY (id)
);


COMMIT;
