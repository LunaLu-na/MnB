import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Alert,
} from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import ReplyIcon from "@mui/icons-material/Reply";
import VisibilityIcon from "@mui/icons-material/Visibility";
import auth from "../lib/auth-helper";

// API function to get user messages
const getUserMessages = async (email, userId, credentials) => {
  try {
    console.log("Making API call to getUserMessages with:", { email, userId, hasToken: !!credentials.t });
    
    let response = await fetch("/api/messages/user/messages", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify({ email, userId }),
    });
    
    console.log("API response status:", response.status);
    console.log("API response ok:", response.ok);
    
    if (!response.ok) {
      console.log("Response not ok, status:", response.status);
      const errorText = await response.text();
      console.log("Error response text:", errorText);
      return { error: `HTTP ${response.status}: ${errorText}` };
    }
    
    const result = await response.json();
    console.log("API response data:", result);
    return result;
  } catch (err) {
    console.log("Network error in getUserMessages:", err);
    return { error: "Network error" };
  }
};

export default function UserMessages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const jwt = auth.isAuthenticated();

  useEffect(() => {
    console.log("=== UserMessages useEffect ===");
    console.log("JWT exists:", !!jwt);
    console.log("JWT structure:", jwt);
    console.log("User exists:", !!jwt?.user);
    console.log("User email:", jwt?.user?.email);
    console.log("User ID:", jwt?.user?._id);
    
    if (jwt && jwt.user && jwt.user.email) {
      fetchMessages();
    } else {
      console.log("Not fetching messages - missing JWT or user info");
    }
  }, [jwt]);

  const fetchMessages = async () => {
    try {
      console.log("=== UserMessages Debug ===");
      console.log("Fetching messages with user:", jwt.user);
      console.log("User email:", jwt.user?.email);
      console.log("User ID:", jwt.user?._id);
      console.log("JWT token exists:", !!jwt.token);
      
      if (!jwt.user?.email) {
        setError("User email not found");
        setLoading(false);
        return;
      }
      
      const data = await getUserMessages(jwt.user.email, jwt.user._id, { t: jwt.token });
      console.log("API response:", data);
      
      if (data && data.error) {
        console.log("Error fetching messages:", data.error);
        setError(data.error);
        setMessages([]);
      } else {
        console.log("Messages fetched successfully:", data);
        console.log("Number of messages:", data?.length || 0);
        console.log("Raw data structure:", JSON.stringify(data, null, 2));
        setMessages(data || []);
        setError("");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message) => {
    console.log("Opening message:", message?.subject);
    setSelectedMessage(message);
    setOpenDialog(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!jwt) {
    return (
      <Box sx={{ padding: 3, minHeight: "400px", textAlign: "center" }}>
        <Alert severity="warning">
          Please sign in to view your messages.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ padding: 3, minHeight: "400px", textAlign: "center" }}>
        <Typography variant="h6">Loading messages...</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2, minHeight: "600px" }}>
      <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <MessageIcon sx={{ color: "primary.main" }} />
        My Messages
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Messages you've sent through the contact form and replies from admins will appear here.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {messages.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <MessageIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No messages yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Messages you send through the contact form will appear here.
          </Typography>
          <Button variant="outlined" href="/contact" sx={{ textDecoration: 'none' }}>
            Send a Message
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {messages.map((message) => (
            <Grid item xs={12} md={6} key={message._id}>
              <Card 
                sx={{ 
                  cursor: "pointer",
                  border: message.status === 'unread' ? '2px solid #e91e63' : '1px solid #e0e0e0',
                  backgroundColor: message.status === 'unread' ? 'rgba(233, 30, 99, 0.05)' : 'inherit',
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.2s ease",
                }}
                onClick={() => handleViewMessage(message)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                      {message.subject}
                    </Typography>
                    <Chip 
                      label={message.status}
                      size="small"
                      color={
                        message.status === 'unread' ? 'error' : 
                        message.status === 'read' ? 'warning' : 'success'
                      }
                      variant={message.status === 'unread' ? 'filled' : 'outlined'}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    To: <strong>Admin</strong>
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {message.message && message.message.length > 150 
                      ? `${message.message.substring(0, 150)}...`
                      : message.message}
                  </Typography>
                  
                  {message.reply && (
                    <Box sx={{ 
                      mb: 2,
                      p: 1.5,
                      backgroundColor: "rgba(233, 30, 99, 0.08)",
                      borderRadius: 1,
                      border: "1px solid rgba(233, 30, 99, 0.2)"
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main", display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <ReplyIcon fontSize="small" />
                        Reply from {message.reply.sentBy?.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {message.reply.content.length > 100 
                          ? `${message.reply.content.substring(0, 100)}...`
                          : message.reply.content}
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="caption" color="text.secondary">
                    Sent: {formatDate(message.created)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Message Detail Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6">{selectedMessage?.subject || "No Subject"}</Typography>
            <Typography variant="body2" color="text.secondary">
              To: Admin
            </Typography>
          </Box>
          <Chip 
            label={selectedMessage?.status}
            size="small"
            color={
              selectedMessage?.status === 'unread' ? 'error' : 
              selectedMessage?.status === 'read' ? 'warning' : 'success'
            }
            variant={selectedMessage?.status === 'unread' ? 'filled' : 'outlined'}
          />
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Your Message:
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-line", mb: 3 }}>
            {selectedMessage?.message || "No message content"}
          </Typography>
          
          {selectedMessage?.reply && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: "rgba(233, 30, 99, 0.05)", 
              borderRadius: 2,
              border: "1px solid rgba(233, 30, 99, 0.2)"
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}>
                Reply from {selectedMessage.reply.sentBy?.name}:
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line", mb: 1 }}>
                {selectedMessage.reply.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Replied: {new Date(selectedMessage.reply.sentAt).toLocaleString()}
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="caption" color="text.secondary">
            Sent: {selectedMessage && formatDate(selectedMessage.created)}
          </Typography>
          {selectedMessage?.updatedAt !== selectedMessage?.created && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              Last updated: {selectedMessage && formatDate(selectedMessage.updatedAt)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
