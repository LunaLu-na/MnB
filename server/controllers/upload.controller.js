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
    
    console.log('Upload destination:', {
      requestType: req.body.type,
      mappedDir: dirName,
      fullPath: uploadPath
    });
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      try {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log('Created upload directory:', uploadPath);
      } catch (err) {
        console.error('Error creating upload directory:', err);
        return cb(err);
      }
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random suffix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${baseName}-${uniqueSuffix}${ext}`;
    
    console.log('Generated filename:', {
      original: file.originalname,
      generated: filename
    });
    
    cb(null, filename);
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

    console.log('File upload details:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      destination: req.file.destination,
      path: req.file.path,
      type: req.body.type
    });

    // Generate URL for the uploaded file based on actual destination
    const relativePath = path.relative(path.join(__dirname, '../../'), req.file.path);
    const normalizedPath = relativePath.replace(/\\/g, '/'); // Normalize path separators
    const fileUrl = `/${normalizedPath}`;

    console.log('Generated file URL:', fileUrl);

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
