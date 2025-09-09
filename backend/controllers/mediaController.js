const Media = require('../models/Media');

// @desc    Get all public media with filtering and pagination
const getAllMedia = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      genre,
      artist,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      mood,
      year,
      language
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {
      isActive: true,
      isPublic: true
    };

    if (type) query.type = type;
    if (genre) query.genre = new RegExp(genre, 'i');
    if (artist) query.artist = new RegExp(artist, 'i');
    if (mood) query.mood = mood;
    if (year) query.year = parseInt(year);
    if (language) query.language = new RegExp(language, 'i');

    // Handle search
    let mediaQuery;
    if (search) {
      mediaQuery = Media.find({
        ...query,
        $text: { $search: search }
      });
    } else {
      mediaQuery = Media.find(query);
    }

    // Apply sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const media = await mediaQuery
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .populate('uploadedBy', 'username avatar')
      .lean();

    // Get total count for pagination
    const total = await Media.countDocuments(query);

    res.json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching media'
    });
  }
};

// @desc    Get trending media
const getTrendingMedia = async (req, res) => {
  try {
    const { days = 7, limit = 20, type } = req.query;

    const media = await Media.getTrending(parseInt(days), parseInt(limit));

    // Filter by type if specified
    const filteredMedia = type ? media.filter(item => item.type === type) : media;

    res.json({
      success: true,
      data: {
        media: filteredMedia
      }
    });
  } catch (error) {
    console.error('Get trending media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending media'
    });
  }
};

// @desc    Get personalized recommendations
const getRecommendedMedia = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const media = await Media.getRecommendations(req.user._id, parseInt(limit));

    res.json({
      success: true,
      data: {
        media
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recommendations'
    });
  }
};

// @desc    Get current user's uploaded media
const getMyUploads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {
      uploadedBy: req.user._id,
      isActive: true
    };

    if (type) query.type = type;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const media = await Media.find(query)
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .lean();

    const total = await Media.countDocuments(query);

    res.json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your uploads'
    });
  }
};

// @desc    Get single media by ID
const getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('uploadedBy', 'username avatar bio')
      .populate('collaborators.user', 'username avatar');

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if media is public or user owns it
    if (!media.isPublic && (!req.user || !media.uploadedBy._id.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private media'
      });
    }

    res.json({
      success: true,
      data: {
        media
      }
    });
  } catch (error) {
    console.error('Get media by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching media'
    });
  }
};

// @desc    Update media metadata
const updateMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check ownership
    if (!media.uploadedBy.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this media.'
      });
    }

    const {
      title,
      artist,
      album,
      genre,
      year,
      description,
      tags,
      isPublic,
      isExplicit,
      language,
      mood,
      lyrics
    } = req.body;

    // Update fields
    if (title !== undefined) media.title = title;
    if (artist !== undefined) media.artist = artist;
    if (album !== undefined) media.album = album;
    if (genre !== undefined) media.genre = genre;
    if (year !== undefined) media.year = parseInt(year);
    if (description !== undefined) media.description = description;
    if (tags !== undefined) media.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    if (isPublic !== undefined) media.isPublic = isPublic;
    if (isExplicit !== undefined) media.isExplicit = isExplicit;
    if (language !== undefined) media.language = language;
    if (mood !== undefined) media.mood = mood;
    if (lyrics !== undefined) media.lyrics = lyrics;

    await media.save();

    res.json({
      success: true,
      message: 'Media updated successfully',
      data: {
        media
      }
    });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating media'
    });
  }
};

// @desc    Delete media (soft delete)
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check ownership
    if (!media.uploadedBy.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this media.'
      });
    }

    // Soft delete
    media.isActive = false;
    await media.save();

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting media'
    });
  }
};

// @desc    Increment play count and add to recently played
const recordPlay = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if media is accessible
    if (!media.isPublic && (!req.user || !media.uploadedBy.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private media'
      });
    }

    // Increment play count
    await media.incrementPlayCount();

    // Add to user's recently played if authenticated
    if (req.user) {
      await req.user.addToRecentlyPlayed(media._id);
      
      // Update user stats
      req.user.stats.totalPlaytime += media.duration || 0;
      if (media.type === 'audio') {
        req.user.stats.songsPlayed += 1;
      } else if (media.type === 'video') {
        req.user.stats.videosWatched += 1;
      }
      await req.user.save();
    }

    res.json({
      success: true,
      message: 'Play recorded successfully',
      data: {
        playCount: media.stats.playCount
      }
    });
  } catch (error) {
    console.error('Record play error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording play'
    });
  }
};

// @desc    Toggle like on media
const toggleLike = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if media is accessible
    if (!media.isPublic && !media.uploadedBy.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private media'
      });
    }

    // Toggle favorite in user's favorites
    const wasLiked = req.user.favorites.includes(media._id);
    await req.user.toggleFavorite(media._id);

    // Update media like count
    if (wasLiked) {
      await media.decrementLikeCount();
    } else {
      await media.incrementLikeCount();
    }

    res.json({
      success: true,
      message: wasLiked ? 'Media unliked' : 'Media liked',
      data: {
        liked: !wasLiked,
        likeCount: media.stats.likeCount
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling like'
    });
  }
};

// @desc    Increment share count
const recordShare = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if media is accessible
    if (!media.isPublic && (!req.user || !media.uploadedBy.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private media'
      });
    }

    await media.incrementShareCount();

    res.json({
      success: true,
      message: 'Share recorded successfully',
      data: {
        shareCount: media.stats.shareCount
      }
    });
  } catch (error) {
    console.error('Record share error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording share'
    });
  }
};

// @desc    Get media statistics overview
const getMediaStats = async (req, res) => {
  try {
    const totalMedia = await Media.countDocuments({
      uploadedBy: req.user._id,
      isActive: true
    });

    const audioCount = await Media.countDocuments({
      uploadedBy: req.user._id,
      type: 'audio',
      isActive: true
    });

    const videoCount = await Media.countDocuments({
      uploadedBy: req.user._id,
      type: 'video',
      isActive: true
    });

    const totalPlays = await Media.aggregate([
      {
        $match: {
          uploadedBy: req.user._id,
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalPlays: { $sum: '$stats.playCount' },
          totalLikes: { $sum: '$stats.likeCount' },
          totalShares: { $sum: '$stats.shareCount' }
        }
      }
    ]);

    const stats = totalPlays[0] || { totalPlays: 0, totalLikes: 0, totalShares: 0 };

    res.json({
      success: true,
      data: {
        totalMedia,
        audioCount,
        videoCount,
        ...stats
      }
    });
  } catch (error) {
    console.error('Get media stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching media statistics'
    });
  }
};

module.exports = {
  getAllMedia,
  getTrendingMedia,
  getRecommendedMedia,
  getMyUploads,
  getMediaById,
  updateMedia,
  deleteMedia,
  recordPlay,
  toggleLike,
  recordShare,
  getMediaStats,
};
