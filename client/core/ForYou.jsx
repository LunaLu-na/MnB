import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Grid,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import auth from "../lib/auth-helper";

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

export default function ForYou() {
  const [tabValue, setTabValue] = useState(0);
  const [letters, setLetters] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [editingLetter, setEditingLetter] = useState(null);
  const [newLetter, setNewLetter] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Memoize JWT to prevent unnecessary re-renders caused by JSON.parse creating new objects
  const jwt = useMemo(() => {
    const jwtString = typeof window !== "undefined" ? sessionStorage.getItem("jwt") : null;
    return jwtString ? JSON.parse(jwtString) : false;
  }, []);
  const isAdmin = jwt && jwt.user && jwt.user.admin;

  console.log("ForYou component is rendering!", { jwt, isAdmin, lettersCount: letters.length });

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    console.log("Fetching letters...");
    listLetters(signal).then((data) => {
      if (data && data.error) {
        console.log("Error fetching letters:", data.error);
        setError(data.error);
        setLetters([]);
      } else {
        console.log("Letters fetched successfully:", data);
        setLetters(data || []);
        setError("");
      }
    }).catch(error => {
      console.error("Error fetching letters:", error);
      setError("Failed to load letters");
      setLetters([]);
    });

    return function cleanup() {
      abortController.abort();
    };
  }, [refreshTrigger]);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  // Memoized input handlers to prevent cursor jumping
  const handleLetterTitleChange = useCallback((e) => {
    setNewLetter(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleLetterContentChange = useCallback((e) => {
    setNewLetter(prev => ({ ...prev, content: e.target.value }));
  }, []);

  const handleCreateLetter = async () => {
    if (!jwt) {
      alert("Please sign in to create letters");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      console.log("Creating letter:", newLetter);
      console.log("JWT token:", jwt.token);
      
      const result = await createLetter(newLetter, { t: jwt.token });
      console.log("Create letter result:", result);
      
      if (result && result.error) {
        console.error("Error creating letter:", result.error);
        setError(result.error);
      } else {
        console.log("Letter created successfully:", result);
        // Clear form and close dialog first
        setNewLetter({ title: "", content: "" });
        setOpenDialog(false);
        
        // Trigger a refresh by updating the refresh trigger
        setRefreshTrigger(prev => prev + 1);
        
        // Show success message
        alert("Letter created successfully!");
      }
    } catch (error) {
      console.error("Error creating letter:", error);
      setError("Failed to create letter");
    } finally {
      setLoading(false);
    }
  };

  const handleEditLetter = (letter) => {
    setEditingLetter(letter);
    setNewLetter({ title: letter.title, content: letter.content });
    setOpenDialog(true);
  };

  const handleUpdateLetter = async () => {
    if (!jwt || !editingLetter) {
      alert("Please sign in to update letters");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      console.log("Updating letter:", editingLetter._id, newLetter);
      
      const result = await updateLetter(editingLetter._id, newLetter, { t: jwt.token });
      console.log("Update letter result:", result);
      
      if (result && result.error) {
        console.error("Error updating letter:", result.error);
        setError(result.error);
      } else {
        console.log("Letter updated successfully:", result);
        // Clear form and close dialog
        setNewLetter({ title: "", content: "" });
        setEditingLetter(null);
        setOpenDialog(false);
        
        // Trigger a refresh
        setRefreshTrigger(prev => prev + 1);
        
        // Show success message
        alert("Letter updated successfully!");
      }
    } catch (error) {
      console.error("Error updating letter:", error);
      setError("Failed to update letter");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingLetter(null);
    setNewLetter({ title: "", content: "" });
  };

  const handleViewLetter = (letter) => {
    setSelectedLetter(letter);
    setOpenViewDialog(true);
  };

  const handleViewDialogClose = () => {
    setOpenViewDialog(false);
    setSelectedLetter(null);
  };

  const handleDeleteLetter = async (letterId) => {
    if (!jwt) {
      alert("Please sign in to delete letters");
      return;
    }

    if (window.confirm("Are you sure you want to delete this letter?")) {
      try {
        const result = await removeLetter({ letterId }, { t: jwt.token });
        if (result && result.error) {
          console.error("Error deleting letter:", result.error);
          setError(result.error);
        } else {
          console.log("Letter deleted successfully");
          // Trigger a refresh
          setRefreshTrigger(prev => prev + 1);
        }
      } catch (error) {
        console.error("Error deleting letter:", error);
        setError("Failed to delete letter");
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2, minHeight: "600px" }}>
      <Typography variant="h4" gutterBottom>
        For You
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Open when..." />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Letters from the Heart
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {isAdmin 
              ? "Create and manage letters that users can read."
              : "Read letters shared by administrators."}
          </Typography>

          {letters.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
              No letters available yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {letters.map((letter) => (
                <Grid item xs={12} md={6} key={letter._id}>
                  <Card sx={{ 
                    marginBottom: 2, 
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": { transform: "translateY(-2px)" }
                  }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Typography variant="h6" component="h3">
                          {letter.title}
                        </Typography>
                        {isAdmin && (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLetter(letter);
                              }}
                              startIcon={<EditIcon />}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLetter(letter._id);
                              }}
                              startIcon={<DeleteIcon />}
                            >
                              Delete
                            </Button>
                          </Box>
                        )}
                      </Box>
                      
                      <Box 
                        onClick={() => handleViewLetter(letter)}
                        sx={{ 
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                          p: 1,
                          borderRadius: 1,
                          transition: "background-color 0.2s ease-in-out"
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {letter.content && letter.content.length > 150 
                            ? `${letter.content.substring(0, 150)}...`
                            : letter.content}
                        </Typography>
                        
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Chip 
                            label={`By ${letter.author?.name || 'Unknown'}`} 
                            size="small" 
                            variant="outlined" 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(letter.created)}
                          </Typography>
                        </Box>
                        
                        {letter.content && letter.content.length > 150 && (
                          <Typography variant="caption" color="primary" sx={{ mt: 1, display: "block", textAlign: "center" }}>
                            Click to read full letter
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {isAdmin && (
            <Fab
              color="primary"
              aria-label="add"
              sx={{ 
                position: "fixed", 
                bottom: 140, // Positioned above logout site button
                right: 16, // Moved to right side above logout button
                zIndex: 1000
              }}
              onClick={() => setOpenDialog(true)}
            >
              <AddIcon />
            </Fab>
          )}
        </Box>
      )}

      {/* Create/Edit Letter Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLetter ? "Edit Letter" : "Create New Letter"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Letter Title"
            fullWidth
            variant="outlined"
            value={newLetter.title}
            onChange={handleLetterTitleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Letter Content"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={newLetter.content}
            onChange={handleLetterContentChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={editingLetter ? handleUpdateLetter : handleCreateLetter} 
            variant="contained"
            disabled={loading || !newLetter.title.trim() || !newLetter.content.trim()}
          >
            {loading 
              ? (editingLetter ? "Updating..." : "Creating...") 
              : (editingLetter ? "Update Letter" : "Create Letter")
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Letter Dialog */}
      <Dialog open={openViewDialog} onClose={handleViewDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" component="div">
            {selectedLetter?.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            By {selectedLetter?.author?.name || 'Unknown'} • {selectedLetter?.created && formatDate(selectedLetter.created)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {selectedLetter?.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewDialogClose}>Close</Button>
          {isAdmin && selectedLetter && (
            <>
              <Button 
                color="primary" 
                onClick={() => {
                  handleViewDialogClose();
                  handleEditLetter(selectedLetter);
                }}
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
              <Button 
                color="error" 
                onClick={() => {
                  handleViewDialogClose();
                  handleDeleteLetter(selectedLetter._id);
                }}
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
