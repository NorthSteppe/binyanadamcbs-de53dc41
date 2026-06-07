import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PageShellProps {
  children: ReactNode;
  /** Hide site footer (e.g. for portal pages with custom chrome) */
  hideFooter?: boolean;
  /** Background class for the outer wrapper */
  bgClassName?: string;
  /** Container width preset */
  width?: "narrow" | "default" | "wide" | "full";
  /** Extra classes for the inner container */
  className?: string;
}

const widthMap: Record<NonNullable<PageShellProps["width"]>, string> = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-none",
};

/**
 * Global page wrapper that reserves space for the fixed Header so content
 * is never covered. Use on every authenticated and most public pages.
 */
const PageShell = ({
  children,
  hideFooter,
  bgClassName = "bg-background",
  width = "default",
  className = "",
}: PageShellProps) => {
  return (
    <div className={`min-h-screen flex flex-col ${bgClassName}`}>
      <Header />
      <main
        className="flex-1"
        style={{ paddingTop: "var(--header-height)" }}
      >
        <div className={`container ${widthMap[width]} py-8 ${className}`}>{children}</div>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default PageShell;
