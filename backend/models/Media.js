const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  artist: {
    type: String,
    trim: true,
    maxlength: [100, 'Artist name cannot exceed 100 characters']
  },
  album: {
    type: String,
    trim: true,
    maxlength: [100, 'Album name cannot exceed 100 characters']
  },
  genre: {
    type: String,
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters']
  },
  year: {
    type: Number,
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  duration: {
    type: Number, // in seconds
    min: [0, 'Duration cannot be negative']
  },
  type: {
    type: String,
    required: [true, 'Media type is required'],
    enum: ['audio', 'video'],
    lowercase: true
  },
  format: {
    type: String,
    required: [true, 'Format is required'],
    lowercase: true
  },
  fileSize: {
    type: Number, // in bytes
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  cloudinaryId: {
    type: String, // Cloudinary public_id
    required: [true, 'Cloudinary ID is required']
  },
  url: {
    type: String,
    required: [true, 'URL is required']
  },
  thumbnailUrl: {
    type: String // For video thumbnails or album art
  },
  waveformData: {
    type: [Number], // Array of amplitude values for audio visualization
    default: []
  },
  metadata: {
    bitrate: Number, // in kbps
    sampleRate: Number, // in Hz
    channels: Number, // 1 for mono, 2 for stereo
    codec: String,
    resolution: {
      width: Number,
      height: Number
    },
    frameRate: Number, // for videos
    aspectRatio: String
  },
  lyrics: {
    type: String,
    maxlength: [10000, 'Lyrics cannot exceed 10000 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isExplicit: {
    type: Boolean,
    default: false
  },
  stats: {
    playCount: {
      type: Number,
      default: 0
    },
    likeCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    lastPlayed: Date
  },
  quality: {
    type: String,
    enum: ['low', 'medium', 'high', 'lossless'],
    default: 'high'
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'energetic', 'calm', 'romantic', 'aggressive', 'melancholic', 'uplifting'],
    lowercase: true
  },
  language: {
    type: String,
    maxlength: [20, 'Language cannot exceed 20 characters']
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: String,
  versions: [{
    quality: String,
    url: String,
    cloudinaryId: String,
    fileSize: Number
  }],
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['producer', 'composer', 'lyricist', 'vocalist', 'instrumentalist'],
      required: true
    }
  }],
  copyright: {
    owner: String,
    year: Number,
    license: {
      type: String,
      enum: ['all-rights-reserved', 'creative-commons', 'public-domain'],
      default: 'all-rights-reserved'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted duration
mediaSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for formatted file size
mediaSchema.virtual('formattedFileSize').get(function() {
  if (!this.fileSize) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = this.fileSize;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
});

// Indexes for better query performance
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ genre: 1 });
mediaSchema.index({ artist: 1 });
mediaSchema.index({ album: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ isPublic: 1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ 'stats.playCount': -1 });
mediaSchema.index({ 'stats.likeCount': -1 });

// Text search index
mediaSchema.index({
  title: 'text',
  artist: 'text',
  album: 'text',
  genre: 'text',
  tags: 'text',
  description: 'text'
});

// Pre-save middleware
mediaSchema.pre('save', function(next) {
  // Ensure tags are unique and lowercase
  if (this.tags) {
    this.tags = [...new Set(this.tags.map(tag => tag.toLowerCase()))];
  }
  next();
});

// Instance methods
mediaSchema.methods.incrementPlayCount = function() {
  this.stats.playCount += 1;
  this.stats.lastPlayed = new Date();
  return this.save();
};

mediaSchema.methods.incrementLikeCount = function() {
  this.stats.likeCount += 1;
  return this.save();
};

mediaSchema.methods.decrementLikeCount = function() {
  this.stats.likeCount = Math.max(0, this.stats.likeCount - 1);
  return this.save();
};

mediaSchema.methods.incrementShareCount = function() {
  this.stats.shareCount += 1;
  return this.save();
};

mediaSchema.methods.incrementDownloadCount = function() {
  this.stats.downloadCount += 1;
  return this.save();
};

// Static methods
mediaSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true, isPublic: true });
};

mediaSchema.statics.findByGenre = function(genre) {
  return this.find({ 
    genre: new RegExp(genre, 'i'), 
    isActive: true, 
    isPublic: true 
  });
};

mediaSchema.statics.findByArtist = function(artist) {
  return this.find({ 
    artist: new RegExp(artist, 'i'), 
    isActive: true, 
    isPublic: true 
  });
};

mediaSchema.statics.searchMedia = function(query, options = {}) {
  const {
    type,
    genre,
    artist,
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  const searchQuery = {
    $text: { $search: query },
    isActive: true,
    isPublic: true
  };

  if (type) searchQuery.type = type;
  if (genre) searchQuery.genre = new RegExp(genre, 'i');
  if (artist) searchQuery.artist = new RegExp(artist, 'i');

  return this.find(searchQuery)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip)
    .populate('uploadedBy', 'username avatar');
};

mediaSchema.statics.getTrending = function(days = 7, limit = 20) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  return this.find({
    isActive: true,
    isPublic: true,
    'stats.lastPlayed': { $gte: dateThreshold }
  })
    .sort({ 'stats.playCount': -1, 'stats.likeCount': -1 })
    .limit(limit)
    .populate('uploadedBy', 'username avatar');
};

mediaSchema.statics.getRecommendations = function(userId, limit = 20) {
  // This is a simple recommendation algorithm
  // In production, you'd want a more sophisticated approach
  return this.aggregate([
    { $match: { isActive: true, isPublic: true, uploadedBy: { $ne: userId } } },
    { $sample: { size: limit } },
    {
      $lookup: {
        from: 'users',
        localField: 'uploadedBy',
        foreignField: '_id',
        as: 'uploadedBy',
        pipeline: [{ $project: { username: 1, avatar: 1 } }]
      }
    },
    { $unwind: '$uploadedBy' }
  ]);
};

module.exports = mongoose.model('Media', mediaSchema);

