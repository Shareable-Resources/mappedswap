-- Deploy database:20220309_2_t_decats_connected_wallets to pg

BEGIN;

-- XXX Add DDLs here.
-- public.t_decats_connected_wallets definition

CREATE TABLE public.t_decats_connected_wallets (
	id bigserial NOT NULL,
	address varchar(50) NOT NULL, -- Wallet address
	connected_type int2 NOT NULL, -- Connect Type (0:Customer, 1:Agent)
	created_date timestamptz NOT NULL,
	CONSTRAINT t_decats_connected_wallets_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE public.t_decats_connected_wallets IS 'Wallet records which have connected to the system';

-- Column comments
COMMENT ON COLUMN public.t_decats_connected_wallets.address IS 'Wallet address';
COMMENT ON COLUMN public.t_decats_connected_wallets.connected_type IS 'Connect Type (0:Customer, 1:Agent)';

COMMIT;
