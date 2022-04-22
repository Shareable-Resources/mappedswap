CREATE AGGREGATE public.last (
   sfunc    = public.last_agg,
   basetype = anyelement,
   stype    = anyelement
);