const first_agg = `
CREATE OR REPLACE FUNCTION public.first_agg(anyelement, anyelement)
 RETURNS anyelement
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
        SELECT $1;
$function$
;


`;
const last_agg = `
CREATE OR REPLACE FUNCTION public.last_agg(anyelement, anyelement)
 RETURNS anyelement
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
        SELECT $2;
$function$
;
`;

const first = `
CREATE AGGREGATE public.first (
   sfunc    = public.first_agg,
   basetype = anyelement,
   stype    = anyelement
);
`;
const last = `
CREATE AGGREGATE public.last (
   sfunc    = public.last_agg,
   basetype = anyelement,
   stype    = anyelement
);
`;
const sqlFuncs = [
  {
    name: 'first_agg',
    sql: first_agg,
  },
  {
    name: 'last_agg',
    sql: last_agg,
  },
  {
    name: 'last',
    sql: last,
  },
  {
    name: 'first',
    sql: first,
  },
];
export default sqlFuncs;
