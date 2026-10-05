DROP POLICY IF EXISTS "Authenticated can read role access" ON public.role_feature_access;
CREATE POLICY "Users read access for their own roles" ON public.role_feature_access
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), role));