-- Revert database:20220223_data_init from pg

BEGIN;

-- XXX Add DDLs here.
DELETE FROM t_decats_tokens;
DELETE FROM t_decats_mst_price;
DELETE FROM t_decats_mst_dist_rules;
COMMIT;
