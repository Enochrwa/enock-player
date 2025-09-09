const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
    },
    language: {
      type: String,
      default: 'en'
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    shuffle: {
      type: Boolean,
      default: false
    },
    repeat: {
      type: String,
      enum: ['none', 'one', 'all'],
      default: 'none'
    },
    volume: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    quality: {
      type: String,
      enum: ['low', 'medium', 'high', 'lossless'],
      default: 'high'
    }
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'family'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    totalPlaytime: {
      type: Number,
      default: 0 // in seconds
    },
    songsPlayed: {
      type: Number,
      default: 0
    },
    videosWatched: {
      type: Number,
      default: 0
    },
    playlistsCreated: {
      type: Number,
      default: 0
    }
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  recentlyPlayed: [{
    media: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    },
    playedAt: {
      type: Date,
      default: Date.now
    },
    playCount: {
      type: Number,
      default: 1
    }
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's playlists
userSchema.virtual('playlists', {
  ref: 'Playlist',
  localField: '_id',
  foreignField: 'owner'
});

// Virtual for user's uploaded media
userSchema.virtual('uploadedMedia', {
  ref: 'Media',
  localField: '_id',
  foreignField: 'uploadedBy'
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'recentlyPlayed.playedAt': -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to add to recently played
userSchema.methods.addToRecentlyPlayed = function(mediaId) {
  // Remove if already exists
  this.recentlyPlayed = this.recentlyPlayed.filter(
    item => !item.media.equals(mediaId)
  );
  
  // Add to beginning
  this.recentlyPlayed.unshift({
    media: mediaId,
    playedAt: new Date()
  });
  
  // Keep only last 50 items
  if (this.recentlyPlayed.length > 50) {
    this.recentlyPlayed = this.recentlyPlayed.slice(0, 50);
  }
  
  return this.save();
};

// Instance method to toggle favorite
userSchema.methods.toggleFavorite = function(mediaId) {
  const index = this.favorites.indexOf(mediaId);
  if (index > -1) {
    this.favorites.splice(index, 1);
  } else {
    this.favorites.push(mediaId);
  }
  return this.save();
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

module.exports = mongoose.model('User', userSchema);

