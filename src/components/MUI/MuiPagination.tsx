// components/MUI/MuiPagination.tsx
"use client";

import {Pagination, Stack} from "@mui/material";
import React from "react";

interface MuiPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MuiPagination: React.FC<MuiPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handleChange = (event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Stack spacing={2} alignItems="center" sx={{mt: 4}}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handleChange}
        color="primary"
        size="large"
        showFirstButton
        showLastButton
        sx={{
          "& .MuiPaginationItem-root": {
            fontWeight: 500,
          },
          "& .Mui-selected": {
            fontWeight: 700,
          },
        }}
      />
    </Stack>
  );
};

export default MuiPagination;
