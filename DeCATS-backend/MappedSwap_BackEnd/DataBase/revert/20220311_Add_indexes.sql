-- Revert database:20220311_Add_indexes from pg

BEGIN;

-- XXX Add DDLs here.
DROP index if EXISTS t_decats_price_histories_pair_name_interval_created_date;

DROP index if EXISTS t_decats_block_prices_pair_name_created_date;

DROP index if EXISTS t_decats_transactions_created_date_customer_id;

DROP index if EXISTS t_decats_interest_histories_created_date;

DROP index if EXISTS t_decats_interest_histories_customer_id_created_date;


COMMIT;
