import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

/* ───────────────────── PortalShell ───────────────────── */

interface PortalShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export const PortalShell = ({ title, subtitle, actions, children }: PortalShellProps) => {
  const { profile } = useAuth();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1" style={{ paddingTop: "var(--header-height)" }}>
        <div className="container max-w-6xl py-8 md:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                {today}
              </p>
              <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground">
                {title}
                {profile?.full_name && (
                  <span className="text-muted-foreground">
                    , {profile.full_name.split(" ")[0]}
                  </span>
                )}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-2 max-w-xl">{subtitle}</p>
              )}
            </motion.div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

/* ───────────────────── BentoGrid ───────────────────── */

export const BentoGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[160px] gap-4">
    {children}
  </div>
);

/* ───────────────────── BentoTile ───────────────────── */

type TileSize = "sm" | "md" | "lg" | "tall" | "wide";

const sizeMap: Record<TileSize, string> = {
  sm: "col-span-1 row-span-1",
  md: "col-span-1 sm:col-span-2 row-span-1",
  lg: "col-span-1 sm:col-span-2 row-span-2",
  tall: "col-span-1 row-span-2",
  wide: "col-span-1 sm:col-span-2 lg:col-span-4 row-span-1",
};

interface BentoTileProps {
  feature?: string; // feature flag key — tile is hidden if disabled
  to?: string;
  size?: TileSize;
  icon?: LucideIcon;
  label: string;
  value?: string | number;
  hint?: string;
  accent?: "navy" | "orange" | "muted";
  children?: ReactNode;
  className?: string;
}

const accentMap = {
  navy: "text-primary",
  orange: "text-accent",
  muted: "text-muted-foreground",
};

export const BentoTile = ({
  feature,
  to,
  size = "sm",
  icon: Icon,
  label,
  value,
  hint,
  accent = "navy",
  children,
  className = "",
}: BentoTileProps) => {
  const { isEnabled, loading } = useFeatureFlags();
  if (feature && !loading && !isEnabled(feature)) return null;

  const body = (
    <div
      className={`group h-full w-full rounded-2xl border border-border/70 bg-card p-5 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-foreground/20 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className={accentMap[accent]} />}
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        {to && (
          <ArrowUpRight
            size={16}
            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
      </div>
      {value !== undefined && (
        <div>
          <p className="text-3xl md:text-4xl font-display tracking-tight text-foreground">
            {value}
          </p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
      )}
      {children}
    </div>
  );

  const wrapper = to ? <Link to={to}>{body}</Link> : body;

  return <div className={sizeMap[size]}>{wrapper}</div>;
};

/* ───────────────────── Empty state ───────────────────── */

export const EmptyBentoState = ({ message }: { message: string }) => (
  <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center">
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);
