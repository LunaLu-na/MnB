import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

const SITE_PASSWORD = "migsandbia2025"; // You can change this to any password you want
const STORAGE_KEY = "siteAccessGranted";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function SiteProtection({ children }) {
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has already entered the correct password recently
    const accessData = localStorage.getItem(STORAGE_KEY);
    if (accessData) {
      try {
        const { timestamp } = JSON.parse(accessData);
        const now = Date.now();
        
        // Check if the session is still valid (within 24 hours)
        if (now - timestamp < SESSION_DURATION) {
          setIsAccessGranted(true);
        } else {
          // Session expired, remove the stored data
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        // Invalid data in localStorage, remove it
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const handlePasswordSubmit = useCallback(() => {
    if (password === SITE_PASSWORD) {
      // Store access permission with timestamp
      const accessData = {
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accessData));
      setIsAccessGranted(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  }, [password]);

  const handleKeyPress = useCallback((event) => {
    if (event.key === "Enter") {
      handlePasswordSubmit();
    }
  }, [handlePasswordSubmit]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAccessGranted(false);
    setPassword("");
    setError("");
  }, []);

  // Show loading state briefly
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh",
          backgroundColor: "#fdfcfc", // warm white
          background: "linear-gradient(135deg, #fdfcfc 0%, #fce4ec 100%)", // subtle pink gradient
        }}
      >
        <Typography variant="h6" sx={{ color: "#e91e63" }}>Loading...</Typography>
      </Box>
    );
  }

  // Show password dialog if access not granted
  if (!isAccessGranted) {
    return (
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh",
          backgroundColor: "#fdfcfc",
          background: "linear-gradient(135deg, #fdfcfc 0%, #fce4ec 100%)", // subtle pink gradient
          p: 2
        }}
      >
        <Paper elevation={8} sx={{ 
          maxWidth: 400, 
          width: "100%", 
          p: 4,
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(233, 30, 99, 0.1)",
        }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <LockIcon sx={{ fontSize: 48, color: "#e91e63", mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ color: "#e91e63", fontWeight: 300 }}>
              Migs & Bia
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ color: "#4a4a4a" }}>
              Site Access Required
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please enter the password to access this site.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            type="password"
            label="Enter Password"
            value={password}
            onChange={handlePasswordChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            sx={{ mb: 3 }}
            autoFocus
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handlePasswordSubmit}
            disabled={!password.trim()}
            size="large"
            sx={{
              background: "linear-gradient(45deg, #e91e63 30%, #f48fb1 90%)",
              borderRadius: 2,
              boxShadow: "0 3px 12px rgba(233, 30, 99, 0.3)",
              "&:hover": {
                background: "linear-gradient(45deg, #ad1457 30%, #e91e63 90%)",
                boxShadow: "0 6px 20px rgba(233, 30, 99, 0.4)",
              },
            }}
          >
            Access Site
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block", textAlign: "center" }}>
            Access will be remembered for 24 hours
          </Typography>
        </Paper>
      </Box>
    );
  }

  // If access is granted, render the children (the rest of the app)
  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {children}
      {/* Add padding to the body to ensure content doesn't get hidden behind logout button and footer */}
      <Box sx={{ paddingBottom: "120px" }} /> 
      
      {/* Logout button positioned to avoid overlaps */}
      <Button
        onClick={handleLogout}
        size="small"
        sx={{
          position: "fixed",
          bottom: 80, // Moved higher to avoid footer
          right: 20,
          zIndex: 10000, // Increased z-index to be above dialogs
          background: "rgba(233, 30, 99, 0.8)",
          color: "white",
          borderRadius: 2,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 4px 20px rgba(233, 30, 99, 0.3)", // Better shadow
          "&:hover": {
            background: "rgba(233, 30, 99, 0.9)",
            transform: "translateY(-2px)",
            boxShadow: "0 6px 25px rgba(233, 30, 99, 0.4)",
          },
          fontSize: "0.75rem",
          padding: "8px 16px", // Slightly larger padding
          minWidth: "auto",
          transition: "all 0.3s ease",
          // Ensure it doesn't interfere with other content
          pointerEvents: "auto",
          // Responsive positioning
          "@media (max-width: 600px)": {
            bottom: 76, // Adjusted for mobile
            right: 16,
            padding: "6px 12px",
            fontSize: "0.7rem",
          },
        }}
      >
        Logout Site
      </Button>
    </Box>
  );
}
