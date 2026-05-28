import { useState, useEffect, useCallback, useRef } from "react";
import { useHeroImages } from "@/hooks/useHeroImages";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  onQuoteChange?: (quote: { text: string; author: string }) => void;
}

const HeroCarousel = ({ onQuoteChange }: HeroCarouselProps) => {
  const { data: images } = useHeroImages(true);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const interval = images?.[current]?.interval_seconds ?? 5;

  // Preload all images eagerly on mount
  useEffect(() => {
    if (!images || images.length === 0) return;
    const links: HTMLLinkElement[] = [];
    images.forEach((img) => {
      if (!img.image_url) return;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = img.image_url;
      document.head.appendChild(link);
      links.push(link);
    });
    return () => {
      links.forEach((link) => link.remove());
    };
  }, [images]);

  const goTo = useCallback((nextIdx: number) => {
    setCurrent((c) => {
      setPrev(c);
      return nextIdx;
    });
    // Clear prev after transition completes
    setTimeout(() => setPrev(null), 800);
  }, []);

  const next = useCallback(() => {
    if (!images || images.length <= 1) return;
    goTo((current + 1) % images.length);
  }, [images, current, goTo]);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, interval * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [images, interval, next]);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const img = images[current];
    onQuoteChange?.({ text: img.quote_text, author: img.quote_author });
  }, [current, images, onQuoteChange]);

  if (!images || images.length === 0) {
    return (
      <div className="overflow-hidden bg-muted w-full h-full">
        <img
          alt="A professional guiding a child in a hands-on learning activity"
          className="w-full h-full object-cover"
          src="/lovable-uploads/93c59eae-410f-4380-a222-312d8d41af41.jpg"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          width={1920}
          height={1080}
        />
      </div>
    );
  }


  return (
    <div className="overflow-hidden relative bg-muted w-full h-full">
      {images.map((img, i) => {
        const isActive = i === current;
        const isPrev = i === prev;
        // Only render active and previous (for crossfade)
        if (!isActive && !isPrev) return null;

        return (
          <div
            key={img.id}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 1 : 0,
              transition: "opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)",
            <img
              src={img.image_url}
              alt={img.alt_text}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority={i === 0 ? "high" : "auto"}
              width={1920}
              height={1080}
            />

              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority={i === 0 ? "high" : "auto"}
            />
          </div>
        );
      })}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[2]">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                i === current
                  ? "bg-primary-foreground scale-110"
                  : "bg-primary-foreground/40 hover:bg-primary-foreground/60"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
