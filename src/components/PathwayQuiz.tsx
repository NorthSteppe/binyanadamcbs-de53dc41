import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export interface PathwayOption {
  label: string;
  description?: string;
  action: { type: "route" | "next"; value: string };
}

export interface PathwaySlide {
  id: string;
  order_index: number;
  question: string;
  subtitle: string | null;
  options: PathwayOption[];
  is_start: boolean;
}

interface PathwayQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PathwayQuiz = ({ open, onOpenChange }: PathwayQuizProps) => {
  const [slides, setSlides] = useState<PathwaySlide[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("pathway_quiz_slides")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      if (cancelled) return;
      const list = (data ?? []) as unknown as PathwaySlide[];
      setSlides(list);
      const startIdx = Math.max(0, list.findIndex((s) => s.is_start));
      setHistory([startIdx === -1 ? 0 : startIdx]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const currentIdx = history[history.length - 1] ?? 0;
  const current = slides[currentIdx];

  const handleOption = (opt: PathwayOption) => {
    if (opt.action.type === "route") {
      onOpenChange(false);
      setTimeout(() => navigate(opt.action.value), 200);
      return;
    }
    // next: go to next slide in sequence
    const next = currentIdx + 1;
    if (next < slides.length) {
      setHistory((h) => [...h, next]);
    } else {
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl border-white/20 bg-background/80 p-0 backdrop-blur-2xl sm:rounded-3xl [&>button]:hidden"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
          aria-label="Close"
        >
          <X size={18} />
        </button>



        <div className="relative overflow-hidden px-6 py-10 sm:px-12 sm:py-14">
          {/* gradient orb backdrop */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

          {loading || !current ? (
            <div className="flex h-72 items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles size={16} className="animate-pulse" />
                <span className="text-sm">Preparing your pathway…</span>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <Sparkles size={12} />
                  Let's Explore Together
                  <span className="ml-auto">
                    Step {history.length}{slides.length ? ` / ${slides.length}` : ""}
                  </span>
                </div>

                <h2 className="font-display text-3xl font-light leading-tight text-foreground sm:text-4xl">
                  {current.question}
                </h2>
                {current.subtitle && (
                  <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                    {current.subtitle}
                  </p>
                )}

                <div className="mt-8 grid gap-3">
                  {current.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i, duration: 0.35 }}
                      onClick={() => handleOption(opt)}
                      className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 text-left transition hover:border-primary/60 hover:bg-white/[0.08]"
                    >
                      <div className="min-w-0">
                        <div className="text-[15px] font-medium text-foreground">
                          {opt.label}
                        </div>
                        {opt.description && (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {opt.description}
                          </div>
                        )}
                      </div>
                      <ArrowRight
                        size={18}
                        className="shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary"
                      />
                    </motion.button>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    disabled={history.length <= 1}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft size={14} className="mr-1" /> Back
                  </Button>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    Skip the quiz
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PathwayQuiz;
