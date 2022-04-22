-- Deploy database:20220222_db_init to pg

BEGIN;

-- public.t_decats_agent_daily_reports definition

-- Drop table

-- DROP TABLE public.t_decats_agent_daily_reports;

CREATE TABLE public.t_decats_agent_daily_reports (
	id bigserial NOT NULL,
	agent_id int8 NOT NULL,
	parent_agent_id int8 NULL,
	"token" varchar(64) NOT NULL,
	fee_percentage numeric(78, 3) NULL,
	interest_percentage numeric(78, 3) NULL,
	direct_used_fee numeric(78) NULL,
	all_sub_agent_direct_used_fee numeric(78) NULL,
	turn_over numeric(78) NULL,
	accumalative_usdm_amt numeric(78) NULL,
	direct_fee numeric(78) NULL,
	direct_fee_income numeric(78) NULL,
	all_sub_agent_fee numeric(78) NULL,
	all_sub_agent_owned_fee numeric(78) NULL,
	all_sub_agent_fee_income numeric(78) NULL,
	all_child_agent_fee_income numeric(78) NULL,
	direct_interest numeric(78) NULL,
	direct_interest_income numeric(78) NULL,
	all_sub_agent_interest numeric(78) NULL,
	all_sub_agent_owned_interest numeric(78) NULL,
	all_sub_agent_interest_income numeric(78) NULL,
	all_child_agent_interest_income numeric(78) NULL,
	fee_income numeric(78) NULL,
	net_fee_income numeric(78) NULL,
	net_agent_fee_income numeric(78) NULL,
	interest_income numeric(78) NULL,
	net_interest_income numeric(78) NULL,
	net_agent_interest_income numeric(78) NULL,
	total_income numeric(78) NULL,
	dist_m_token_rate numeric NULL,
	dist_mst_token_rate numeric NULL,
	dist_type int2 NOT NULL,
	dist_token numeric(78) NULL,
	dist_token_in_usdm numeric(78) NULL,
	to_usdm_exchange_rate numeric(78) NULL,
	mst_to_usdm_exchange_rate numeric(78) NULL,
	staked_mst numeric(78) NULL,
	tx_fee_grade int4 NULL,
	staked_mst_grade int4 NULL,
	grade int4 NULL,
	commission_rate numeric(78) NULL,
	date_end timestamptz NULL,
	created_date timestamptz NULL,
	status int2 NOT NULL DEFAULT 0,
	cron_job_id int8 NULL,
	CONSTRAINT t_decats_agent_daily_reports_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_agent_daily_reports_agent_id_token_dist_type_created_d ON public.t_decats_agent_daily_reports USING btree (agent_id, token, dist_type, created_date);


-- public.t_decats_agent_daily_reports_real_time definition

-- Drop table

-- DROP TABLE public.t_decats_agent_daily_reports_real_time;

CREATE TABLE public.t_decats_agent_daily_reports_real_time (
	agent_id int8 NOT NULL,
	parent_agent_id int8 NULL,
	"token" varchar(64) NOT NULL,
	fee_percentage numeric(78, 3) NULL,
	interest_percentage numeric(78, 3) NULL,
	direct_used_fee numeric(78) NULL,
	all_sub_agent_direct_used_fee numeric(78) NULL,
	turn_over numeric(78) NULL,
	accumalative_usdm_amt numeric(78) NULL,
	direct_fee numeric(78) NULL,
	direct_fee_income numeric(78) NULL,
	all_sub_agent_fee numeric(78) NULL,
	all_sub_agent_owned_fee numeric(78) NULL,
	all_sub_agent_fee_income numeric(78) NULL,
	all_child_agent_fee_income numeric(78) NULL,
	direct_interest numeric(78) NULL,
	direct_interest_income numeric(78) NULL,
	all_sub_agent_interest numeric(78) NULL,
	all_sub_agent_owned_interest numeric(78) NULL,
	all_sub_agent_interest_income numeric(78) NULL,
	all_child_agent_interest_income numeric(78) NULL,
	fee_income numeric(78) NULL,
	net_fee_income numeric(78) NULL,
	net_agent_fee_income numeric(78) NULL,
	interest_income numeric(78) NULL,
	net_interest_income numeric(78) NULL,
	net_agent_interest_income numeric(78) NULL,
	total_income numeric(78) NULL,
	dist_m_token_rate numeric NULL,
	dist_mst_token_rate numeric NULL,
	dist_type int2 NOT NULL,
	dist_token numeric(78) NULL,
	dist_token_in_usdm numeric(78) NULL,
	to_usdm_exchange_rate numeric(78) NULL,
	mst_to_usdm_exchange_rate numeric(78) NULL,
	staked_mst numeric(78) NULL,
	tx_fee_grade int4 NULL,
	staked_mst_grade int4 NULL,
	grade int4 NULL,
	commission_rate numeric(78) NULL,
	date_end timestamptz NULL,
	created_date timestamptz NULL,
	status int2 NOT NULL DEFAULT 0,
	CONSTRAINT t_decats_agent_daily_reports_real_time_pkey PRIMARY KEY (agent_id, token, dist_type)
);


-- public.t_decats_agents definition

-- Drop table

-- DROP TABLE public.t_decats_agents;

CREATE TABLE public.t_decats_agents (
	id bigserial NOT NULL,
	address varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	email varchar(100) NOT NULL,
	parent_agent_id int8 NULL,
	interest_percentage numeric NOT NULL,
	fee_percentage numeric NOT NULL,
	created_date timestamptz NULL,
	created_by_id int8 NULL,
	last_modified_date timestamptz NULL,
	last_modified_by_id int8 NULL,
	status int2 NOT NULL,
	"role" varchar(100) NULL,
	sign_data varchar(500) NULL,
	referral_code_id int8 NULL,
	agent_type int2 NULL,
	agent_level int2 NULL,
	funding_code_id int8 NULL,
	allow_view_agent bool NULL,
	parent_tree _int8 NULL,
	CONSTRAINT t_decats_agents_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_agents_address ON public.t_decats_agents USING btree (address);
CREATE INDEX t_decats_agents_email ON public.t_decats_agents USING btree (email);


-- public.t_decats_balances_snapshots definition

-- Drop table

-- DROP TABLE public.t_decats_balances_snapshots;

CREATE TABLE public.t_decats_balances_snapshots (
	id bigserial NOT NULL,
	"token" varchar(64) NOT NULL,
	customer_id int8 NOT NULL,
	balance numeric(78) NOT NULL,
	date_from timestamptz NULL,
	date_to timestamptz NULL,
	update_time timestamptz NULL,
	created_date timestamptz NOT NULL,
	last_modified_date timestamptz NULL,
	CONSTRAINT t_decats_balances_snapshots_pkey PRIMARY KEY (id)
);


-- public.t_decats_block_prices definition

-- Drop table

-- DROP TABLE public.t_decats_block_prices;

CREATE TABLE public.t_decats_block_prices (
	id serial4 NOT NULL,
	pair_name varchar(64) NOT NULL,
	reserve0 numeric NOT NULL,
	reserve1 numeric NOT NULL,
	block_no numeric NOT NULL,
	created_date timestamptz NULL,
	CONSTRAINT t_decats_block_prices_pkey PRIMARY KEY (id)
);
CREATE INDEX t_decats_block_prices_created_date ON public.t_decats_block_prices USING btree (created_date DESC);


-- public.t_decats_burn_transactions definition

-- Drop table

-- DROP TABLE public.t_decats_burn_transactions;

CREATE TABLE public.t_decats_burn_transactions (
	id bigserial NOT NULL,
	tx_hash varchar(255) NOT NULL,
	mst_amount numeric NOT NULL,
	created_date timestamptz NOT NULL,
	created_by_id int8 NOT NULL,
	last_modified_date timestamptz NULL,
	last_modified_by_id int8 NULL,
	status int2 NOT NULL,
	CONSTRAINT t_decats_burn_transactions_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_burn_transactions_id ON public.t_decats_burn_transactions USING btree (id);


-- public.t_decats_buy_back_details definition

-- Drop table

-- DROP TABLE public.t_decats_buy_back_details;

CREATE TABLE public.t_decats_buy_back_details (
	id bigserial NOT NULL,
	tx_hash varchar(255) NOT NULL,
	mst_amount numeric NOT NULL,
	usd_pirce numeric NOT NULL,
	created_date timestamptz NOT NULL,
	created_by_id int8 NOT NULL,
	last_modified_date timestamptz NULL,
	last_modified_by_id int8 NULL,
	status int2 NOT NULL,
	CONSTRAINT t_decats_buy_back_details_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_buy_back_details_id ON public.t_decats_buy_back_details USING btree (id);


-- public.t_decats_cron_jobs definition

-- Drop table

-- DROP TABLE public.t_decats_cron_jobs;

CREATE TABLE public.t_decats_cron_jobs (
	id bigserial NOT NULL,
	"desc" varchar(100) NULL,
	"type" int2 NULL,
	status int2 NULL,
	extra varchar(255) NULL,
	date_from timestamptz NULL,
	date_to timestamptz NULL,
	created_date timestamptz NOT NULL,
	last_modified_date timestamptz NULL,
	mst_to_usdm_exchange_rate numeric NULL,
	last_modified_by_id int8 NULL,
	CONSTRAINT t_decats_cron_jobs_pkey PRIMARY KEY (id)
);


-- public.t_decats_customers definition

-- Drop table

-- DROP TABLE public.t_decats_customers;

CREATE TABLE public.t_decats_customers (
	id bigserial NOT NULL,
	address varchar(50) NOT NULL,
	"name" varchar(100) NULL,
	agent_id int8 NOT NULL,
	leverage numeric NOT NULL,
	max_funding int8 NOT NULL,
	credit_mode int2 NOT NULL,
	contract_status int2 NOT NULL,
	risk_level numeric NOT NULL,
	funding_code_id int8 NULL,
	created_date timestamptz NULL,
	created_by_id int8 NULL,
	last_modified_date timestamptz NULL,
	last_modified_by_id int8 NULL,
	status int2 NOT NULL,
	"type" int2 NULL,
	CONSTRAINT t_decats_customers_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_customers_address ON public.t_decats_customers USING btree (address);


-- public.t_decats_customers_credit_updates definition

-- Drop table

-- DROP TABLE public.t_decats_customers_credit_updates;

CREATE TABLE public.t_decats_customers_credit_updates (
	id bigserial NOT NULL,
	address varchar(50) NOT NULL,
	customer_id int8 NOT NULL,
	agent_id int8 NOT NULL,
	orig_credit numeric NOT NULL,
	credit numeric NOT NULL,
	tx_hash varchar(255) NULL,
	tx_status int2 NOT NULL,
	tx_time timestamptz NULL,
	gas_fee int8 NOT NULL,
	created_date timestamptz NULL,
	created_by_id int8 NULL,
	last_modified_date timestamptz NULL,
	last_modified_by_id int8 NULL,
	status int2 NULL,
	CONSTRAINT t_decats_customers_credit_updates_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_customers_credit_updates_tx_hash ON public.t_decats_customers_credit_updates USING btree (tx_hash);


-- public.t_decats_interest_histories definition

-- Drop table

-- DROP TABLE public.t_decats_interest_histories;

CREATE TABLE public.t_decats_interest_histories (
	id bigserial NOT NULL,
	address varchar(50) NOT NULL,
	customer_id int8 NOT NULL,
	agent_id int8 NOT NULL,
	from_time timestamptz NOT NULL,
	to_time timestamptz NOT NULL,
	"token" varchar(64) NOT NULL,
	amount numeric NOT NULL,
	rate numeric NULL,
	interest numeric NULL,
	total_interest numeric NULL,
	created_date timestamptz NULL,
	last_modified_date timestamptz NULL,
	status int2 NOT NULL,
	CONSTRAINT t_decats_interest_histories_pkey PRIMARY KEY (id)
);


-- public.t_decats_mining_rewards definition

-- Drop table

-- DROP TABLE public.t_decats_mining_rewards;

CREATE TABLE public.t_decats_mining_rewards (
	id bigserial NOT NULL,
	date_from timestamptz NOT NULL,
	date_to timestamptz NOT NULL,
	round_id int8 NOT NULL,
	created_date timestamptz NOT NULL,
	last_modified_date timestamptz NULL,
	status int2 NOT NULL,
	approved_by_id int8 NULL,
	approved_date timestamptz NULL,
	last_modified_by_id int8 NULL,
	pool_token varchar(255) NULL,
	exchange_rate numeric NULL,
	mst_exchange_rate numeric NULL,
	CONSTRAINT t_decats_mining_rewards_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_mining_rewards_id ON public.t_decats_mining_rewards USING btree (id);


-- public.t_decats_mining_rewards_distribution definition

-- Drop table

-- DROP TABLE public.t_decats_mining_rewards_distribution;

CREATE TABLE public.t_decats_mining_rewards_distribution (
	id bigserial NOT NULL,
	job_id int8 NOT NULL,
	status int2 NOT NULL,
	pool_token varchar(255) NOT NULL,
	address varchar(255) NULL,
	amount numeric NULL,
	acquired_date int8 NULL,
	created_date timestamptz NOT NULL,
	usdc_amount numeric NULL,
	CONSTRAINT t_decats_mining_rewards_distribution_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_mining_rewards_distribution_id_job_id ON public.t_decats_mining_rewards_distribution USING btree (id, job_id);


-- public.t_decats_mst_dist_rules definition

-- Drop table

-- DROP TABLE public.t_decats_mst_dist_rules;

CREATE TABLE public.t_decats_mst_dist_rules (
	id bigserial NOT NULL,
	grade int4 NOT NULL,
	week_amount numeric NOT NULL,
	hold_mst numeric NOT NULL,
	commission_rate numeric NOT NULL,
	dist_m_token_rate numeric NOT NULL,
	dist_mst_token_rate numeric NOT NULL,
	created_date timestamptz NOT NULL,
	CONSTRAINT t_decats_mst_dist_rules_pkey PRIMARY KEY (id)
);


-- public.t_decats_mst_price definition

-- Drop table

-- DROP TABLE public.t_decats_mst_price;

CREATE TABLE public.t_decats_mst_price (
	id bigserial NOT NULL,
	mst_price numeric NOT NULL,
	created_date timestamptz NOT NULL,
	created_by_id int8 NULL,
	last_modified_date timestamptz NULL,
	last_modified_by_id int8 NULL,
	status int2 NOT NULL,
	CONSTRAINT t_decats_mst_price_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_mst_price_id ON public.t_decats_mst_price USING btree (id);


-- public.t_decats_pair_daily_reports definition

-- Drop table

-- DROP TABLE public.t_decats_pair_daily_reports;

CREATE TABLE public.t_decats_pair_daily_reports (
	id bigserial NOT NULL,
	"token" varchar(64) NOT NULL,
	buy_amount numeric(78) NULL,
	sell_amount numeric(78) NULL,
	usdm_buy_amount numeric(78) NULL,
	usdm_sell_amount numeric(78) NULL,
	price numeric(78) NULL,
	date_from timestamptz NULL,
	date_to timestamptz NULL,
	created_date timestamptz NOT NULL,
	last_modified_date timestamptz NULL,
	CONSTRAINT t_decats_pair_daily_reports_pkey PRIMARY KEY (id)
);


-- public.t_decats_price_histories definition

-- Drop table

-- DROP TABLE public.t_decats_price_histories;

CREATE TABLE public.t_decats_price_histories (
	id bigserial NOT NULL,
	pair_name varchar(64) NOT NULL,
	reserve0 numeric NOT NULL,
	reserve1 numeric NOT NULL,
	created_date timestamptz NULL,
	status int2 NOT NULL DEFAULT 0,
	"open" numeric NOT NULL,
	"close" numeric NOT NULL,
	low numeric NOT NULL,
	high numeric NOT NULL,
	volume numeric NOT NULL,
	"interval" numeric NOT NULL,
	CONSTRAINT t_decats_price_histories_pkey1 PRIMARY KEY (id)
);



-- public.t_decats_price_histories_ref definition

-- Drop table

-- DROP TABLE public.t_decats_price_histories_ref;

CREATE TABLE public.t_decats_price_histories_ref (
	token_from varchar(64) NOT NULL,
	token_to varchar(64) NOT NULL,
	source_from varchar(64) NOT NULL,
	price numeric NOT NULL,
	created_date timestamptz NOT NULL,
	remark varchar(1000) NULL,
	CONSTRAINT t_decats_price_histories_ref_pkey PRIMARY KEY (token_from, token_to, source_from, created_date)
);


-- public.t_decats_prices definition

-- Drop table

-- DROP TABLE public.t_decats_prices;

CREATE TABLE public.t_decats_prices (
	id serial4 NOT NULL,
	pair_name varchar(64) NOT NULL,
	reserve0 numeric NOT NULL,
	reserve1 numeric NOT NULL,
	created_date timestamptz NULL,
	CONSTRAINT t_decats_prices_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_prices_pair_name ON public.t_decats_prices USING btree (pair_name);


-- public.t_decats_profit_daily_reports definition

-- Drop table

-- DROP TABLE public.t_decats_profit_daily_reports;

CREATE TABLE public.t_decats_profit_daily_reports (
	id bigserial NOT NULL,
	"token" varchar(64) NOT NULL,
	raj_reserve_end numeric(78) NOT NULL,
	raj_reserve_start numeric(78) NOT NULL,
	raj_reserve_amt_change numeric(78) NOT NULL,
	pool_start numeric(78) NOT NULL,
	pool_end numeric(78) NOT NULL,
	pool_amt_change numeric(78) NOT NULL,
	pool_deposit_start numeric(78) NOT NULL,
	pool_deposit_end numeric(78) NOT NULL,
	pool_debit_start numeric(78) NOT NULL,
	pool_debit_end numeric(78) NOT NULL,
	balance_start numeric(78) NOT NULL,
	balance_end numeric(78) NOT NULL,
	balance_change numeric(78) NOT NULL,
	bot_balance_start numeric(78) NOT NULL,
	bot_balance_end numeric(78) NOT NULL,
	bot_sell_amt numeric(78) NOT NULL,
	sell_amt numeric(78) NOT NULL,
	interest numeric(78) NOT NULL,
	deposit_amt numeric(78) NOT NULL,
	withdraw_amt numeric(78) NOT NULL,
	net_cash_in numeric(78) NOT NULL,
	customer_profit numeric(78) NOT NULL,
	date_from timestamptz NULL,
	date_to timestamptz NULL,
	created_date timestamptz NOT NULL,
	last_modified_date timestamptz NULL,
	CONSTRAINT t_decats_profit_daily_reports_pkey PRIMARY KEY (id)
);


-- public.t_decats_stopouts definition

-- Drop table

-- DROP TABLE public.t_decats_stopouts;

CREATE TABLE public.t_decats_stopouts (
	id bigserial NOT NULL,
	address varchar(50) NOT NULL,
	customer_id int8 NOT NULL,
	agent_id int8 NOT NULL,
	equity numeric NULL,
	credit numeric NULL,
	tx_hash varchar(255) NULL,
	tx_time timestamptz NULL,
	tx_status int2 NULL,
	gas_fee numeric NULL,
	request_time timestamptz NOT NULL,
	leverage numeric NULL,
	funding_used numeric NULL,
	risk_level numeric NULL,
	CONSTRAINT t_decats_stopouts_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_stopouts_tx_hash ON public.t_decats_stopouts USING btree (tx_hash);


-- public.t_decats_tokens definition

-- Drop table

-- DROP TABLE public.t_decats_tokens;

CREATE TABLE public.t_decats_tokens (
	id bigserial NOT NULL,
	"name" varchar(64) NOT NULL,
	address varchar(255) NOT NULL,
	decimals int2 NOT NULL,
	CONSTRAINT t_decats_tokens_pkey PRIMARY KEY (id)
);


-- public.t_decats_transactions definition

-- Drop table

-- DROP TABLE public.t_decats_transactions;

CREATE TABLE public.t_decats_transactions (
	id bigserial NOT NULL,
	address varchar(255) NOT NULL,
	customer_id int8 NOT NULL,
	agent_id int8 NULL,
	sell_token varchar(64) NULL,
	sell_amount numeric NULL,
	buy_token varchar(64) NULL,
	buy_amount numeric NOT NULL,
	tx_hash varchar(255) NULL,
	tx_time timestamptz NULL,
	tx_status int2 NULL,
	gas_fee numeric NULL,
	block_height numeric NULL,
	block_hash varchar(255) NULL,
	created_date timestamptz NULL,
	last_modified_date timestamptz NULL,
	stopout bool NULL,
	CONSTRAINT t_decats_transactions_pkey PRIMARY KEY (id)
);
CREATE INDEX t_decats_transactions_tx_hash ON public.t_decats_transactions USING btree (tx_hash);



-- public.t_decats_transfer_eun_rewards definition

-- Drop table

-- DROP TABLE public.t_decats_transfer_eun_rewards;

CREATE TABLE public.t_decats_transfer_eun_rewards (
	id bigserial NOT NULL,
	address varchar(50) NOT NULL,
	amount numeric NOT NULL,
	transfer_status int2 NOT NULL DEFAULT 1,
	transfer_tx_hash varchar(80) NULL,
	err_msg text NULL,
	resend bool NOT NULL,
	resend_transfer_id int8 NULL,
	create_time timestamptz NOT NULL,
	update_time timestamptz NOT NULL,
	CONSTRAINT t_decats_transfer_eun_rewards_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX t_decats_transfer_eun_rewards_address ON public.t_decats_transfer_eun_rewards USING btree (address);
CREATE INDEX t_decats_transfer_eun_rewards_resend_id ON public.t_decats_transfer_eun_rewards USING btree (resend, id);


-- public.t_decats_transfer_histories definition

-- Drop table

-- DROP TABLE public.t_decats_transfer_histories;

CREATE TABLE public.t_decats_transfer_histories (
	id bigserial NOT NULL,
	seq_no int8 NOT NULL,
	amount numeric NOT NULL,
	block_hash varchar(80) NOT NULL,
	block_no int8 NOT NULL,
	confirm_status int2 NOT NULL,
	network_code varchar(50) NOT NULL,
	onchain_status int2 NOT NULL,
	symbol varchar(10) NOT NULL,
	tag varchar(50) NOT NULL,
	tx_hash varchar(80) NOT NULL,
	transfer_status int2 NOT NULL DEFAULT 1,
	transfer_tx_hash varchar(80) NULL,
	err_msg text NULL,
	resend bool NOT NULL,
	resend_transfer_id int8 NULL,
	create_time timestamptz NOT NULL,
	update_time timestamptz NOT NULL,
	CONSTRAINT t_decats_transfer_histories_pkey PRIMARY KEY (id)
);
CREATE INDEX t_decats_transfer_histories_resend_id ON public.t_decats_transfer_histories USING btree (resend, id);
CREATE UNIQUE INDEX t_decats_transfer_histories_seq_no ON public.t_decats_transfer_histories USING btree (seq_no);



-- public.t_decats_balances definition

-- Drop table

-- DROP TABLE public.t_decats_balances;

CREATE TABLE public.t_decats_balances (
	id bigserial NOT NULL,
	address varchar(50) NOT NULL,
	customer_id int8 NOT NULL,
	agent_id int8 NOT NULL,
	"token" varchar(64) NOT NULL,
	balance numeric NOT NULL,
	interest numeric NOT NULL,
	update_time timestamptz NOT NULL,
	status int2 NOT NULL DEFAULT 0,
	CONSTRAINT t_decats_balances_pkey PRIMARY KEY (id),
	CONSTRAINT t_decats_balances_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.t_decats_customers(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX t_decats_balances_address_token ON public.t_decats_balances USING btree (address, token);


-- public.t_decats_balances_histories definition

-- Drop table

-- DROP TABLE public.t_decats_balances_histories;

CREATE TABLE public.t_decats_balances_histories (
	id bigserial NOT NULL,
	address varchar(50) NOT NULL,
	customer_id int8 NOT NULL,
	agent_id int8 NOT NULL,
	"token" varchar(64) NOT NULL,
	"type" int2 NOT NULL,
	amount numeric NOT NULL,
	balance numeric NOT NULL,
	update_time timestamptz NOT NULL,
	tx_hash varchar(255) NOT NULL,
	created_date timestamptz NULL,
	last_modified_date timestamptz NULL,
	status int2 NOT NULL DEFAULT 0,
	CONSTRAINT t_decats_balances_histories_pkey PRIMARY KEY (id),
	CONSTRAINT t_decats_balances_histories_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.t_decats_customers(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- public.t_decats_commission_jobs definition

-- Drop table

-- DROP TABLE public.t_decats_commission_jobs;

CREATE TABLE public.t_decats_commission_jobs (
	id bigserial NOT NULL,
	date_from date NOT NULL,
	date_to date NOT NULL,
	approved_by_id int8 NULL,
	approved_date timestamptz NULL,
	last_modified_by_id int8 NULL,
	last_modified_date timestamptz NULL,
	created_date timestamptz NOT NULL,
	status int2 NOT NULL,
	cron_job_id int8 NULL,
	round_id int8 NULL,
	remark varchar(255) NOT NULL,
	CONSTRAINT t_decats_commission_jobs_pkey PRIMARY KEY (id),
	CONSTRAINT t_decats_commission_jobs_cron_job_id_fkey FOREIGN KEY (cron_job_id) REFERENCES public.t_decats_cron_jobs(id) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX t_decats_commission_jobs_date_from_date_to ON public.t_decats_commission_jobs USING btree (date_from, date_to);


-- public.t_decats_commission_ledgers definition

-- Drop table

-- DROP TABLE public.t_decats_commission_ledgers;

CREATE TABLE public.t_decats_commission_ledgers (
	id bigserial NOT NULL,
	job_id int8 NOT NULL,
	"token" varchar(64) NOT NULL,
	agent_id int8 NOT NULL,
	dist_commission numeric NOT NULL,
	created_date timestamptz NOT NULL,
	dist_commission_in_usdm numeric NULL,
	CONSTRAINT t_decats_commission_ledgers_pkey PRIMARY KEY (id),
	CONSTRAINT t_decats_commission_ledgers_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.t_decats_agents(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT t_decats_commission_ledgers_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.t_decats_commission_jobs(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX t_decats_commission_ledgers_job_id_token_agent_id ON public.t_decats_commission_ledgers USING btree (job_id, token, agent_id);


-- public.t_decats_commission_summaries definition

-- Drop table

-- DROP TABLE public.t_decats_commission_summaries;

CREATE TABLE public.t_decats_commission_summaries (
	id bigserial NOT NULL,
	job_id int8 NOT NULL,
	"token" varchar(64) NOT NULL,
	dist_total_commission numeric NOT NULL,
	dist_total_commission_in_usdm numeric NOT NULL,
	CONSTRAINT t_decats_commission_summaries_pkey PRIMARY KEY (id),
	CONSTRAINT t_decats_commission_summaries_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.t_decats_commission_jobs(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX t_decats_commission_summaries_job_id_token ON public.t_decats_commission_summaries USING btree (job_id, token);


-- public.t_decats_funding_code definition

-- Drop table

-- DROP TABLE public.t_decats_funding_code;

CREATE TABLE public.t_decats_funding_code (
	funding_code varchar(500) NOT NULL,
	agent_id int8 NOT NULL,
	customer_name varchar(100) NOT NULL,
	hash_string varchar(500) NOT NULL,
	is_used bool NOT NULL,
	code_status int2 NOT NULL,
	created_date timestamptz NOT NULL,
	created_by_id int8 NOT NULL,
	last_modified_date timestamptz NULL,
	last_modified_by_id int8 NULL,
	status int2 NOT NULL,
	id serial4 NOT NULL,
	expiry_date date NULL,
	"type" int2 NULL,
	agent_type int2 NULL,
	CONSTRAINT t_decats_funding_code_pkey PRIMARY KEY (id),
	CONSTRAINT t_decats_funding_code_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.t_decats_agents(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX t_decats_funding_code_funding_code ON public.t_decats_funding_code USING btree (funding_code);


-- public.t_decats_referral_code definition

-- Drop table

-- DROP TABLE public.t_decats_referral_code;

CREATE TABLE public.t_decats_referral_code (
	id bigserial NOT NULL,
	referral_code varchar(500) NULL,
	"type" int2 NOT NULL,
	agent_id int8 NOT NULL,
	agent_name varchar(100) NULL,
	hash_string varchar(500) NOT NULL,
	fee_percentage numeric NOT NULL,
	interest_percentage numeric NOT NULL,
	is_used bool NOT NULL,
	code_status int2 NOT NULL,
	expiry_date date NULL,
	created_date timestamptz NOT NULL,
	created_by_id int8 NOT NULL,
	last_modified_date timestamptz NULL,
	last_modified_by_id int8 NULL,
	status int2 NOT NULL,
	agent_type int2 NULL,
	CONSTRAINT t_decats_referral_code_pkey PRIMARY KEY (id),
	CONSTRAINT t_decats_referral_code_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.t_decats_agents(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX t_decats_referral_code_referral_code ON public.t_decats_referral_code USING btree (referral_code);


-- public.t_decats_commission_distributions definition

-- Drop table

-- DROP TABLE public.t_decats_commission_distributions;

CREATE TABLE public.t_decats_commission_distributions (
	id bigserial NOT NULL,
	job_id int8 NOT NULL,
	agent_id int8 NOT NULL,
	address varchar(50) NOT NULL,
	status int2 NOT NULL,
	created_date timestamptz NOT NULL,
	acquired_date timestamptz NULL,
	tx_hash varchar(255) NULL,
	tx_date timestamptz NULL,
	CONSTRAINT t_decats_commission_distributions_pkey PRIMARY KEY (id),
	CONSTRAINT t_decats_commission_distributions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.t_decats_commission_jobs(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX t_decats_commission_distributions_job_id_agent_id ON public.t_decats_commission_distributions USING btree (job_id, agent_id);


COMMIT;
