#!/bin/bash

# Sync script to copy files from media to image directory
# This is a temporary fix until all uploads go directly to the correct directories

MEDIA_DIR="c:/Users/kyron/Downloads/Migs and Bia/MigsAndBia/uploads/media"
IMAGE_DIR="c:/Users/kyron/Downloads/Migs and Bia/MigsAndBia/uploads/image"

# Create image directory if it doesn't exist
mkdir -p "$IMAGE_DIR"

# Copy all files from media to image directory
cp "$MEDIA_DIR"/* "$IMAGE_DIR"/ 2>/dev/null || true

echo "Files synced from media to image directory"
