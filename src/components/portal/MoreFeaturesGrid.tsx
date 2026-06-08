import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useFeatureCatalogue, useFeatureFlags, type FeatureCategory } from "@/hooks/useFeatureFlags";

interface Props {
  category: FeatureCategory;
  /** Feature keys already rendered as hero tiles — hide here to avoid duplicates */
  exclude?: string[];
  title?: string;
}

/**
 * Renders any feature flag in `category` that has a path set, is enabled for the
 * current user, and isn't already in the curated hero tiles. Gives admins a way
 * to surface every feature in the app via the toggle matrix.
 */
const MoreFeaturesGrid = ({ category, exclude = [], title = "More features" }: Props) => {
  const { data: flags, isLoading } = useFeatureCatalogue();
  const { isEnabled, loading } = useFeatureFlags();
  if (isLoading || loading) return null;

  const items = (flags || [])
    .filter((f) => f.category === category && f.path && !exclude.includes(f.key) && isEnabled(f.key))
    .sort((a, b) => a.display_order - b.display_order);

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((f) => (
          <Link
            key={f.key}
            to={f.path!}
            className="group rounded-xl border border-border/70 bg-card p-4 flex items-start gap-3 hover:-translate-y-0.5 hover:border-foreground/20 transition-all"
          >
            <div className="rounded-lg bg-primary/10 text-primary p-2 shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground truncate">{f.label}</p>
                <ArrowUpRight
                  size={14}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                />
              </div>
              {f.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{f.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MoreFeaturesGrid;
