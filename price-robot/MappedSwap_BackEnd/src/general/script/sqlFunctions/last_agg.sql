
CREATE OR REPLACE FUNCTION public.last_agg(anyelement, anyelement)
 RETURNS anyelement
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
        SELECT $2;
$function$
;
