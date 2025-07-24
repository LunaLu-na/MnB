import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Alert,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import MailIcon from "@mui/icons-material/Mail";
import PeopleIcon from "@mui/icons-material/People";
import MessageIcon from "@mui/icons-material/Message";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import ReplyIcon from "@mui/icons-material/Reply";
import auth from "../lib/auth-helper";
import GalleryManagement from "./GalleryManagement";

// Memoized Letter Input Components to prevent parent re-renders
const LetterTitleInput = memo(({ value, onChange, ...props }) => (
  <TextField
    autoFocus
    margin="dense"
    label="Letter Title"
    placeholder="e.g., Open when you need encouragement..."
    fullWidth
    variant="outlined"
    value={value}
    onChange={onChange}
    sx={{ mb: 2 }}
    {...props}
  />
));

const LetterContentInput = memo(({ value, onChange, ...props }) => (
  <TextField
    margin="dense"
    label="Letter Content"
    placeholder="Write your heartfelt message here..."
    fullWidth
    multiline
    rows={8}
    variant="outlined"
    value={value}
    onChange={onChange}
    {...props}
  />
));

const ReplyInput = memo(({ value, onChange, ...props }) => (
  <TextField
    autoFocus
    margin="dense"
    label="Your Reply"
    placeholder="Write your reply here..."
    fullWidth
    multiline
    rows={6}
    variant="outlined"
    value={value}
    onChange={onChange}
    {...props}
  />
));

LetterTitleInput.displayName = 'LetterTitleInput';
LetterContentInput.displayName = 'LetterContentInput';
ReplyInput.displayName = 'ReplyInput';

// Letter API functions
const createLetter = async (letter, credentials) => {
  try {
    let response = await fetch("/api/letters", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify(letter),
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

const listLetters = async (signal) => {
  try {
    let response = await fetch("/api/letters", {
      method: "GET",
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

const removeLetter = async (params, credentials) => {
  try {
    let response = await fetch("/api/letters/" + params.letterId, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

const updateLetter = async (letterId, letter, credentials) => {
  try {
    let response = await fetch(`/api/letters/${letterId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify(letter),
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

// Users API functions
const listUsers = async (credentials) => {
  try {
    let response = await fetch("/api/users", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

// Messages API functions
const listMessages = async (credentials) => {
  try {
    let response = await fetch("/api/messages", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

const getMessageStats = async (credentials) => {
  try {
    let response = await fetch("/api/messages/stats", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

const markMessageAsRead = async (messageId, credentials) => {
  try {
    let response = await fetch(`/api/messages/${messageId}/read`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

const markMessageAsReplied = async (messageId, credentials) => {
  try {
    let response = await fetch(`/api/messages/${messageId}/replied`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

const deleteMessage = async (messageId, credentials) => {
  try {
    let response = await fetch(`/api/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

const replyToMessage = async (messageId, replyContent, credentials) => {
  try {
    let response = await fetch(`/api/messages/${messageId}/reply`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify({ replyContent }),
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

const toggleAdminStatus = async (userId, credentials) => {
  try {
    let response = await fetch(`/api/users/${userId}/toggle-admin`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

const deleteUser = async (userId, credentials) => {
  try {
    let response = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: "Network error" };
  }
};

function Admin() {
  const [activeTab, setActiveTab] = useState(0);
  const [letters, setLetters] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageStats, setMessageStats] = useState({ total: 0, unread: 0, read: 0, replied: 0 });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [editingLetter, setEditingLetter] = useState(null);
  const [newLetter, setNewLetter] = useState({ title: "", content: "" });
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Memoize JWT to prevent unnecessary re-renders caused by JSON.parse creating new objects
  const jwt = useMemo(() => {
    const jwtString = typeof window !== "undefined" ? sessionStorage.getItem("jwt") : null;
    return jwtString ? JSON.parse(jwtString) : false;
  }, []);
  const isAdmin = jwt && jwt.user && jwt.user.admin;
  
  // Memoize the token to prevent unnecessary re-renders
  const token = useMemo(() => jwt?.token, [jwt?.token]);

  useEffect(() => {
    if (!isAdmin) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    listLetters(signal).then((data) => {
      if (data && data.error) {
        setError(data.error);
        setLetters([]);
      } else {
        setLetters(data || []);
        setError("");
      }
    }).catch(error => {
      if (error.name !== 'AbortError') {
        setError("Failed to load letters");
        setLetters([]);
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !token) return;
    
    const fetchData = async () => {
      try {
        const [usersData, messagesData, statsData] = await Promise.all([
          listUsers({ t: token }),
          listMessages({ t: token }),
          getMessageStats({ t: token })
        ]);
        
        if (usersData && !usersData.error) {
          setUsers(usersData || []);
        }
        if (messagesData && !messagesData.error) {
          setMessages(messagesData || []);
        }
        if (statsData && !statsData.error) {
          setMessageStats(statsData);
        }
      } catch (error) {
        // Handle errors silently to avoid disrupting the UI
      }
    };
    
    fetchData();
  }, [isAdmin, token]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const data = await listUsers({ t: token });
      if (data && data.error) {
        setError(data.error);
        setUsers([]);
      } else {
        setUsers(data || []);
        setError("");
      }
    } catch (error) {
      setError("Failed to load users");
      setUsers([]);
    }
  }, [token]);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const data = await listMessages({ t: token });
      if (data && data.error) {
        setError(data.error);
        setMessages([]);
      } else {
        setMessages(data || []);
        setError("");
      }
    } catch (error) {
      setError("Failed to load messages");
      setMessages([]);
    }
  }, [token]);

  const fetchMessageStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getMessageStats({ t: token });
      if (data && data.error) {
        // Silently fail for stats
      } else {
        setMessageStats(data);
      }
    } catch (error) {
      // Silently fail for stats
    }
  }, [token]);

  const handleCreateLetter = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const result = await createLetter(newLetter, { t: token });
      if (result && result.error) {
        setError(result.error);
      } else {
        setSuccess("Letter created successfully!");
        // Refresh the letters list
        const updatedLetters = await listLetters();
        setLetters(updatedLetters || []);
        setOpenCreateDialog(false);
        setNewLetter({ title: "", content: "" });
      }
    } catch (error) {
      setError("Failed to create letter");
    } finally {
      setLoading(false);
    }
  }, [newLetter, token]);

  const handleDeleteLetter = async (letterId) => {
    if (window.confirm("Are you sure you want to delete this letter?")) {
      setError("");
      setSuccess("");
      
      try {
        const result = await removeLetter({ letterId }, { t: token });
        if (result && result.error) {
          console.error("Error deleting letter:", result.error);
          setError(result.error);
        } else {
          console.log("Letter deleted successfully");
          setSuccess("Letter deleted successfully!");
          // Refresh the letters list
          const updatedLetters = await listLetters();
          setLetters(updatedLetters || []);
        }
      } catch (error) {
        console.error("Error deleting letter:", error);
        setError("Failed to delete letter");
      }
    }
  };

  const handleViewLetter = (letter) => {
    setSelectedLetter(letter);
    setOpenViewDialog(true);
  };

  const handleEditLetter = (letter) => {
    setEditingLetter(letter);
    setNewLetter({ title: letter.title, content: letter.content });
    setOpenEditDialog(true);
  };

  const handleUpdateLetter = useCallback(async () => {
    if (!editingLetter) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const result = await updateLetter(editingLetter._id, newLetter, { t: token });
      if (result && result.error) {
        console.error("Error updating letter:", result.error);
        setError(result.error);
      } else {
        console.log("Letter updated successfully");
        setSuccess("Letter updated successfully!");
        // Refresh the letters list
        const updatedLetters = await listLetters();
        setLetters(updatedLetters || []);
        setOpenEditDialog(false);
        setEditingLetter(null);
        setNewLetter({ title: "", content: "" });
      }
    } catch (error) {
      console.error("Error updating letter:", error);
      setError("Failed to update letter");
    } finally {
      setLoading(false);
    }
  }, [editingLetter, newLetter, token]);

  const handleCloseEditDialog = useCallback(() => {
    setOpenEditDialog(false);
    setEditingLetter(null);
    setNewLetter({ title: "", content: "" });
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // User management functions
  const handleToggleAdmin = async (userId) => {
    if (window.confirm("Are you sure you want to toggle admin status for this user?")) {
      setError("");
      setSuccess("");
      
      try {
        const result = await toggleAdminStatus(userId, { t: token });
        if (result && result.error) {
          console.error("Error toggling admin status:", result.error);
          setError(result.error);
        } else {
          console.log("Admin status toggled successfully");
          setSuccess("User admin status updated successfully!");
          await fetchUsers(); // Refresh the users list
        }
      } catch (error) {
        console.error("Error toggling admin status:", error);
        setError("Failed to update admin status");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      setError("");
      setSuccess("");
      
      try {
        const result = await deleteUser(userId, { t: token });
        if (result && result.error) {
          console.error("Error deleting user:", result.error);
          setError(result.error);
        } else {
          console.log("User deleted successfully");
          setSuccess("User deleted successfully!");
          await fetchUsers(); // Refresh the users list
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user");
      }
    }
  };

  // Message management functions
  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setOpenMessageDialog(true);
    
    // Mark as read if it's unread
    if (message.status === 'unread') {
      handleMarkAsRead(message._id);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      const result = await markMessageAsRead(messageId, { t: token });
      if (result && result.error) {
        console.error("Error marking message as read:", result.error);
        setError(result.error);
      } else {
        await fetchMessages();
        await fetchMessageStats();
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      setError("Failed to mark message as read");
    }
  };

  const handleMarkAsReplied = async (messageId) => {
    try {
      const result = await markMessageAsReplied(messageId, { t: token });
      if (result && result.error) {
        console.error("Error marking message as replied:", result.error);
        setError(result.error);
      } else {
        setSuccess("Message marked as replied!");
        await fetchMessages();
        await fetchMessageStats();
        setOpenMessageDialog(false);
      }
    } catch (error) {
      console.error("Error marking message as replied:", error);
      setError("Failed to mark message as replied");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      try {
        const result = await deleteMessage(messageId, { t: token });
        if (result && result.error) {
          console.error("Error deleting message:", result.error);
          setError(result.error);
        } else {
          setSuccess("Message deleted successfully!");
          await fetchMessages();
          await fetchMessageStats();
          setOpenMessageDialog(false);
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        setError("Failed to delete message");
      }
    }
  };

  const handleReplyToMessage = useCallback(async () => {
    if (!replyContent.trim()) {
      setError("Reply content is required");
      return;
    }

    setLoading(true);
    try {
      const result = await replyToMessage(selectedMessage._id, replyContent, { t: token });
      if (result && result.error) {
        console.error("Error sending reply:", result.error);
        setError(result.error);
      } else {
        setSuccess("Reply sent successfully!");
        setReplyContent("");
        setOpenReplyDialog(false);
        setOpenMessageDialog(false);
        await fetchMessages();
        await fetchMessageStats();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      setError("Failed to send reply");
    } finally {
      setLoading(false);
    }
  }, [replyContent, selectedMessage, token, fetchMessages, fetchMessageStats]);

  // Check if user is admin
  if (!jwt) {
    return (
      <Paper elevation={3} sx={{ padding: 3, margin: 2, minHeight: "600px", textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>
        <Alert severity="warning" sx={{ mt: 4 }}>
          Please sign in to access the admin panel.
        </Alert>
      </Paper>
    );
  }

  if (!isAdmin) {
    const makeUserAdmin = async () => {
      try {
        const response = await fetch(`/api/users/${jwt.user._id}/make-admin`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        const result = await response.json();
        if (result.message) {
          alert('You are now an admin! Please sign out and sign back in to see the changes.');
        }
      } catch (error) {
        console.error('Error making user admin:', error);
      }
    };

    return (
      <Paper elevation={3} sx={{ padding: 3, margin: 2, minHeight: "600px", textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>
        <Alert severity="error" sx={{ mt: 4, mb: 3 }}>
          Access denied. Admin privileges required.
        </Alert>
        
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Debug Information:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            User ID: {jwt.user._id}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            User Name: {jwt.user.name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            User Email: {jwt.user.email}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Admin Status: {jwt.user.admin ? 'true' : 'false'}
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={makeUserAdmin}
            sx={{ mt: 2 }}
          >
            Make Me Admin (Debug)
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            This is a temporary debug feature. Click this button to grant yourself admin privileges.
          </Typography>
        </Box>
      </Paper>
    );
  }

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  // Memoized input handlers to prevent cursor jumping
  const handleLetterTitleChange = useCallback((e) => {
    setNewLetter(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleLetterContentChange = useCallback((e) => {
    setNewLetter(prev => ({ ...prev, content: e.target.value }));
  }, []);

  const handleReplyContentChange = useCallback((e) => {
    setReplyContent(e.target.value);
  }, []);

  // Memoize TabPanel to prevent recreation on every render
  const TabPanel = useCallback(({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`admin-tabpanel-${index}`}
        aria-labelledby={`admin-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
      </div>
    );
  }, []);

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2, minHeight: "600px" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Admin Panel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin tabs">
          <Tab icon={<MailIcon />} label="Letters" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
          <Tab icon={<PhotoLibraryIcon />} label="Gallery" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
          <Tab icon={<PeopleIcon />} label="Users" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
          <Tab 
            icon={
              <Badge badgeContent={messageStats.unread} color="error">
                <MessageIcon />
              </Badge>
            } 
            label="Messages" 
            id="admin-tab-3" 
            aria-controls="admin-tabpanel-3" 
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Manage "Open When..." Letters
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Create New Letter
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create and manage letters that will be displayed in the "For You" section for all users to read.
        </Typography>

      {letters.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No letters created yet.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{ mt: 2 }}
          >
            Create Your First Letter
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {letters.map((letter) => (
            <Grid item xs={12} lg={6} key={letter._id}>
              <Card sx={{ 
                height: "100%",
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": { 
                  transform: "translateY(-2px)",
                  boxShadow: 4
                }
              }}>
                <CardContent onClick={() => handleViewLetter(letter)}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                      {letter.title}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }} onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewLetter(letter)}
                        title="View Full Letter"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleEditLetter(letter)}
                        title="Edit Letter"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteLetter(letter._id)}
                        title="Delete Letter"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {letter.content && letter.content.length > 200 
                      ? `${letter.content.substring(0, 200)}...`
                      : letter.content}
                  </Typography>
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                    <Chip 
                      label={`By ${letter.author?.name || 'Unknown'}`} 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(letter.created)}
                    </Typography>
                  </Box>
                  
                  {letter.content && letter.content.length > 200 && (
                    <Typography variant="caption" color="primary" sx={{ mt: 1, display: "block", textAlign: "center" }}>
                      Click to read full letter
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Letter Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New "Open When..." Letter</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a letter that users can read in the "For You" section. These letters are meant to provide comfort, inspiration, or guidance.
          </Typography>
          <LetterTitleInput
            value={newLetter.title}
            onChange={handleLetterTitleChange}
          />
          <LetterContentInput
            value={newLetter.content}
            onChange={handleLetterContentChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateLetter} 
            variant="contained"
            disabled={loading || !newLetter.title.trim() || !newLetter.content.trim()}
          >
            {loading ? "Creating..." : "Create Letter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Letter Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedLetter?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: "pre-line", mb: 2 }}>
            {selectedLetter?.content}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, pt: 2, borderTop: "1px solid #e0e0e0" }}>
            <Chip 
              label={`By ${selectedLetter?.author?.name || 'Unknown'}`} 
              size="small" 
              variant="outlined" 
              color="primary"
            />
            <Typography variant="caption" color="text.secondary">
              Created: {selectedLetter && formatDate(selectedLetter.created)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Letter Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit "Open When..." Letter</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Edit this letter that users can read in the "For You" section.
          </Typography>
          <LetterTitleInput
            value={newLetter.title}
            onChange={handleLetterTitleChange}
          />
          <LetterContentInput
            value={newLetter.content}
            onChange={handleLetterContentChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateLetter} 
            variant="contained"
            disabled={loading || !newLetter.title.trim() || !newLetter.content.trim()}
          >
            {loading ? "Updating..." : "Update Letter"}
          </Button>
        </DialogActions>
      </Dialog>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <GalleryManagement />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            View and manage all registered users. Toggle admin privileges or remove users as needed.
          </Typography>
        </Box>

        {users.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <PeopleIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No users found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {users.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography variant="h6" component="h3">
                        {user.name}
                      </Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleAdmin(user._id)}
                          title={user.admin ? "Remove Admin" : "Make Admin"}
                          sx={{ 
                            color: user.admin ? "#e91e63" : "#757575",
                            "&:hover": { backgroundColor: "rgba(233, 30, 99, 0.1)" }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete User"
                          disabled={user._id === jwt.user._id} // Prevent self-deletion
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      @{user.username} • {user.email}
                    </Typography>
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Chip 
                        label={user.admin ? "Admin" : "User"} 
                        size="small" 
                        color={user.admin ? "primary" : "default"}
                        variant={user.admin ? "filled" : "outlined"}
                      />
                      {user._id === jwt.user._id && (
                        <Chip 
                          label="You" 
                          size="small" 
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Joined: {formatDate(user.created)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Contact Messages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            View and manage messages sent through the contact form.
          </Typography>
          
          {/* Message Stats */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Chip 
              label={`Total: ${messageStats.total}`} 
              variant="outlined" 
            />
            <Chip 
              label={`Unread: ${messageStats.unread}`} 
              color="error"
              variant={messageStats.unread > 0 ? "filled" : "outlined"}
            />
            <Chip 
              label={`Read: ${messageStats.read}`} 
              color="warning"
              variant="outlined"
            />
            <Chip 
              label={`Replied: ${messageStats.replied}`} 
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>

        {messages.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <MessageIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No messages yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Messages sent through the contact form will appear here.
            </Typography>
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
                      From: <strong>{message.name}</strong> ({message.email})
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {message.message && message.message.length > 150 
                        ? `${message.message.substring(0, 150)}...`
                        : message.message}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(message.created)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Message Detail Dialog */}
        <Dialog 
          open={openMessageDialog} 
          onClose={() => setOpenMessageDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6">{selectedMessage?.subject}</Typography>
              <Typography variant="body2" color="text.secondary">
                From: {selectedMessage?.name} ({selectedMessage?.email})
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
            <Typography variant="body1" sx={{ whiteSpace: "pre-line", mb: 3 }}>
              {selectedMessage?.message}
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
                <Typography variant="body2" sx={{ whiteSpace: "pre-line", mb: 1 }}>
                  {selectedMessage.reply.content}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sent: {new Date(selectedMessage.reply.sentAt).toLocaleString()}
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="caption" color="text.secondary">
              Received: {selectedMessage && formatDate(selectedMessage.created)}
            </Typography>
            {selectedMessage?.updatedAt !== selectedMessage?.created && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                Last updated: {selectedMessage && formatDate(selectedMessage.updatedAt)}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenMessageDialog(false)}
              color="inherit"
            >
              Close
            </Button>
            {!selectedMessage?.reply && (
              <Button 
                onClick={() => setOpenReplyDialog(true)}
                startIcon={<ReplyIcon />}
                variant="contained"
                color="primary"
              >
                Reply
              </Button>
            )}
            {selectedMessage?.status !== 'replied' && !selectedMessage?.reply && (
              <Button 
                onClick={() => handleMarkAsReplied(selectedMessage._id)}
                startIcon={<MarkEmailReadIcon />}
                variant="outlined"
                color="success"
              >
                Mark as Replied
              </Button>
            )}
            <Button 
              onClick={() => handleDeleteMessage(selectedMessage._id)}
              startIcon={<DeleteIcon />}
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog 
          open={openReplyDialog} 
          onClose={() => setOpenReplyDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Reply to {selectedMessage?.name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Original message: "{selectedMessage?.subject}"
            </Typography>
            <ReplyInput
              value={replyContent}
              onChange={handleReplyContentChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReplyDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleReplyToMessage}
              variant="contained"
              disabled={loading || !replyContent.trim()}
              startIcon={<ReplyIcon />}
            >
              {loading ? "Sending..." : "Send Reply"}
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>
    </Paper>
  );
}

export default memo(Admin);
