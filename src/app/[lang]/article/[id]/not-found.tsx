// app/[lang]/article/[id]/not-found.tsx
import { Home } from "@mui/icons-material";
import { Alert, Box, Button, Container, Typography } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 3,
        }}
      >
        <Typography variant="h1" fontWeight={700} color="primary">
          404
        </Typography>
        <Typography variant="h4" fontWeight={600}>
          記事が見つかりません
        </Typography>
        <Alert severity="warning" sx={{ width: "100%" }}>
          お探しの記事は削除されたか、URLが間違っている可能性があります。
        </Alert>
        <Link href="/ja/top" passHref legacyBehavior>
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            component="a"
          >
            トップページに戻る
          </Button>
        </Link>
      </Box>
    </Container>
  );
}