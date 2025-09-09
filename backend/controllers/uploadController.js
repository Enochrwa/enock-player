const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, uploadOptions, generateVideoThumbnail } = require('../config/cloudinary');
const Media = require('../models/Media');

console.log('--- Initializing upload controller ---');

// Helper function to determine media type
const getMediaType = (mimetype) => {
  console.log(`[Controller]: Getting media type for mimetype: ${mimetype}`);
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('image/')) return 'image';
  console.warn(`[Controller]: Unknown media type for mimetype: ${mimetype}`);
  return 'unknown';
};

// Helper function to extract metadata (placeholder)
const extractMetadata = async (filePath, mimetype) => {
    console.log(`[Controller]: Extracting metadata from ${filePath} (mimetype: ${mimetype})`);
  const stats = fs.statSync(filePath);
  return {
    fileSize: stats.size,
    duration: null // Placeholder value
  };
};

// Helper function to clean up temporary files
const cleanupTempFile = (filePath) => {
  console.log(`[Controller]: Cleaning up temporary file: ${filePath}`);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Controller]: Successfully deleted temp file: ${filePath}`);
    } else {
        console.warn(`[Controller]: Temp file not found for cleanup: ${filePath}`);
    }
  } catch (error) {
    console.error(`[Controller]: Error cleaning up temp file ${filePath}:`, error);
  }
};

const uploadMedia = async (req, res) => {
  console.log('--- uploadMedia controller function started ---');
  try {
    console.log('[Controller]: Request body:', req.body);
    if (!req.files || req.files.length === 0) {
      console.error('[Controller]: No files found in request.');
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    console.log(`[Controller]: Received ${req.files.length} file(s) to process.`);
    const uploadedMedia = [];
    const errors = [];

    for (const file of req.files) {
      console.log(`[Controller]: Processing file: ${file.originalname} (temp path: ${file.path})`);
      try {
        const mediaType = getMediaType(file.mimetype);
        
        if (mediaType === 'image' || mediaType === 'unknown') {
          const errorMsg = mediaType === 'image' 
            ? 'Use /api/upload/avatar or /api/upload/playlist-cover for images'
            : 'Unsupported file type';
          console.warn(`[Controller]: Skipping file ${file.originalname}: ${errorMsg}`);
          cleanupTempFile(file.path);
          errors.push({ filename: file.originalname, error: errorMsg });
          continue;
        }

        console.log(`[Controller]: Extracting metadata for ${file.originalname}`);
        const metadata = await extractMetadata(file.path, file.mimetype);
        console.log(`[Controller]: Metadata for ${file.originalname}:`, metadata);

        console.log(`[Controller]: Uploading ${file.originalname} to Cloudinary`);
        const cloudinaryOptions = mediaType === 'audio' ? uploadOptions.audio : uploadOptions.video;
        const uploadResult = await uploadToCloudinary(file.path, {
          ...cloudinaryOptions,
          public_id: `${Date.now()}-${path.parse(file.originalname).name}`
        });

        if (!uploadResult.success) {
          console.error(`[Controller]: Cloudinary upload failed for ${file.originalname}:`, uploadResult.error);
          cleanupTempFile(file.path);
          errors.push({ filename: file.originalname, error: uploadResult.error });
          continue;
        }
        console.log(`[Controller]: Cloudinary upload successful for ${file.originalname}:`, uploadResult.data);

        let thumbnailUrl = null;
        if (mediaType === 'video') {
            console.log(`[Controller]: Generating thumbnail for video ${file.originalname}`);
            const thumbnailResult = await generateVideoThumbnail(uploadResult.data.public_id);
            if (thumbnailResult.success) {
                thumbnailUrl = thumbnailResult.thumbnailUrl;
                console.log(`[Controller]: Thumbnail generated for ${file.originalname}: ${thumbnailUrl}`);
            } else {
                console.warn(`[Controller]: Thumbnail generation failed for ${file.originalname}`);
            }
        }

        console.log(`[Controller]: Creating media document for ${file.originalname}`);
        const mediaData = {
          title: req.body.title || path.parse(file.originalname).name,
          artist: req.body.artist || '',
          album: req.body.album || '',
          genre: req.body.genre || '',
          year: req.body.year ? parseInt(req.body.year) : null,
          type: mediaType,
          format: uploadResult.data.format,
          fileSize: uploadResult.data.bytes,
          duration: uploadResult.data.duration, // Get duration from Cloudinary
          cloudinaryId: uploadResult.data.public_id,
          url: uploadResult.data.url,
          thumbnailUrl,
          metadata: { ...metadata, ...uploadResult.data },
          uploadedBy: req.user._id,
          isPublic: req.body.isPublic !== 'false',
          isExplicit: req.body.isExplicit === 'true',
          language: req.body.language || '',
          mood: req.body.mood || null
        };
        console.log('[Controller]: Media data to be saved:', mediaData);

        const media = new Media(mediaData);
        await media.save();
        console.log(`[Controller]: Media document saved for ${file.originalname} with ID: ${media._id}`);

        uploadedMedia.push(media);
        cleanupTempFile(file.path);

      } catch (error) {
        console.error(`[Controller]: Error processing file ${file.originalname}:`, error);
        cleanupTempFile(file.path);
        errors.push({ filename: file.originalname, error: error.message });
      }
    }

    console.log('[Controller]: Finished processing all files.');
    res.status(uploadedMedia.length > 0 ? 201 : 400).json({
      success: uploadedMedia.length > 0,
      message: `${uploadedMedia.length} file(s) uploaded successfully`,
      data: { uploadedMedia, errors: errors.length > 0 ? errors : undefined }
    });

  } catch (error) {
    console.error('--- Unhandled error in uploadMedia controller ---', error);
    if (req.files) {
      req.files.forEach(file => cleanupTempFile(file.path));
    }
    res.status(500).json({ success: false, message: 'Server error during media upload' });
  }
};

const uploadAvatar = async (req, res) => {
    // Omitting logging for brevity, but would be similar to uploadMedia
    try {
        if (!req.file) { return res.status(400).json({ success: false, message: 'No avatar file uploaded' }); }
        const mediaType = getMediaType(req.file.mimetype);
        if (mediaType !== 'image') {
            cleanupTempFile(req.file.path);
            return res.status(400).json({ success: false, message: 'Avatar must be an image file' });
        }
        const uploadResult = await uploadToCloudinary(req.file.path, { ...uploadOptions.avatar, public_id: `avatar-${req.user._id}-${Date.now()}` });
        cleanupTempFile(req.file.path);
        if (!uploadResult.success) { return res.status(400).json({ success: false, message: uploadResult.error }); }
        req.user.avatar = uploadResult.data.url;
        await req.user.save();
        res.json({ success: true, message: 'Avatar uploaded successfully', data: { avatarUrl: uploadResult.data.url } });
    } catch (error) {
        console.error('Avatar upload error:', error);
        if (req.file) { cleanupTempFile(req.file.path); }
        res.status(500).json({ success: false, message: 'Server error during avatar upload' });
    }
};

const uploadPlaylistCover = async (req, res) => {
    // Omitting logging for brevity
    try {
        if (!req.file) { return res.status(400).json({ success: false, message: 'No cover image uploaded' }); }
        const mediaType = getMediaType(req.file.mimetype);
        if (mediaType !== 'image') {
            cleanupTempFile(req.file.path);
            return res.status(400).json({ success: false, message: 'Cover must be an image file' });
        }
        const uploadResult = await uploadToCloudinary(req.file.path, { ...uploadOptions.playlistCover, public_id: `playlist-cover-${Date.now()}` });
        cleanupTempFile(req.file.path);
        if (!uploadResult.success) { return res.status(400).json({ success: false, message: uploadResult.error }); }
        res.json({ success: true, message: 'Playlist cover uploaded successfully', data: { coverUrl: uploadResult.data.url, cloudinaryId: uploadResult.data.public_id } });
    } catch (error) {
        console.error('Playlist cover upload error:', error);
        if (req.file) { cleanupTempFile(req.file.path); }
        res.status(500).json({ success: false, message: 'Server error during playlist cover upload' });
    }
};

const getUploadProgress = async (req, res) => {
    res.json({ success: true, message: 'Not implemented' });
};

module.exports = {
  uploadMedia,
  uploadAvatar,
  uploadPlaylistCover,
  getUploadProgress,
};
