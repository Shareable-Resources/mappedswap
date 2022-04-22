CREATE AGGREGATE public.first (
   sfunc    = public.first_agg,
   basetype = anyelement,
   stype    = anyelement
);