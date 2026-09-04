import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MuiThemeProvider } from "@/contexts/MuiThemeContext";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "News Portal News Platform",
  description: "Stay updated with the latest news from around the world",
  keywords: ["news", "AI", "weather", "sports", "entertainment", "technology"],
  authors: [{ name: "Your Name" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#ffffff",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#000000",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <DarkModeProvider>
          <MuiThemeProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </MuiThemeProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
