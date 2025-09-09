const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, uploadOptions, generateVideoThumbnail } = require('../config/cloudinary');
const Media = require('../models/Media');

// Helper function to determine media type
const getMediaType = (mimetype) => {
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('image/')) return 'image';
  return 'unknown';
};

// Helper function to extract metadata (placeholder - you'd use libraries like ffprobe)
const extractMetadata = async (filePath, mimetype) => {
  // This is a placeholder. In a real application, you'd use libraries like:
  // - ffprobe for audio/video metadata
  // - sharp for image metadata
  // - music-metadata for audio tags
  
  const stats = fs.statSync(filePath);
  
  return {
    fileSize: stats.size,
    // Add more metadata extraction here
    bitrate: null,
    sampleRate: null,
    channels: null,
    codec: null,
    resolution: null,
    frameRate: null,
    duration: null
  };
};

// Helper function to clean up temporary files
const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};

const uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedMedia = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const mediaType = getMediaType(file.mimetype);
        
        if (mediaType === 'image') {
          cleanupTempFile(file.path);
          errors.push({
            filename: file.originalname,
            error: 'Use /api/upload/avatar or /api/upload/playlist-cover for images'
          });
          continue;
        }

        if (mediaType === 'unknown') {
          cleanupTempFile(file.path);
          errors.push({
            filename: file.originalname,
            error: 'Unsupported file type'
          });
          continue;
        }

        // Extract metadata
        const metadata = await extractMetadata(file.path, file.mimetype);

        // Upload to Cloudinary
        const cloudinaryOptions = mediaType === 'audio' ? uploadOptions.audio : uploadOptions.video;
        const uploadResult = await uploadToCloudinary(file.path, {
          ...cloudinaryOptions,
          public_id: `${Date.now()}-${path.parse(file.originalname).name}`
        });

        if (!uploadResult.success) {
          cleanupTempFile(file.path);
          errors.push({
            filename: file.originalname,
            error: uploadResult.error
          });
          continue;
        }

        // Generate thumbnail for videos
        let thumbnailUrl = null;
        if (mediaType === 'video') {
          const thumbnailResult = await generateVideoThumbnail(uploadResult.data.public_id);
          if (thumbnailResult.success) {
            thumbnailUrl = thumbnailResult.thumbnailUrl;
          }
        }

        // Create media document
        const mediaData = {
          title: req.body.title || path.parse(file.originalname).name,
          artist: req.body.artist || '',
          album: req.body.album || '',
          genre: req.body.genre || '',
          year: req.body.year ? parseInt(req.body.year) : null,
          type: mediaType,
          format: uploadResult.data.format,
          fileSize: uploadResult.data.bytes,
          filePath: file.path,
          cloudinaryId: uploadResult.data.public_id,
          url: uploadResult.data.url,
          thumbnailUrl,
          metadata: {
            ...metadata,
            ...uploadResult.data
          },
          description: req.body.description || '',
          tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
          uploadedBy: req.user._id,
          isPublic: req.body.isPublic !== 'false',
          isExplicit: req.body.isExplicit === 'true',
          language: req.body.language || '',
          mood: req.body.mood || null
        };

        const media = new Media(mediaData);
        await media.save();

        uploadedMedia.push(media);

        // Clean up temporary file
        cleanupTempFile(file.path);

      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        cleanupTempFile(file.path);
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    res.status(uploadedMedia.length > 0 ? 201 : 400).json({
      success: uploadedMedia.length > 0,
      message: `${uploadedMedia.length} file(s) uploaded successfully`,
      data: {
        uploadedMedia,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Media upload error:', error);
    
    // Clean up any temporary files
    if (req.files) {
      req.files.forEach(file => cleanupTempFile(file.path));
    }

    res.status(500).json({
      success: false,
      message: 'Server error during media upload'
    });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file uploaded'
      });
    }

    const mediaType = getMediaType(req.file.mimetype);
    if (mediaType !== 'image') {
      cleanupTempFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Avatar must be an image file'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, {
      ...uploadOptions.avatar,
      public_id: `avatar-${req.user._id}-${Date.now()}`
    });

    cleanupTempFile(req.file.path);

    if (!uploadResult.success) {
      return res.status(400).json({
        success: false,
        message: uploadResult.error
      });
    }

    // Update user avatar
    req.user.avatar = uploadResult.data.url;
    await req.user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: uploadResult.data.url
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    if (req.file) {
      cleanupTempFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Server error during avatar upload'
    });
  }
};

const uploadPlaylistCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No cover image uploaded'
      });
    }

    const mediaType = getMediaType(req.file.mimetype);
    if (mediaType !== 'image') {
      cleanupTempFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Cover must be an image file'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, {
      ...uploadOptions.playlistCover,
      public_id: `playlist-cover-${Date.now()}`
    });

    cleanupTempFile(req.file.path);

    if (!uploadResult.success) {
      return res.status(400).json({
        success: false,
        message: uploadResult.error
      });
    }

    res.json({
      success: true,
      message: 'Playlist cover uploaded successfully',
      data: {
        coverUrl: uploadResult.data.url,
        cloudinaryId: uploadResult.data.public_id
      }
    });

  } catch (error) {
    console.error('Playlist cover upload error:', error);
    if (req.file) {
      cleanupTempFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Server error during playlist cover upload'
    });
  }
};

const getUploadProgress = async (req, res) => {
  try {
    // This would be implemented with a job queue system like Bull or Agenda
    // for tracking long-running upload and processing tasks
    
    res.json({
      success: true,
      message: 'Upload progress tracking not yet implemented',
      data: {
        uploadId: req.params.id,
        status: 'completed',
        progress: 100
      }
    });
  } catch (error) {
    console.error('Upload progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking upload progress'
    });
  }
};

module.exports = {
  uploadMedia,
  uploadAvatar,
  uploadPlaylistCover,
  getUploadProgress,
};
