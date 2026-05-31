import { usePartnerBadges } from "@/hooks/usePartnerBadges";

const BadgeMarquee = () => {
  const { data: badges } = usePartnerBadges(true);

  if (!badges || badges.length === 0) return null;

  // Duplicate for seamless loop
  const items = [...badges, ...badges];

  return (
    <div className="w-full overflow-hidden py-8 bg-background/80 backdrop-blur-sm border-t border-border/40">
      <div className="flex animate-marquee items-center gap-16 w-max">
        {items.map((badge, i) => {
          const img = (
            <img
              key={`${badge.id}-${i}`}
              src={badge.image_url}
              alt={badge.name}
              className="h-10 md:h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
              loading="lazy"
            />
          );

          if (badge.link_url) {
            return (
              <a
                key={`${badge.id}-${i}`}
                href={badge.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                {img}
              </a>
            );
          }

          return <div key={`${badge.id}-${i}`} className="shrink-0">{img}</div>;
        })}
      </div>
    </div>
  );
};

export default BadgeMarquee;
