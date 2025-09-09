const User = require('../models/User');
const Media = require('../models/Media');
const Playlist = require('../models/Playlist');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')
      .populate('favorites', 'title artist thumbnailUrl duration type')
      .populate('recentlyPlayed.media', 'title artist thumbnailUrl duration type');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Get user's public playlists
    const playlists = await Playlist.find({
      owner: user._id,
      isPublic: true,
      isActive: true
    })
      .select('name description coverImage trackCount stats createdAt')
      .limit(10)
      .sort({ createdAt: -1 });

    // Get user's public media
    const media = await Media.find({
      uploadedBy: user._id,
      isPublic: true,
      isActive: true
    })
      .select('title artist album thumbnailUrl duration type stats createdAt')
      .limit(10)
      .sort({ createdAt: -1 });

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      isFollowing = req.user.following.includes(user._id);
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          // Hide sensitive information for other users
          ...(req.user && req.user._id.equals(user._id) ? {} : {
            email: undefined,
            preferences: undefined,
            recentlyPlayed: undefined
          })
        },
        playlists,
        media,
        isFollowing
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find({
      $or: [
        { username: new RegExp(q, 'i') },
        { bio: new RegExp(q, 'i') }
      ],
      isActive: true
    })
      .select('username avatar bio stats followers following createdAt')
      .limit(limitNum)
      .skip(skip)
      .sort({ 'stats.songsPlayed': -1, 'stats.playlistsCreated': -1 });

    const total = await User.countDocuments({
      $or: [
        { username: new RegExp(q, 'i') },
        { bio: new RegExp(q, 'i') }
      ],
      isActive: true
    });

    res.json({
      success: true,
      data: {
        users,
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
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
};

const toggleFollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (req.user._id.equals(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!targetUser.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow deactivated user'
      });
    }

    const isFollowing = req.user.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      req.user.following.pull(targetUserId);
      targetUser.followers.pull(req.user._id);
    } else {
      // Follow
      req.user.following.push(targetUserId);
      targetUser.followers.push(req.user._id);
    }

    await req.user.save();
    await targetUser.save();

    res.json({
      success: true,
      message: isFollowing ? 'User unfollowed' : 'User followed',
      data: {
        following: !isFollowing,
        followerCount: targetUser.followers.length
      }
    });
  } catch (error) {
    console.error('Toggle follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling user follow'
    });
  }
};

const getFollowers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'followers',
        select: 'username avatar bio stats createdAt',
        options: {
          limit: limitNum,
          skip: skip,
          sort: { createdAt: -1 }
        }
      });

    const total = user.followers.length;

    res.json({
      success: true,
      data: {
        followers: user.followers,
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
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching followers'
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'following',
        select: 'username avatar bio stats createdAt',
        options: {
          limit: limitNum,
          skip: skip,
          sort: { createdAt: -1 }
        }
      });

    const total = user.following.length;

    res.json({
      success: true,
      data: {
        following: user.following,
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
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching following'
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    const user = req.user;

    // Get media stats
    const mediaStats = await Media.aggregate([
      {
        $match: {
          uploadedBy: user._id,
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalMedia: { $sum: 1 },
          totalPlays: { $sum: '$stats.playCount' },
          totalLikes: { $sum: '$stats.likeCount' },
          totalShares: { $sum: '$stats.shareCount' },
          audioCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'audio'] }, 1, 0]
            }
          },
          videoCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'video'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get playlist stats
    const playlistStats = await Playlist.aggregate([
      {
        $match: {
          owner: user._id,
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalPlaylists: { $sum: 1 },
          totalPlaylistPlays: { $sum: '$stats.playCount' },
          totalPlaylistLikes: { $sum: '$stats.likeCount' },
          totalPlaylistFollows: { $sum: '$stats.followCount' },
          publicPlaylists: {
            $sum: {
              $cond: ['$isPublic', 1, 0]
            }
          },
          collaborativePlaylists: {
            $sum: {
              $cond: ['$isCollaborative', 1, 0]
            }
          }
        }
      }
    ]);

    // Get top genres from user's media
    const topGenres = await Media.aggregate([
      {
        $match: {
          uploadedBy: user._id,
          isActive: true,
          genre: { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
          totalPlays: { $sum: '$stats.playCount' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const stats = {
      user: user.stats,
      media: mediaStats[0] || {
        totalMedia: 0,
        totalPlays: 0,
        totalLikes: 0,
        totalShares: 0,
        audioCount: 0,
        videoCount: 0
      },
      playlists: playlistStats[0] || {
        totalPlaylists: 0,
        totalPlaylistPlays: 0,
        totalPlaylistLikes: 0,
        totalPlaylistFollows: 0,
        publicPlaylists: 0,
        collaborativePlaylists: 0
      },
      social: {
        followers: user.followers.length,
        following: user.following.length,
        favorites: user.favorites.length
      },
      topGenres
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
};

const getActivityFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get recent activity from followed users
    const followingIds = req.user.following;

    // Get recent media uploads from followed users
    const recentMedia = await Media.find({
      uploadedBy: { $in: followingIds },
      isPublic: true,
      isActive: true
    })
      .select('title artist thumbnailUrl duration type uploadedBy createdAt')
      .populate('uploadedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Get recent public playlists from followed users
    const recentPlaylists = await Playlist.find({
      owner: { $in: followingIds },
      isPublic: true,
      isActive: true
    })
      .select('name description coverImage trackCount owner createdAt')
      .populate('owner', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Combine and sort activities
    const activities = [
      ...recentMedia.map(media => ({
        type: 'media_upload',
        data: media,
        createdAt: media.createdAt
      })),
      ...recentPlaylists.map(playlist => ({
        type: 'playlist_created',
        data: playlist,
        createdAt: playlist.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
     .slice(0, limitNum);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: pageNum,
          itemsPerPage: limitNum,
          hasNextPage: activities.length === limitNum,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity feed'
    });
  }
};

const getUserRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const limitNum = parseInt(limit);

    // Get users that current user is not following
    const recommendations = await User.find({
      _id: { 
        $ne: req.user._id,
        $nin: req.user.following
      },
      isActive: true
    })
      .select('username avatar bio stats')
      .sort({ 
        'stats.songsPlayed': -1, 
        'stats.playlistsCreated': -1,
        'followers.length': -1 
      })
      .limit(limitNum);

    res.json({
      success: true,
      data: {
        recommendations
      }
    });
  } catch (error) {
    console.error('Get user recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user recommendations'
    });
  }
};

module.exports = {
  getUserProfile,
  searchUsers,
  toggleFollowUser,
  getFollowers,
  getFollowing,
  getUserStats,
  getActivityFeed,
  getUserRecommendations,
};
