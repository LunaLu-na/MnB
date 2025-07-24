import React, { useState, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Container,
  CircularProgress,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";
import auth from "../lib/auth-helper";

// API function to send message
const sendMessage = async (messageData) => {
  try {
    let response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const jwt = auth.isAuthenticated();

  // Auto-fill user information if logged in
  useEffect(() => {
    if (jwt && jwt.user) {
      setFormData(prev => ({
        ...prev,
        name: jwt.user.name || "",
        email: jwt.user.email || "",
      }));
    }
  }, [jwt]);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Include user ID if authenticated
      const messageData = {
        ...formData,
        userId: jwt?.user?._id || null
      };
      
      const result = await sendMessage(messageData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setFormData(prev => ({ 
          ...prev, 
          subject: "", 
          message: "" 
        })); // Only clear subject and message, keep name/email
      }
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData, jwt]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ padding: 4, margin: 2 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <EmailIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ color: "primary.main" }}>
            Send Message to Miggy
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Have something to share? Send a message and it will be delivered to Miggy.
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your message has been sent successfully! Miggy will get back to you soon.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Your Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            variant="outlined"
            InputProps={{
              readOnly: !!jwt,
            }}
            helperText={jwt ? "Using your registered name" : ""}
          />

          <TextField
            fullWidth
            label="Your Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            variant="outlined"
            InputProps={{
              readOnly: !!jwt,
            }}
            helperText={jwt ? "Using your registered email" : ""}
          />

          <TextField
            fullWidth
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Your Message"
            name="message"
            multiline
            rows={6}
            value={formData.message}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            variant="outlined"
            placeholder="Write your message here..."
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={loading}
            sx={{
              background: "linear-gradient(45deg, #e91e63 30%, #f48fb1 90%)",
              borderRadius: 2,
              boxShadow: "0 3px 12px rgba(233, 30, 99, 0.3)",
              "&:hover": {
                background: "linear-gradient(45deg, #ad1457 30%, #e91e63 90%)",
                boxShadow: "0 6px 20px rgba(233, 30, 99, 0.4)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                opacity: 0.7,
                transform: "none",
              },
              transition: "all 0.3s ease",
            }}
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 3, textAlign: "center" }}
        >
          Your message will be sent directly to Miggy's inbox.
        </Typography>
      </Paper>
    </Container>
  );
}
