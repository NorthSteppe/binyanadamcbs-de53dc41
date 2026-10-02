import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export interface QuizOption {
  id: string;
  step_id: string;
  label: string;
  display_order: number;
  next_step_id: string | null;
  destination_url: string | null;
}
export interface QuizStep {
  id: string;
  step_key: string;
  greeting_text: string | null;
  heading: string;
  display_order: number;
  is_start: boolean;
  is_active: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Skip click tracking (admin preview) */
  preview?: boolean;
}

const db = supabase as any;

export const PathwayQuiz = ({ open, onOpenChange, preview }: Props) => {
  const [steps, setSteps] = useState<QuizStep[]>([]);
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [s, o] = await Promise.all([
        db.from("quiz_steps").select("*").eq("is_active", true).order("display_order"),
        db.from("quiz_options").select("*").order("display_order"),
      ]);
      if (cancelled) return;
      const list: QuizStep[] = s.data ?? [];
      setSteps(list);
      setOptions(o.data ?? []);
      const start = list.find((x) => x.is_start) ?? list[0];
      setHistory(start ? [start.id] : []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open]);

  const current = steps.find((s) => s.id === history[history.length - 1]);
  const currentOptions = options.filter((o) => o.step_id === current?.id);

  const choose = (opt: QuizOption) => {
    if (!preview) db.from("quiz_option_clicks").insert({ option_id: opt.id }).then(() => {});
    if (opt.next_step_id && steps.some((s) => s.id === opt.next_step_id)) {
      setHistory((h) => [...h, opt.next_step_id!]);
      return;
    }
    onOpenChange(false);
    if (opt.destination_url) {
      const url = opt.destination_url;
      setTimeout(() => (/^https?:\/\//.test(url) ? (window.location.href = url) : navigate(url)), 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-[hsl(var(--sky))] bg-[hsl(var(--cream))] p-0 sm:rounded-3xl [&>button]:hidden">
        <DialogTitle className="sr-only">Find your pathway</DialogTitle>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted-foreground transition hover:bg-[hsl(var(--sky))]/40 hover:text-foreground"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="px-6 py-10 sm:px-10 sm:py-12">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Preparing your pathway…</div>
          ) : !current ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">The questionnaire isn't available right now.</div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
                  Step {history.length}
                </div>
                {current.greeting_text && (
                  <p className="mb-5 rounded-2xl border-l-4 border-[hsl(var(--sky))] bg-background/70 p-4 text-sm leading-relaxed text-muted-foreground">
                    {current.greeting_text}
                  </p>
                )}
                <h2 className="font-display text-2xl font-semibold leading-snug text-primary sm:text-3xl">
                  {current.heading}
                </h2>

                <div className="mt-7 grid gap-3">
                  {currentOptions.map((opt, i) => (
                    <motion.button
                      key={opt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                      onClick={() => choose(opt)}
                      className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-[hsl(var(--sky))] bg-background px-5 py-4 text-left text-[15px] leading-relaxed text-foreground shadow-sm transition hover:border-primary hover:shadow-md"
                    >
                      <span>{opt.label}</span>
                      <ArrowRight size={18} className="shrink-0 text-primary/50 transition group-hover:translate-x-1 group-hover:text-accent" />
                    </motion.button>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between text-sm">
                  <button
                    onClick={() => setHistory((h) => h.slice(0, -1))}
                    disabled={history.length <= 1}
                    className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-primary disabled:opacity-0"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  {history.length > 1 && (
                    <button
                      onClick={() => setHistory((h) => h.slice(0, 1))}
                      className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-primary"
                    >
                      <RotateCcw size={14} /> Start again
                    </button>
                  )}
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
