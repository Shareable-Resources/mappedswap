CREATE OR REPLACE FUNCTION public.first_agg(anyelement, anyelement)
 RETURNS anyelement
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
        SELECT $1;
$function$
;