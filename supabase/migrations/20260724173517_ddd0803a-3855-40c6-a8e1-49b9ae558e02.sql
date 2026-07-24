
CREATE TABLE public.custom_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  category_type TEXT NOT NULL DEFAULT 'custom',
  display_order INTEGER NOT NULL DEFAULT 0,
  hero_image TEXT NOT NULL DEFAULT '',
  in_nav BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.custom_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_pages TO authenticated;
GRANT ALL ON public.custom_pages TO service_role;

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published custom pages"
  ON public.custom_pages FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins manage custom pages"
  ON public.custom_pages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER custom_pages_touch_updated_at
  BEFORE UPDATE ON public.custom_pages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();

CREATE INDEX idx_custom_pages_order ON public.custom_pages (display_order);
CREATE INDEX idx_custom_pages_nav ON public.custom_pages (in_nav) WHERE in_nav = true;
