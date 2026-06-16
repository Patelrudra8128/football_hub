"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, LANGUAGES, Language, LanguageInfo } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: LanguageInfo[];
  currentLanguageInfo: LanguageInfo;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  const currentLanguageInfo = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const isRtl = !!currentLanguageInfo.isRtl;

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language | null;
    if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  // Update HTML elements when language changes
  useEffect(() => {
    if (!mounted) return;
    
    // Set document lang attribute
    document.documentElement.lang = language;
    
    // Handle RTL
    if (isRtl) {
      document.documentElement.dir = "rtl";
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.classList.remove("rtl");
    }
  }, [language, isRtl, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Safe nested translation lookup
  const t = (path: string): string => {
    const keys = path.split(".");
    
    // Helper to get nested value
    const getValue = (obj: any, pathKeys: string[]): any => {
      let current = obj;
      for (const k of pathKeys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          return null;
        }
      }
      return current;
    };

    // Try selected language
    const val = getValue(translations[language], keys);
    if (val && typeof val === "string") {
      return val;
    }

    // Fallback to English
    if (language !== "en") {
      const fallbackVal = getValue(translations["en"], keys);
      if (fallbackVal && typeof fallbackVal === "string") {
        return fallbackVal;
      }
    }

    return path;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: LANGUAGES,
        currentLanguageInfo,
        isRtl,
      }}
    >
      <div className={mounted ? "" : "invisible"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
