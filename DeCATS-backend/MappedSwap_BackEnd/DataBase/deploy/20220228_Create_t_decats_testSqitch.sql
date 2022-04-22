-- Deploy database:20220228_Create_t_decats_testSqitch to pg

BEGIN;

-- XXX Add DDLs here.
CREATE TABLE public.t_decats_testSqitch (
	id serial4 NOT NULL,
	pair_name varchar(64) NULL,
	created_date timestamptz NULL
);

COMMIT;
