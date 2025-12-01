// components/MUI/MuiHeader.tsx (検索機能改善版)
"use client";

import Logo3D from "@/components/3D/Logo3D";
import {useDarkMode} from "@/hooks/useDarkMode";
import {useLanguage} from "@/hooks/useLanguage";
import {
  Brightness4,
  Brightness7,
  Language as LanguageIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Collapse,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import React, {useState} from "react";

const categories = [
  "top",
  "general",
  "science",
  "sports",
  "business",
  "health",
  "entertainment",
  "tech",
  "politics",
  "food",
  "travel",
];

interface MuiHeaderProps {
  onSearch?: (query: string) => void;
}

const MuiHeader: React.FC<MuiHeaderProps> = ({onSearch}) => {
  const {isDarkMode, toggleDarkMode} = useDarkMode();
  const {language, setLanguage, t} = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const currentCategory = pathname?.split("/").pop() || "top";
  const currentIndex = categories.indexOf(currentCategory);

  const handleTabChange = () => {};

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;

    // ✅ onSearch が渡されている場合（カテゴリーページ内検索）
    if (onSearch) {
      onSearch(searchQuery);
      setIsSearchOpen(false);
      return;
    }

    // ✅ onSearch がない場合、現在のカテゴリーで検索
    const searchPath = `/${language}/${currentCategory}?q=${encodeURIComponent(searchQuery)}`;
    router.push(searchPath);
    setIsSearchOpen(false);
  };

  const handleLanguageToggle = () => {
    setLanguage(language === "ja" ? "en" : "ja");
  };

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        {/* ロゴエリア */}
        <Link
          href={`/${language}/top`}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{mr: 1.5}}>
            <Logo3D size={40} />
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            News Portal
          </Typography>
        </Link>

        <Box sx={{flexGrow: 1}} />

        {/* 右側コントロール */}
        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
          {/* ✅ 全ページで検索ボタンを表示 */}
          <IconButton
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            color="inherit"
          >
            <SearchIcon />
          </IconButton>

          <IconButton onClick={handleLanguageToggle} color="inherit">
            <LanguageIcon />
            <Typography variant="caption" sx={{ml: 0.5, fontWeight: 600}}>
              {language.toUpperCase()}
            </Typography>
          </IconButton>

          <IconButton onClick={toggleDarkMode} color="inherit">
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>

      {/* ✅ 検索フォーム（全ページで表示） */}
      <Collapse in={isSearchOpen}>
        <Box sx={{p: 2, borderTop: 1, borderColor: "divider"}}>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "ja"
                  ? "ニュースを検索..."
                  : "Search news..."
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="small"
                      disabled={!searchQuery.trim()}
                    >
                      {language === "ja" ? "検索" : "Search"}
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Box>
      </Collapse>

      {/* カテゴリタブ */}
      <Box sx={{borderTop: 1, borderColor: "divider", overflowX: "auto"}}>
        <Tabs
          value={currentIndex >= 0 ? currentIndex : 0}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              minHeight: 48,
              textTransform: "none",
              fontWeight: 500,
            },
          }}
        >
          {categories.map((category) => (
            <Tab
              key={category}
              label={t(`category.${category}`)}
              component={Link}
              href={`/${language}/${category}`}
            />
          ))}
        </Tabs>
      </Box>
    </AppBar>
  );
};

export default MuiHeader;