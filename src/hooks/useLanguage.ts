// hooks/useLanguage.ts
"use client";

import {useLanguageContext} from "@/contexts/LanguageContext";

export const useLanguage = () => {
  const {language, setLanguage, t} = useLanguageContext();

  return {
    language,
    setLanguage,
    t,
  };
};
