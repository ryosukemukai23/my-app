// app/[lang]/layout.tsx (MUI版)
import MuiHeader from "@/components/MUI/MuiHeader";
import {Box, Container} from "@mui/material";
import React from "react";

export async function generateStaticParams() {
  return [{lang: "ja"}, {lang: "en"}];
}

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    lang: string;
  }>;
}

export default async function LangLayout({children, params}: LangLayoutProps) {
  // paramsをawaitで解決
  const {lang} = await params;

  return (
    <Box sx={{display: "flex", flexDirection: "column", minHeight: "100vh"}}>
      <MuiHeader />
      <Box component="main" sx={{flexGrow: 1, py: 4}}>
        {children}
      </Box>
      <Box
        component="footer"
        sx={{
          borderTop: 1,
          borderColor: "divider",
          py: 3,
          textAlign: "center",
        }}
      >
        <Container>
          <Box sx={{color: "text.secondary", fontSize: "0.875rem"}}>
            © {new Date().getFullYear()} News Portal. All rights reserved.
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
