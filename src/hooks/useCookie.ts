// hooks/useCookie.ts
"use client";

import {useCallback, useEffect, useState} from "react";

export const useCookie = (key: string, defaultValue: string = "") => {
  const [value, setValue] = useState<string>(defaultValue);
  const [mounted, setMounted] = useState<boolean>(false);

  // Cookieから値を取得
  const getCookie = useCallback((name: string): string | null => {
    if (typeof window === "undefined") return null;

    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

    return value || null;
  }, []);

  // Cookieに値を設定
  const setCookie = useCallback(
    (name: string, value: string, days: number = 365) => {
      if (typeof window === "undefined") return;

      const maxAge = days * 24 * 60 * 60; // 秒単位に変換
      document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
    },
    []
  );

  // Cookieを削除
  const removeCookie = useCallback((name: string) => {
    if (typeof window === "undefined") return;

    document.cookie = `${name}=; path=/; max-age=0`;
  }, []);

  // 初回マウント時にCookieから読み込み
  useEffect(() => {
    setMounted(true);
    const cookieValue = getCookie(key);
    if (cookieValue !== null) {
      setValue(cookieValue);
    }
  }, [key, getCookie]);

  // 値が変更されたらCookieに保存
  const updateValue = useCallback(
    (newValue: string) => {
      setValue(newValue);
      setCookie(key, newValue);
    },
    [key, setCookie]
  );

  // Cookieを削除して初期値に戻す
  const resetValue = useCallback(() => {
    setValue(defaultValue);
    removeCookie(key);
  }, [key, defaultValue, removeCookie]);

  return {
    value,
    setValue: updateValue,
    resetValue,
    mounted,
  };
};
