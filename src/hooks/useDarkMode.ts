// hooks/useDarkMode.ts
"use client";

import {useDarkModeContext} from "@/contexts/DarkModeContext";

export const useDarkMode = () => {
  const {isDarkMode, toggleDarkMode} = useDarkModeContext();

  return {
    isDarkMode,
    toggleDarkMode,
  };
};
