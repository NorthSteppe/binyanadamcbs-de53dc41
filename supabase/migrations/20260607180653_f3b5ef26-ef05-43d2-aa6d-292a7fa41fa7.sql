DROP POLICY IF EXISTS "Anyone can view active service options" ON public.service_options;

CREATE POLICY "Authenticated users can view active service options"
ON public.service_options
FOR SELECT
TO authenticated
USING (is_active = true);

REVOKE SELECT ON public.service_options FROM anon;