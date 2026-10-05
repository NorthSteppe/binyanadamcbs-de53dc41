import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const WHATSAPP_NUMBER = "447715460054";
const WHATSAPP_MESSAGE = encodeURIComponent("Hi, I am directed here from bacbs.com");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const openWhatsApp = (e: React.MouseEvent) => {
  // Force a real top-level new tab — inside embedded previews a plain
  // anchor navigation can be blocked by WhatsApp's frame headers
  // (ERR_BLOCKED_BY_RESPONSE on api.whatsapp.com).
  e.preventDefault();
  window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
};

const WhatsAppButton = () => {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={openWhatsApp}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      className="fixed bottom-20 left-6 z-40 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center group lg:bottom-8"
      style={{ backgroundColor: "#25D366" }}
      aria-label="Chat on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-7 h-7 fill-white"
      >
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.744 3.054 9.378L1.054 31.27l6.156-1.97A15.924 15.924 0 0016.004 32C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.31 22.606c-.39 1.1-1.932 2.014-3.168 2.28-.846.18-1.948.324-5.662-1.216-4.756-1.97-7.818-6.81-8.054-7.124-.226-.316-1.9-2.53-1.9-4.828 0-2.298 1.2-3.43 1.628-3.9.39-.428 1.022-.624 1.628-.624.196 0 .372.01.53.018.468.02.702.048 1.012.784.39.928 1.34 3.27 1.458 3.508.118.238.236.55.078.866-.148.326-.276.47-.514.744-.238.274-.462.484-.7.778-.218.256-.464.53-.196.998.268.468 1.192 1.97 2.562 3.19 1.762 1.568 3.248 2.054 3.712 2.282.352.17.654.172.866-.1.118-.154.468-.546.748-.898.274-.352.544-.46.78-.46.216 0 .472.092.73.212.268.12 2.602 1.228 3.048 1.45.446.226.744.336.854.524.108.186.108 1.088-.282 2.188z"/>
      </svg>
      <span className="absolute left-full ml-3 bg-card text-foreground text-xs px-3 py-1.5 rounded-lg shadow-md border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us on WhatsApp
      </span>
    </motion.a>
  );
};

export default WhatsAppButton;
