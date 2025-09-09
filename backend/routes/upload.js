const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const {
  uploadMedia,
  uploadAvatar,
  uploadPlaylistCover,
  getUploadProgress,
} = require('../controllers/uploadController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedAudioTypes = (process.env.ALLOWED_AUDIO_TYPES || 'audio/mpeg,audio/wav,audio/flac,audio/aac,audio/ogg').split(',');
  const allowedVideoTypes = (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/avi,video/mov,video/wmv,video/flv').split(',');
  const allowedImageTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');

  const allAllowedTypes = [...allowedAudioTypes, ...allowedVideoTypes, ...allowedImageTypes];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
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

router.post('/media', authenticate, upload.array('media', 5), uploadMedia);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.post('/playlist-cover', authenticate, upload.single('cover'), uploadPlaylistCover);
router.get('/progress/:id', authenticate, getUploadProgress);

module.exports = router;
