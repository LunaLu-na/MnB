import React from "react";
import { Box, Typography, Link, Container, Divider } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "rgba(233, 30, 99, 0.05)",
        borderTop: "1px solid rgba(233, 30, 99, 0.1)",
        mt: "auto",
        py: 3,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Copyright */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: { xs: "center", md: "left" },
            }}
          >
            © {currentYear} Migs & Bia. All rights reserved.
          </Typography>

          {/* Contact Link */}
          <Link
            href="/contact"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "primary.main",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
              "&:hover": {
                color: "primary.dark",
                textDecoration: "underline",
                transform: "translateY(-1px)",
              },
            }}
          >
            <EmailIcon sx={{ fontSize: 18 }} />
            Send message to Miggy
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
