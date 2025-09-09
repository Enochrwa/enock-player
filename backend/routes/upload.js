const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ProtectRoute } = require('../middleware/auth');
const {
  uploadMedia,
  uploadAvatar,
  uploadPlaylistCover,
  getUploadProgress,
} = require('../controllers/uploadController');

const router = express.Router();

console.log('--- Initializing upload routes ---');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp';
    console.log(`[Multer]: Checking/creating destination directory: ${path.resolve(uploadDir)}`);
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`[Multer]: Created destination directory: ${path.resolve(uploadDir)}`);
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error(`[Multer]: Error creating destination directory:`, error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log(`[Multer]: Generating filename: ${filename}`);
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  console.log(`[Multer]: Filtering file: ${file.originalname}, mimetype: ${file.mimetype}`);
  const allowedAudioTypes = (process.env.ALLOWED_AUDIO_TYPES || 'audio/mpeg,audio/wav,audio/flac,audio/aac,audio/ogg').split(',');
  const allowedVideoTypes = (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/avi,video/mov,video/wmv,video/flv').split(',');
  const allowedImageTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');

  const allAllowedTypes = [...allowedAudioTypes, ...allowedVideoTypes, ...allowedImageTypes];

  if (allAllowedTypes.includes(file.mimetype)) {
    console.log(`[Multer]: File type ${file.mimetype} is allowed.`);
    cb(null, true);
  } else {
    console.error(`[Multer]: File type ${file.mimetype} is not allowed.`);
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB default
    files: 5 // Maximum 5 files per request
  }
});

const multerUpload = upload.array('media', 5);

// Middleware to handle multer upload and log errors
const handleUpload = (req, res, next) => {
  console.log('--- Media upload request received ---');
  multerUpload(req, res, (err) => {
    if (err) {
      console.error('--- Multer Error ---', err);
      return res.status(400).json({ success: false, message: 'File upload failed during preprocessing.', error: err.message });
    }
    console.log('--- Multer processing complete ---');
    console.log('Files available in req.files:', req.files);
    if (!req.files || req.files.length === 0) {
        console.warn('Multer processed, but req.files is empty.');
    }
    next();
  });
};

router.post('/media', ProtectRoute, handleUpload, uploadMedia);
router.post('/avatar', ProtectRoute, upload.single('avatar'), uploadAvatar);
router.post('/playlist-cover', ProtectRoute, upload.single('cover'), uploadPlaylistCover);
router.get('/progress/:id', ProtectRoute, getUploadProgress);

module.exports = router;
