// contexts/MuiThemeContext.tsx
"use client";

import {useDarkMode} from "@/hooks/useDarkMode";
import {darkTheme, lightTheme} from "@/theme/muiTheme";
import CssBaseline from "@mui/material/CssBaseline";
import {ThemeProvider} from "@mui/material/styles";
import React, {ReactNode, useMemo} from "react";

interface MuiThemeProviderProps {
  children: ReactNode;
}

export const MuiThemeProvider: React.FC<MuiThemeProviderProps> = ({
  children,
}) => {
  const {isDarkMode} = useDarkMode();

  // テーマをメモ化
  const theme = useMemo(() => {
    return isDarkMode ? darkTheme : lightTheme;
  }, [isDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
