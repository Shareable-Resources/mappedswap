-- Deploy database:20220311_Add_indexes to pg

BEGIN;

-- XXX Add DDLs here.
DROP index if EXISTS t_decats_price_histories_pair_name_interval_created_date;
CREATE INDEX t_decats_price_histories_pair_name_interval_created_date ON t_decats_price_histories
(
    pair_name, interval, created_date DESC
);


DROP index if EXISTS t_decats_block_prices_pair_name_created_date;
CREATE INDEX t_decats_block_prices_pair_name_created_date ON t_decats_block_prices
(
    pair_name, created_date DESC
);


DROP index if EXISTS t_decats_transactions_created_date_customer_id;
CREATE INDEX t_decats_transactions_created_date_customer_id ON t_decats_transactions
(
	created_date desc, customer_id
);


DROP index if EXISTS t_decats_interest_histories_created_date;
CREATE INDEX t_decats_interest_histories_created_date ON t_decats_interest_histories
(
	created_date desc
);

DROP index if EXISTS t_decats_interest_histories_customer_id_created_date;
CREATE INDEX t_decats_interest_histories_customer_id_created_date ON t_decats_interest_histories
(
	customer_id, created_date desc
);



COMMIT;
