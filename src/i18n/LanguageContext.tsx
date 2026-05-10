import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, type Language } from "./translations";

type TranslationsType = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationsType;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("binyan-lang");
    return (saved === "he" ? "he" : "en") as Language;
  });

  const t = translations[language] as TranslationsType;
  const isRTL = language === "he";

  useEffect(() => {
    localStorage.setItem("binyan-lang", language);
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
    if (typeof document !== "undefined" && document.body) {
      document.body.dir = isRTL ? "rtl" : "ltr";
    }
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
