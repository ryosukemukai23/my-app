// components/MUI/MuiPagination.tsx
"use client";

import { Button, Stack, CircularProgress } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import React from "react";

interface MuiPaginationProps {
  hasNextPage: boolean;
  isLoading?: boolean;
  onNext: () => void;
  lang?: string;
}

const MuiPagination: React.FC<MuiPaginationProps> = ({
  hasNextPage,
  isLoading = false,
  onNext,
  lang = "ja",
}) => {
  // ✅ nextPageトークンがなければ「次へ」ボタン自体を表示しない
  if (!hasNextPage) {
    return null;
  }

  return (
    <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
      <Button
        variant="outlined"
        size="large"
        onClick={onNext}
        disabled={isLoading}
        endIcon={isLoading ? <CircularProgress size={18} /> : <ArrowForward />}
        sx={{ fontWeight: 600, minWidth: 160 }}
      >
        {lang === "ja" ? "次へ" : "Next"}
      </Button>
    </Stack>
  );
};

export default MuiPagination;
