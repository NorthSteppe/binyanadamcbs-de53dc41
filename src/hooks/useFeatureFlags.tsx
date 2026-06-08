import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type FeatureCategory = "client" | "staff" | "supervisee" | "admin";

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  category: FeatureCategory;
  display_order: number;
  path?: string | null;
}

export interface RoleAccessRow {
  role: string;
  feature_key: string;
  enabled: boolean;
}

/** Read full catalogue (admin manager + tile rendering) */
export const useFeatureCatalogue = () => {
  return useQuery({
    queryKey: ["feature-flags-catalogue"],
    queryFn: async (): Promise<FeatureFlag[]> => {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as FeatureFlag[];
    },
  });
};

/** Read all role x feature toggles */
export const useRoleAccess = () => {
  return useQuery({
    queryKey: ["role-feature-access"],
    queryFn: async (): Promise<RoleAccessRow[]> => {
      const { data, error } = await supabase
        .from("role_feature_access")
        .select("role, feature_key, enabled");
      if (error) throw error;
      return (data || []) as RoleAccessRow[];
    },
  });
};

/**
 * Returns `isEnabled(featureKey)` for the current signed-in user.
 * A feature is enabled if ANY of the user's roles has it enabled.
 * Admins always see admin.* features (locked-on safety net).
 */
export const useFeatureFlags = () => {
  const { roles } = useAuth() as { roles?: string[] };
  const { data: access, isLoading } = useRoleAccess();

  const isEnabled = (key: string): boolean => {
    if (isLoading || !access) return false;
    // Admins always have admin.features as a safety hatch
    if (key === "admin.features" && roles?.includes("admin")) return true;
    const userRoles = roles && roles.length > 0 ? roles : ["client"];
    return access.some(
      (row) => row.feature_key === key && row.enabled && userRoles.includes(row.role),
    );
  };

  return { isEnabled, loading: isLoading };
};
