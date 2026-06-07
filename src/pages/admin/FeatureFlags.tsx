import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ToggleRight, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  useFeatureCatalogue,
  useRoleAccess,
  type FeatureFlag,
} from "@/hooks/useFeatureFlags";
import PageShell from "@/components/layout/PageShell";

const ROLES: { key: string; label: string }[] = [
  { key: "client", label: "Client" },
  { key: "team_member", label: "Therapist" },
  { key: "supervisee", label: "Supervisee" },
  { key: "admin", label: "Admin" },
];

const CATEGORY_LABEL: Record<string, string> = {
  client: "Client portal",
  staff: "Therapist portal",
  supervisee: "Supervisee portal",
  admin: "Admin portal",
};

// Which roles a given feature applies to (avoid showing irrelevant toggles)
const allowedRoles = (category: string): string[] => {
  if (category === "client") return ["client"];
  if (category === "staff") return ["team_member"];
  if (category === "supervisee") return ["supervisee"];
  if (category === "admin") return ["admin"];
  return ROLES.map((r) => r.key);
};

const FeatureFlags = () => {
  const { data: flags, isLoading: loadingFlags } = useFeatureCatalogue();
  const { data: access, isLoading: loadingAccess } = useRoleAccess();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState<string | null>(null);

  const isOn = (key: string, role: string): boolean => {
    return !!access?.find((a) => a.feature_key === key && a.role === role)?.enabled;
  };

  const toggle = async (feature: FeatureFlag, role: string, next: boolean) => {
    if (feature.key === "admin.features" && role === "admin" && !next) {
      toast.error("Admins must keep feature toggles enabled.");
      return;
    }
    const token = `${feature.key}:${role}`;
    setSaving(token);
    const existing = access?.find((a) => a.feature_key === feature.key && a.role === role);
    const payload = {
      feature_key: feature.key,
      role: role as any,
      enabled: next,
      updated_at: new Date().toISOString(),
    };
    const { error } = existing
      ? await supabase
          .from("role_feature_access")
          .update(payload)
          .eq("feature_key", feature.key)
          .eq("role", role as any)
      : await supabase.from("role_feature_access").insert(payload);
    setSaving(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["role-feature-access"] });
    toast.success(`${feature.label} ${next ? "enabled" : "disabled"} for ${role}`);
  };

  const grouped = useMemo(() => {
    const byCat: Record<string, FeatureFlag[]> = {};
    (flags || []).forEach((f) => {
      byCat[f.category] = byCat[f.category] || [];
      byCat[f.category].push(f);
    });
    return byCat;
  }, [flags]);

  return (
    <PageShell width="wide">
      <div className="flex items-center gap-3 mb-2">
        <div className="rounded-xl bg-primary/10 text-primary p-2.5">
          <ToggleRight size={20} />
        </div>
        <h1 className="text-2xl md:text-3xl font-display tracking-tight">Feature toggles</h1>
      </div>
      <p className="text-sm text-muted-foreground max-w-2xl mb-10">
        Turn dashboard tiles on or off per role. Changes apply to every user with that role on
        their next page load.
      </p>

      {(loadingFlags || loadingAccess) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" size={16} /> Loading…
        </div>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat} className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
            {CATEGORY_LABEL[cat] || cat}
          </h2>
          <div className="rounded-2xl border border-border overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Feature</th>
                  {ROLES.map((r) => (
                    <th key={r.key} className="px-5 py-3 font-medium text-center">
                      {r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((feature) => {
                  const allowed = allowedRoles(feature.category);
                  return (
                    <tr key={feature.key} className="border-t border-border">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{feature.label}</p>
                          {feature.key === "admin.features" && (
                            <Badge variant="secondary" className="text-[10px]">
                              system
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {feature.description}
                        </p>
                      </td>
                      {ROLES.map((r) => {
                        const supported = allowed.includes(r.key);
                        const token = `${feature.key}:${r.key}`;
                        return (
                          <td key={r.key} className="px-5 py-4 text-center">
                            {supported ? (
                              <div className="inline-flex items-center justify-center">
                                {saving === token ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  <Switch
                                    checked={isOn(feature.key, r.key)}
                                    onCheckedChange={(v) => toggle(feature, r.key, v)}
                                  />
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/40">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </PageShell>
  );
};

export default FeatureFlags;
