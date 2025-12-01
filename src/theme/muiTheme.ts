// theme/muiTheme.ts
"use client";

import {createTheme, ThemeOptions} from "@mui/material/styles";

// アクセントカラー
const ACCENT_COLOR = "#801b2b";

// ライトモードテーマ
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: ACCENT_COLOR,
      light: "#a02238",
      dark: "#60151f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#000000",
      light: "#333333",
      dark: "#000000",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#666666",
    },
    divider: "#e0e0e0",
  },
  typography: {
    fontFamily: "Inter, Helvetica, Arial, sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 0,
  },
  shadows: [
    "none",
    "0 2px 8px rgba(0, 0, 0, 0.1)",
    "0 4px 12px rgba(0, 0, 0, 0.1)",
    "0 6px 16px rgba(0, 0, 0, 0.1)",
    "0 8px 20px rgba(0, 0, 0, 0.1)",
    "0 10px 24px rgba(0, 0, 0, 0.1)",
    "0 12px 28px rgba(0, 0, 0, 0.15)",
    "0 14px 32px rgba(0, 0, 0, 0.15)",
    "0 16px 36px rgba(0, 0, 0, 0.15)",
    "0 18px 40px rgba(0, 0, 0, 0.15)",
    "0 20px 44px rgba(0, 0, 0, 0.2)",
    "0 22px 48px rgba(0, 0, 0, 0.2)",
    "0 24px 52px rgba(0, 0, 0, 0.2)",
    "0 26px 56px rgba(0, 0, 0, 0.2)",
    "0 28px 60px rgba(0, 0, 0, 0.25)",
    "0 30px 64px rgba(0, 0, 0, 0.25)",
    "0 32px 68px rgba(0, 0, 0, 0.25)",
    "0 34px 72px rgba(0, 0, 0, 0.25)",
    "0 36px 76px rgba(0, 0, 0, 0.3)",
    "0 38px 80px rgba(0, 0, 0, 0.3)",
    "0 40px 84px rgba(0, 0, 0, 0.3)",
    "0 42px 88px rgba(0, 0, 0, 0.3)",
    "0 44px 92px rgba(0, 0, 0, 0.35)",
    "0 46px 96px rgba(0, 0, 0, 0.35)",
    "0 48px 100px rgba(0, 0, 0, 0.35)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
};

// ダークモードテーマ
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: ACCENT_COLOR,
      light: "#a02238",
      dark: "#60151f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ffffff",
      light: "#ffffff",
      dark: "#cccccc",
      contrastText: "#000000",
    },
    background: {
      default: "#000000",
      paper: "#1a1a1a",
    },
    text: {
      primary: "#ffffff",
      secondary: "#aaaaaa",
    },
    divider: "#333333",
  },
  typography: {
    fontFamily: "Inter, Helvetica, Arial, sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 0,
  },
  shadows: [
    "none",
    "0 2px 8px rgba(255, 255, 255, 0.05)",
    "0 4px 12px rgba(255, 255, 255, 0.05)",
    "0 6px 16px rgba(255, 255, 255, 0.05)",
    "0 8px 20px rgba(255, 255, 255, 0.05)",
    "0 10px 24px rgba(255, 255, 255, 0.05)",
    "0 12px 28px rgba(255, 255, 255, 0.1)",
    "0 14px 32px rgba(255, 255, 255, 0.1)",
    "0 16px 36px rgba(255, 255, 255, 0.1)",
    "0 18px 40px rgba(255, 255, 255, 0.1)",
    "0 20px 44px rgba(255, 255, 255, 0.15)",
    "0 22px 48px rgba(255, 255, 255, 0.15)",
    "0 24px 52px rgba(255, 255, 255, 0.15)",
    "0 26px 56px rgba(255, 255, 255, 0.15)",
    "0 28px 60px rgba(255, 255, 255, 0.2)",
    "0 30px 64px rgba(255, 255, 255, 0.2)",
    "0 32px 68px rgba(255, 255, 255, 0.2)",
    "0 34px 72px rgba(255, 255, 255, 0.2)",
    "0 36px 76px rgba(255, 255, 255, 0.25)",
    "0 38px 80px rgba(255, 255, 255, 0.25)",
    "0 40px 84px rgba(255, 255, 255, 0.25)",
    "0 42px 88px rgba(255, 255, 255, 0.25)",
    "0 44px 92px rgba(255, 255, 255, 0.3)",
    "0 46px 96px rgba(255, 255, 255, 0.3)",
    "0 48px 100px rgba(255, 255, 255, 0.3)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(255, 255, 255, 0.05)",
        },
      },
    },
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
