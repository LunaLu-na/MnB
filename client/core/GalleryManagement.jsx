import React, { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Fab,
  IconButton,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  LinearProgress,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoIcon from "@mui/icons-material/Photo";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import auth from "../lib/auth-helper";
import { create, listAll, remove, update, addMedia, removeMedia } from "../gallery/api-album";

export default function GalleryManagement() {
  const [albums, setAlbums] = useState([]);
  const [openAlbumDialog, setOpenAlbumDialog] = useState(false);
  const [openMediaDialog, setOpenMediaDialog] = useState(false);
  const [openViewMediaDialog, setOpenViewMediaDialog] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(false);
  const [newAlbum, setNewAlbum] = useState({
    title: "",
    description: "",
    coverImage: "",
    isPublic: true,
  });
  const [newMedia, setNewMedia] = useState({
    title: "",
    description: "",
    type: "image",
    url: "",
    thumbnail: "",
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const jwt = auth.isAuthenticated();

  // Helper function to validate and fix URLs
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (/^\d+$/.test(url.trim())) return false; // Just a number
    if (url.startsWith('/') || url.startsWith('http')) return true;
    return false;
  };

  // Helper function to get the full URL for images
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) {
      // Use environment variable or fallback to current origin for production
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      return `${baseUrl}${url}`;
    }
    return url;
  };

  const cleanupAlbumData = (albums) => {
    return albums.map(album => ({
      ...album,
      coverImage: isValidImageUrl(album.coverImage) ? album.coverImage : null,
      media: album.media ? album.media.map(media => ({
        ...media,
        url: isValidImageUrl(media.url) ? media.url : null,
        thumbnail: isValidImageUrl(media.thumbnail) ? media.thumbnail : null
      })) : []
    }));
  };

  useEffect(() => {
    fetchAlbums();
    // Debug: Test auth status
    testAuthStatus();
  }, []);

  const testAuthStatus = async () => {
    try {
      const response = await fetch("/api/albums/debug", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + jwt.token,
        },
      });
      const data = await response.json();
      console.log("Auth debug info:", data);
    } catch (error) {
      console.error("Auth debug error:", error);
    }
  };

  const getAlbumCover = (album) => {
    console.log("GalleryManagement - Getting album cover for:", album.title);
    console.log("Album coverImage:", album.coverImage);
    console.log("Album media count:", album.media?.length || 0);
    
    // First, try the explicitly set cover image
    if (album.coverImage && album.coverImage.trim() !== "") {
      console.log("Using explicit cover image:", album.coverImage);
      
      // Check if the cover image is just a number (invalid URL)
      if (/^\d+$/.test(album.coverImage.trim())) {
        console.log("Cover image appears to be just a number, treating as invalid:", album.coverImage);
      } else {
        return getFullImageUrl(album.coverImage);
      }
    }
    
    // Fallback to first image in the album
    if (album.media && album.media.length > 0) {
      const firstImage = album.media.find(m => m.type === 'image');
      if (firstImage) {
        const imageUrl = firstImage.thumbnail || firstImage.url;
        console.log("Using fallback image:", imageUrl);
        
        // Check if this URL is also just a number
        if (/^\d+$/.test(imageUrl)) {
          console.log("Fallback image is also just a number:", imageUrl);
        } else {
          return getFullImageUrl(imageUrl);
        }
      }
      
      // If no images, try first video thumbnail
      const firstVideo = album.media.find(m => m.type === 'video' && (m.thumbnail || m.url));
      if (firstVideo) {
        const videoThumbnail = firstVideo.thumbnail || firstVideo.url;
        console.log("Using video thumbnail:", videoThumbnail);
        
        // Check if this URL is also just a number
        if (/^\d+$/.test(videoThumbnail)) {
          console.log("Video thumbnail is also just a number:", videoThumbnail);
        } else {
          return getFullImageUrl(videoThumbnail);
        }
      }
    }
    
    console.log("No valid cover image found, returning null");
    return null;
  };

  const fetchAlbums = async () => {
    console.log("GalleryManagement: Fetching albums...");
    console.log("JWT token:", jwt.token);
    
    try {
      const data = await listAll({ t: jwt.token });
      console.log("Albums API response:", data);
      
      if (data && data.error) {
        console.error("Albums API error:", data.error);
        setError(data.error);
        setAlbums([]);
      } else {
        console.log("Albums fetched successfully:", data);
        
        // Clean up the album data to remove invalid URLs
        const cleanedAlbums = cleanupAlbumData(data || []);
        console.log("Albums after cleanup:", cleanedAlbums);
        setAlbums(cleanedAlbums);
        setError("");
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
      setError("Failed to load albums");
      setAlbums([]);
    }
  };

  const uploadFile = async (file, type = 'media') => {
    console.log("Uploading file:", file.name, "Type:", type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + jwt.token,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log("Upload response:", result);
      console.log("Returning URL:", result.url);
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (fileType === 'image' && !file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (fileType === 'video' && !file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    // Set file state based on context
    if (fileType === 'coverImage') {
      setCoverImageFile(file);
    } else if (fileType === 'media') {
      setMediaFile(file);
    } else if (fileType === 'thumbnail') {
      setThumbnailFile(file);
    }

    setError('');
  };

  // Memoized handlers to prevent input field bugging
  const handleAlbumTitleChange = useCallback((e) => {
    setNewAlbum(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleAlbumDescriptionChange = useCallback((e) => {
    setNewAlbum(prev => ({ ...prev, description: e.target.value }));
  }, []);

  const handleAlbumCoverImageChange = useCallback((e) => {
    setNewAlbum(prev => ({ ...prev, coverImage: e.target.value }));
  }, []);

  const handleAlbumPublicToggle = useCallback((e) => {
    setNewAlbum(prev => ({ ...prev, isPublic: e.target.checked }));
  }, []);

  const handleMediaTitleChange = useCallback((e) => {
    setNewMedia(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleMediaTypeChange = useCallback((e) => {
    setNewMedia(prev => ({ ...prev, type: e.target.value }));
  }, []);

  const handleMediaUrlChange = useCallback((e) => {
    setNewMedia(prev => ({ ...prev, url: e.target.value }));
  }, []);

  const handleMediaThumbnailChange = useCallback((e) => {
    setNewMedia(prev => ({ ...prev, thumbnail: e.target.value }));
  }, []);

  const handleMediaDescriptionChange = useCallback((e) => {
    setNewMedia(prev => ({ ...prev, description: e.target.value }));
  }, []);

  // Memoized file change handlers
  const handleCoverImageFileChange = useCallback((e) => {
    handleFileChange(e, 'coverImage');
  }, []);

  const handleMediaFileChange = useCallback((e) => {
    handleFileChange(e, 'media');
  }, []);

  const handleThumbnailFileChange = useCallback((e) => {
    handleFileChange(e, 'thumbnail');
  }, []);

  const handleCreateAlbum = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      let albumData = { ...newAlbum };

      // Upload cover image if provided
      if (coverImageFile) {
        setUploadProgress(25);
        console.log("Uploading cover image file:", coverImageFile.name);
        const coverImageUrl = await uploadFile(coverImageFile, 'image');
        console.log("Cover image uploaded, URL:", coverImageUrl);
        albumData.coverImage = coverImageUrl;
        console.log("Album data with cover image:", albumData);
      }

      setUploadProgress(50);
      console.log("Creating album with data:", albumData);
      const result = await create(albumData, { t: jwt.token });
      console.log("Album creation result:", result);
      
      if (result && result.error) {
        setError(result.error);
      } else {
        setUploadProgress(100);
        setSuccess("Album created successfully!");
        await fetchAlbums();
        handleCloseAlbumDialog();
      }
    } catch (error) {
      console.error("Error creating album:", error);
      setError("Failed to create album");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdateAlbum = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      let albumData = { ...newAlbum };

      // Upload new cover image if provided
      if (coverImageFile) {
        setUploadProgress(25);
        const coverImageUrl = await uploadFile(coverImageFile, 'image');
        albumData.coverImage = coverImageUrl;
      }

      setUploadProgress(50);
      const result = await update(
        { albumId: selectedAlbum._id }, 
        { t: jwt.token }, 
        albumData
      );
      
      if (result && result.error) {
        setError(result.error);
      } else {
        setUploadProgress(100);
        setSuccess("Album updated successfully!");
        await fetchAlbums();
        handleCloseAlbumDialog();
      }
    } catch (error) {
      console.error("Error updating album:", error);
      setError("Failed to update album");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (window.confirm("Are you sure you want to delete this album? This action cannot be undone.")) {
      try {
        const result = await remove({ albumId }, { t: jwt.token });
        if (result && result.error) {
          setError(result.error);
        } else {
          setSuccess("Album deleted successfully!");
          await fetchAlbums();
        }
      } catch (error) {
        console.error("Error deleting album:", error);
        setError("Failed to delete album");
      }
    }
  };

  const handleAddMedia = async () => {
    setLoading(true);
    setError("");
    setUploadProgress(0);

    try {
      let mediaData = { ...newMedia };

      // Upload main media file
      if (mediaFile) {
        setUploadProgress(25);
        const mediaUrl = await uploadFile(mediaFile, newMedia.type);
        mediaData.url = mediaUrl;
      } else if (!newMedia.url.trim()) {
        setError("Please select a file or provide a URL");
        setLoading(false);
        return;
      }

      // Upload thumbnail if provided
      if (thumbnailFile) {
        setUploadProgress(50);
        const thumbnailUrl = await uploadFile(thumbnailFile, 'image');
        mediaData.thumbnail = thumbnailUrl;
      }

      setUploadProgress(75);
      const result = await addMedia(
        { albumId: selectedAlbum._id }, 
        { t: jwt.token }, 
        mediaData
      );
      
      if (result && result.error) {
        setError(result.error);
      } else {
        setUploadProgress(100);
        setSuccess("Media added successfully!");
        await fetchAlbums();
        handleCloseMediaDialog();
      }
    } catch (error) {
      console.error("Error adding media:", error);
      setError("Failed to add media");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteMedia = async (albumId, mediaId) => {
    if (window.confirm("Are you sure you want to delete this media item?")) {
      try {
        const result = await removeMedia({ albumId, mediaId }, { t: jwt.token });
        if (result && result.error) {
          setError(result.error);
        } else {
          setSuccess("Media deleted successfully!");
          await fetchAlbums();
        }
      } catch (error) {
        console.error("Error deleting media:", error);
        setError("Failed to delete media");
      }
    }
  };

  const openEditDialog = (album) => {
    setSelectedAlbum(album);
    setNewAlbum({
      title: album.title,
      description: album.description,
      coverImage: album.coverImage,
      isPublic: album.isPublic,
    });
    setEditingAlbum(true);
    setOpenAlbumDialog(true);
  };

  const openAddMediaDialog = (album) => {
    setSelectedAlbum(album);
    setOpenMediaDialog(true);
  };

  const handleViewMedia = (album) => {
    setSelectedAlbum(album);
    setOpenViewMediaDialog(true);
  };

  const handleCloseAlbumDialog = () => {
    setOpenAlbumDialog(false);
    setEditingAlbum(false);
    setSelectedAlbum(null);
    setNewAlbum({ title: "", description: "", coverImage: "", isPublic: true });
    setCoverImageFile(null);
    setUploadProgress(0);
  };

  const handleCloseMediaDialog = () => {
    setOpenMediaDialog(false);
    setNewMedia({ title: "", description: "", type: "image", url: "", thumbnail: "" });
    setMediaFile(null);
    setThumbnailFile(null);
    setUploadProgress(0);
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gallery Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAlbumDialog(true)}
        >
          Create Album
        </Button>
      </Box>

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

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create and manage photo and video albums for the gallery.
      </Typography>

      {albums.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <PhotoIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No albums created yet
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenAlbumDialog(true)}
            sx={{ mt: 2 }}
          >
            Create Your First Album
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {albums.map((album) => (
            <Grid item xs={12} sm={6} md={4} key={album._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="160"
                  image={getAlbumCover(album) || `data:image/svg+xml;base64,${btoa(`
                    <svg width="300" height="160" xmlns="http://www.w3.org/2000/svg">
                      <rect width="300" height="160" fill="#f5f5f5"/>
                      <text x="150" y="70" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle" dy=".3em">
                        ${album.title}
                      </text>
                      <text x="150" y="90" font-family="Arial, sans-serif" font-size="12" fill="#ccc" text-anchor="middle" dy=".3em">
                        No Cover Image
                      </text>
                    </svg>
                  `)}`}
                  alt={album.title}
                  sx={{ objectFit: "cover" }}
                  onError={(e) => {
                    console.log("GalleryManagement - Image failed to load for album:", album.title);
                    console.log("Failed image URL:", e.target.src);
                    e.target.src = `data:image/svg+xml;base64,${btoa(`
                      <svg width="300" height="160" xmlns="http://www.w3.org/2000/svg">
                        <rect width="300" height="160" fill="#ffebee"/>
                        <text x="150" y="70" font-family="Arial, sans-serif" font-size="14" fill="#f44336" text-anchor="middle" dy=".3em">
                          ${album.title}
                        </text>
                        <text x="150" y="90" font-family="Arial, sans-serif" font-size="12" fill="#f44336" text-anchor="middle" dy=".3em">
                          Image Load Error
                        </text>
                      </svg>
                    `)}`;
                  }}
                />
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography variant="h6" component="h3">
                      {album.title}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(album)}
                        title="Edit Album"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAlbum(album._id)}
                        title="Delete Album"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {album.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {album.description.length > 80 
                        ? `${album.description.substring(0, 80)}...`
                        : album.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Chip 
                      label={`${album.media?.length || 0} items`} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={album.isPublic ? "Public" : "Private"} 
                      size="small" 
                      color={album.isPublic ? "success" : "default"}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => openAddMediaDialog(album)}
                      sx={{ flex: 1 }}
                    >
                      Add Media
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VideoLibraryIcon />}
                      onClick={() => handleViewMedia(album)}
                      sx={{ flex: 1 }}
                    >
                      View Contents
                    </Button>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Created: {formatDate(album.created)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Album Dialog */}
      <Dialog open={openAlbumDialog} onClose={handleCloseAlbumDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAlbum ? "Edit Album" : "Create New Album"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Album Title"
            fullWidth
            variant="outlined"
            value={newAlbum.title}
            onChange={handleAlbumTitleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newAlbum.description}
            onChange={handleAlbumDescriptionChange}
            sx={{ mb: 2 }}
          />
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">Cover Image</Typography>
          </Divider>
          
          {/* Cover Image Upload */}
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="cover-image-upload"
              type="file"
              onChange={handleCoverImageFileChange}
            />
            <label htmlFor="cover-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                {coverImageFile ? coverImageFile.name : "Upload Cover Image"}
              </Button>
            </label>
            {coverImageFile && (
              <Typography variant="caption" color="text.secondary">
                Selected: {coverImageFile.name} ({(coverImageFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
          </Box>

          {/* Alternative URL input */}
          <TextField
            margin="dense"
            label="Or Cover Image URL"
            fullWidth
            variant="outlined"
            value={newAlbum.coverImage}
            onChange={handleAlbumCoverImageChange}
            sx={{ mb: 2 }}
            placeholder="Leave empty if uploading file above"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={newAlbum.isPublic}
                onChange={handleAlbumPublicToggle}
              />
            }
            label="Make album public"
          />
          
          {uploadProgress > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1 }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlbumDialog}>Cancel</Button>
          <Button 
            onClick={editingAlbum ? handleUpdateAlbum : handleCreateAlbum} 
            variant="contained"
            disabled={loading || !newAlbum.title.trim()}
          >
            {loading ? "Saving..." : editingAlbum ? "Update Album" : "Create Album"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Media Dialog */}
      <Dialog open={openMediaDialog} onClose={handleCloseMediaDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Media to "{selectedAlbum?.title}"</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Media Title"
            fullWidth
            variant="outlined"
            value={newMedia.title}
            onChange={handleMediaTitleChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Media Type</InputLabel>
            <Select
              value={newMedia.type}
              label="Media Type"
              onChange={handleMediaTypeChange}
            >
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="video">Video</MenuItem>
            </Select>
          </FormControl>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {newMedia.type === 'image' ? 'Image File' : 'Video File'}
            </Typography>
          </Divider>

          {/* Media File Upload */}
          <Box sx={{ mb: 2 }}>
            <input
              accept={newMedia.type === 'image' ? 'image/*' : 'video/*'}
              style={{ display: 'none' }}
              id="media-file-upload"
              type="file"
              onChange={handleMediaFileChange}
            />
            <label htmlFor="media-file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFileIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                {mediaFile ? mediaFile.name : `Upload ${newMedia.type === 'image' ? 'Image' : 'Video'}`}
              </Button>
            </label>
            {mediaFile && (
              <Typography variant="caption" color="text.secondary">
                Selected: {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
          </Box>

          {/* Alternative URL */}
          <TextField
            margin="dense"
            label="Or Media URL"
            fullWidth
            variant="outlined"
            value={newMedia.url}
            onChange={handleMediaUrlChange}
            sx={{ mb: 2 }}
            placeholder="Leave empty if uploading file above"
          />

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">Thumbnail (Optional)</Typography>
          </Divider>

          {/* Thumbnail Upload */}
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="thumbnail-upload"
              type="file"
              onChange={handleThumbnailFileChange}
            />
            <label htmlFor="thumbnail-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                {thumbnailFile ? thumbnailFile.name : "Upload Thumbnail"}
              </Button>
            </label>
            {thumbnailFile && (
              <Typography variant="caption" color="text.secondary">
                Selected: {thumbnailFile.name} ({(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
          </Box>

          {/* Alternative thumbnail URL */}
          <TextField
            margin="dense"
            label="Or Thumbnail URL"
            fullWidth
            variant="outlined"
            value={newMedia.thumbnail}
            onChange={handleMediaThumbnailChange}
            sx={{ mb: 2 }}
            placeholder="Leave empty if uploading file above"
          />
          
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newMedia.description}
            onChange={handleMediaDescriptionChange}
          />

          {uploadProgress > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1 }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMediaDialog}>Cancel</Button>
          <Button 
            onClick={handleAddMedia} 
            variant="contained"
            disabled={loading || !newMedia.title.trim() || (!mediaFile && !newMedia.url.trim())}
          >
            {loading ? "Adding..." : "Add Media"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Media Dialog */}
      <Dialog open={openViewMediaDialog} onClose={() => setOpenViewMediaDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">
              Media in "{selectedAlbum?.title}" ({selectedAlbum?.media?.length || 0} items)
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setOpenViewMediaDialog(false);
                openAddMediaDialog(selectedAlbum);
              }}
            >
              Add Media
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAlbum?.media?.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <PhotoIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No media in this album yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setOpenViewMediaDialog(false);
                  openAddMediaDialog(selectedAlbum);
                }}
              >
                Add First Media Item
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {selectedAlbum?.media?.map((media, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    {media.type === 'image' ? (
                      <CardMedia
                        component="img"
                        height="160"
                        image={getFullImageUrl(media.url)}
                        alt={media.title}
                        sx={{ objectFit: "cover" }}
                      />
                    ) : (
                      <Box sx={{ 
                        height: 160, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        backgroundColor: "#f5f5f5"
                      }}>
                        <VideoLibraryIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                      </Box>
                    )}
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                          {media.title}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteMedia(selectedAlbum._id, media._id)}
                          title="Delete Media"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      {media.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem' }}>
                          {media.description.length > 60 
                            ? `${media.description.substring(0, 60)}...`
                            : media.description}
                        </Typography>
                      )}
                      
                      <Chip 
                        label={media.type} 
                        size="small" 
                        variant="outlined"
                        color={media.type === 'image' ? 'primary' : 'secondary'}
                      />
                      
                      {media.type === 'video' && (
                        <Button
                          size="small"
                          variant="outlined"
                          href={media.url}
                          target="_blank"
                          sx={{ mt: 1, fontSize: '0.7rem' }}
                          fullWidth
                        >
                          Watch Video
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewMediaDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
