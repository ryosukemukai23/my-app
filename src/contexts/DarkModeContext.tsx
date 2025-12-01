// contexts/DarkModeContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined
);

export const useDarkModeContext = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkModeContext must be used within DarkModeProvider");
  }
  return context;
};

interface DarkModeProviderProps {
  children: ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // 初回マウント時にブラウザ設定とCookieから読み込み
  useEffect(() => {
    setMounted(true);

    // Cookieから読み込み
    const savedMode = document.cookie
      .split("; ")
      .find((row) => row.startsWith("darkMode="))
      ?.split("=")[1];

    if (savedMode) {
      setIsDarkMode(savedMode === "true");
    } else {
      // Cookieがない場合はブラウザ設定を使用
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // ダークモードの状態が変更されたらCookieに保存
  useEffect(() => {
    if (mounted) {
      document.cookie = `darkMode=${isDarkMode}; path=/; max-age=${
        60 * 60 * 24 * 365
      }`; // 1年間保存

      // HTMLタグにクラスを追加/削除
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDarkMode, mounted]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // マウント前は何も表示しない（ちらつき防止）
  if (!mounted) {
    return null;
  }

  return (
    <DarkModeContext.Provider value={{isDarkMode, toggleDarkMode}}>
      {children}
    </DarkModeContext.Provider>
  );
};
