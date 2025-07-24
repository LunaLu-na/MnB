import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Map request types to directory names
    const typeMapping = {
      'image': 'image',
      'video': 'video', 
      'coverImage': 'image',
      'media': 'media'
    };
    
    const dirName = typeMapping[req.body.type] || 'media';
    const uploadPath = path.join(uploadsDir, dirName);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

// Create multer instance
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

const uploadFile = (req, res) => {
  const uploadSingle = upload.single('file');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        error: err.message || 'File upload failed'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // Generate URL for the uploaded file
    const typeMapping = {
      'image': 'image',
      'video': 'video', 
      'coverImage': 'image',
      'media': 'media'
    };
    
    const dirName = typeMapping[req.body.type] || 'media';
    const fileUrl = `/uploads/${dirName}/${req.file.filename}`;
    
    // Copy file to image directory if it was uploaded to media directory
    // This ensures backward compatibility while transitioning
    if (dirName === 'image' && req.file.destination.includes('media')) {
      const sourceFile = req.file.path;
      const imageDir = path.join(__dirname, '../../uploads/image');
      const targetFile = path.join(imageDir, req.file.filename);
      
      try {
        if (!fs.existsSync(imageDir)) {
          fs.mkdirSync(imageDir, { recursive: true });
        }
        fs.copyFileSync(sourceFile, targetFile);
        console.log('File copied to image directory:', targetFile);
      } catch (copyErr) {
        console.error('Error copying file to image directory:', copyErr);
      }
    }
    
    console.log('File uploaded successfully:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      url: fileUrl,
      type: req.body.type,
      directory: dirName,
      destination: req.file.destination
    });

    res.json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
};

export default { uploadFile };
