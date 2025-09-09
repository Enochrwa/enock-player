const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Upload options for different media types
const uploadOptions = {
  audio: {
    resource_type: 'video', // Cloudinary treats audio as video
    folder: 'mirage/audio',
    allowed_formats: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  },
  video: {
    resource_type: 'video',
    folder: 'mirage/videos',
    allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  },
  image: {
    resource_type: 'image',
    folder: 'mirage/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  },
  avatar: {
    resource_type: 'image',
    folder: 'mirage/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  },
  playlistCover: {
    resource_type: 'image',
    folder: 'mirage/playlist-covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
};

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, options);
    return {
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
        created_at: result.created_at
      }
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return {
      success: true,
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to generate thumbnail for video
const generateVideoThumbnail = async (publicId, options = {}) => {
  try {
    const thumbnailUrl = cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        { start_offset: options.startOffset || '0' },
        { width: options.width || 400, height: options.height || 300, crop: 'fill' },
        { quality: 'auto' },
        { format: 'jpg' }
      ]
    });
    
    return {
      success: true,
      thumbnailUrl
    };
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to get optimized URL
const getOptimizedUrl = (publicId, resourceType = 'image', transformations = []) => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' },
      ...transformations
    ]
  });
};

// Helper function to get streaming URL for audio/video
const getStreamingUrl = (publicId, resourceType = 'video', quality = 'auto') => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    transformation: [
      { quality },
      { streaming_profile: 'hd' }
    ]
  });
};

module.exports = {
  cloudinary,
  uploadOptions,
  uploadToCloudinary,
  deleteFromCloudinary,
  generateVideoThumbnail,
  getOptimizedUrl,
  getStreamingUrl
};

