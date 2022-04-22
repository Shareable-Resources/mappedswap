-- Deploy database:20220311_CREATE_INDEX_t_decats_block_prices_create_date to pg

BEGIN;

-- XXX Add DDLs here.
DROP index if EXISTS t_decats_block_prices_create_date;
CREATE INDEX t_decats_block_prices_create_date
    ON public.t_decats_block_prices USING btree
    (created_date DESC NULLS LAST)
;

COMMIT;
