import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ImageList,
  ImageListItem,
  Chip,
  Skeleton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PhotoIcon from "@mui/icons-material/Photo";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { list } from "../gallery/api-album";

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [allMedia, setAllMedia] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [openAlbumDialog, setOpenAlbumDialog] = useState(false);
  const [openMediaDialog, setOpenMediaDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const fullUrl = `${baseUrl}${url}`;
      console.log("Building image URL:", {
        originalUrl: url,
        baseUrl: baseUrl,
        fullUrl: fullUrl,
        isProduction: import.meta.env.PROD,
        environment: import.meta.env.MODE
      });
      return fullUrl;
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
    const abortController = new AbortController();
    const signal = abortController.signal;

    list(signal).then((data) => {
      if (data && data.error) {
        console.log("Error fetching albums:", data.error);
        setError(data.error);
        setAlbums([]);
        setAllMedia([]);
      } else {
        console.log("Albums fetched:", data);
        
        // Clean up the album data to remove invalid URLs
        const cleanedAlbums = cleanupAlbumData(data || []);
        console.log("Albums after cleanup:", cleanedAlbums);
        setAlbums(cleanedAlbums);
        
        // Extract all media from all albums for the media row
        const mediaItems = [];
        if (cleanedAlbums && Array.isArray(cleanedAlbums)) {
          cleanedAlbums.forEach(album => {
            if (album.media && Array.isArray(album.media)) {
              album.media.forEach(media => {
                // Only include media with valid URLs
                if (isValidImageUrl(media.url) || isValidImageUrl(media.thumbnail)) {
                  mediaItems.push({
                    ...media,
                    albumTitle: album.title,
                    albumId: album._id
                  });
                }
              });
            }
          });
        }
        setAllMedia(mediaItems);
        setError("");
      }
      setLoading(false);
    }).catch(error => {
      console.error("Error fetching albums:", error);
      setError("Failed to load albums");
      setAlbums([]);
      setAllMedia([]);
      setLoading(false);
    });

    return function cleanup() {
      abortController.abort();
    };
  }, []);

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    setOpenAlbumDialog(true);
  };

  const handleMediaClick = (media) => {
    setSelectedMedia(media);
    setOpenMediaDialog(true);
  };

  const getAlbumCover = (album) => {
    console.log("Getting album cover for:", album.title);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ padding: 3, margin: 2, minHeight: "600px" }}>
        <Typography variant="h4" gutterBottom>
          Gallery
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2, minHeight: "600px" }}>
      <Typography variant="h4" gutterBottom>
        Gallery
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Explore our photo and video albums
      </Typography>

      {/* Latest Images and Videos Row */}
      {allMedia.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PhotoIcon sx={{ color: "primary.main" }} />
            Latest Images & Videos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Recent uploads from all albums
          </Typography>
          
          <Box sx={{ 
            display: "flex", 
            gap: 2, 
            overflowX: "auto", 
            pb: 2,
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0,0,0,0.1)",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "primary.main",
              borderRadius: 4,
            },
          }}>
            {allMedia.slice(0, 12).map((media, index) => (
              <Card 
                key={media._id || index}
                sx={{ 
                  minWidth: 200,
                  cursor: "pointer",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": { transform: "translateY(-2px)" }
                }}
                onClick={() => handleMediaClick(media)}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="150"
                    image={getFullImageUrl(media.thumbnail || media.url)}
                    alt={media.title}
                    sx={{ objectFit: "cover" }}
                  />
                  {media.type === 'video' && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        borderRadius: "50%",
                        padding: 1,
                      }}
                    >
                      <PlayArrowIcon sx={{ color: "white", fontSize: 24 }} />
                    </Box>
                  )}
                  <Chip
                    icon={media.type === 'video' ? <VideoLibraryIcon /> : <PhotoIcon />}
                    label={media.type}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(255,255,255,0.9)",
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {media.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    From: {media.albumTitle}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
          
          <Divider sx={{ mt: 3, mb: 3 }} />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Albums Section */}
      <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <VideoLibraryIcon sx={{ color: "primary.main" }} />
        Albums
      </Typography>

      {albums.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <PhotoIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No albums available yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for new content!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {albums.map((album) => (
            <Grid item xs={12} sm={6} md={4} key={album._id}>
              <Card 
                sx={{ 
                  cursor: "pointer", 
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": { transform: "translateY(-4px)" }
                }}
                onClick={() => handleAlbumClick(album)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={getAlbumCover(album) || `data:image/svg+xml;base64,${btoa(`
                    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                      <rect width="300" height="200" fill="#f5f5f5"/>
                      <text x="150" y="100" font-family="Arial, sans-serif" font-size="16" fill="#999" text-anchor="middle" dy=".3em">
                        ${album.title}
                      </text>
                      <text x="150" y="130" font-family="Arial, sans-serif" font-size="12" fill="#ccc" text-anchor="middle" dy=".3em">
                        No Cover Image
                      </text>
                    </svg>
                  `)}`}
                  alt={album.title}
                  sx={{ objectFit: "cover" }}
                  onError={(e) => {
                    console.log("Image failed to load for album:", album.title);
                    console.log("Failed image URL:", e.target.src);
                    e.target.src = `data:image/svg+xml;base64,${btoa(`
                      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                        <rect width="300" height="200" fill="#ffebee"/>
                        <text x="150" y="90" font-family="Arial, sans-serif" font-size="14" fill="#f44336" text-anchor="middle" dy=".3em">
                          ${album.title}
                        </text>
                        <text x="150" y="110" font-family="Arial, sans-serif" font-size="12" fill="#f44336" text-anchor="middle" dy=".3em">
                          Image Load Error
                        </text>
                      </svg>
                    `)}`;
                  }}
                />
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {album.title}
                  </Typography>
                  {album.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {album.description.length > 100 
                        ? `${album.description.substring(0, 100)}...`
                        : album.description}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Chip 
                      label={`${album.media?.length || 0} items`} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(album.created)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Album Detail Dialog */}
      <Dialog 
        open={openAlbumDialog} 
        onClose={() => setOpenAlbumDialog(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {selectedAlbum?.title}
          <IconButton onClick={() => setOpenAlbumDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedAlbum?.description && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              {selectedAlbum.description}
            </Typography>
          )}
          
          {selectedAlbum?.media && selectedAlbum.media.length > 0 ? (
            <ImageList variant="masonry" cols={3} gap={8}>
              {selectedAlbum.media.map((media, index) => (
                <ImageListItem 
                  key={media._id || index}
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleMediaClick(media)}
                >
                  <Box sx={{ position: "relative" }}>
                    <img
                      src={getFullImageUrl(media.thumbnail || media.url)}
                      alt={media.title}
                      loading="lazy"
                      style={{ width: "100%", height: "auto", borderRadius: 4 }}
                    />
                    {media.type === 'video' && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          backgroundColor: "rgba(0,0,0,0.7)",
                          borderRadius: "50%",
                          padding: 1,
                        }}
                      >
                        <PlayArrowIcon sx={{ color: "white", fontSize: 32 }} />
                      </Box>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                    {media.title}
                  </Typography>
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              This album is empty
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Media Detail Dialog */}
      <Dialog 
        open={openMediaDialog} 
        onClose={() => setOpenMediaDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {selectedMedia?.title}
          <IconButton onClick={() => setOpenMediaDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedMedia && (
            <Box sx={{ textAlign: "center" }}>
              {selectedMedia.type === 'image' ? (
                <img
                  src={getFullImageUrl(selectedMedia.url)}
                  alt={selectedMedia.title}
                  style={{ maxWidth: "100%", height: "auto", maxHeight: "70vh" }}
                />
              ) : (
                <video
                  src={getFullImageUrl(selectedMedia.url)}
                  controls
                  style={{ maxWidth: "100%", height: "auto", maxHeight: "70vh" }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {selectedMedia.description && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {selectedMedia.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
