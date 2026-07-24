import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CustomNavPage {
  id: string;
  slug: string;
  title: string;
  display_order: number;
}

export const useCustomNavPages = () => {
  return useQuery({
    queryKey: ["custom-pages-nav"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("custom_pages")
        .select("id, slug, title, display_order")
        .eq("in_nav", true)
        .eq("is_published", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as CustomNavPage[];
    },
    staleTime: 60_000,
  });
};
