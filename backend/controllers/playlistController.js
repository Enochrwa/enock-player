const Playlist = require('../models/Playlist');
const Media = require('../models/Media');

const getAllPlaylists = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      genre,
      mood,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured = false
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let playlists;

    if (featured === 'true') {
      playlists = await Playlist.findFeatured(limitNum);
    } else if (search) {
      playlists = await Playlist.searchPlaylists(search, {
        limit: limitNum,
        skip,
        sortBy,
        sortOrder: sortOrder === 'desc' ? -1 : 1
      });
    } else {
      const options = {
        limit: limitNum,
        skip,
        sortBy,
        sortOrder: sortOrder === 'desc' ? -1 : 1
      };

      playlists = await Playlist.findPublic(options);
    }

    // Apply additional filters
    if (genre) {
      playlists = playlists.filter(playlist => 
        playlist.genre && playlist.genre.toLowerCase().includes(genre.toLowerCase())
      );
    }

    if (mood) {
      playlists = playlists.filter(playlist => playlist.mood === mood);
    }

    // Get total count for pagination (simplified for filtered results)
    const total = playlists.length;

    res.json({
      success: true,
      data: {
        playlists,
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
    console.error('Get playlists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching playlists'
    });
  }
};

const getMyPlaylists = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const playlists = await Playlist.find({
      owner: req.user._id,
      isActive: true
    })
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .populate('media.mediaId', 'title artist duration thumbnailUrl type')
      .lean();

    const total = await Playlist.countDocuments({
      owner: req.user._id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        playlists,
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
    console.error('Get my playlists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your playlists'
    });
  }
};

const getTrendingPlaylists = async (req, res) => {
  try {
    const { days = 7, limit = 20 } = req.query;

    const playlists = await Playlist.getTrending(parseInt(days), parseInt(limit));

    res.json({
      success: true,
      data: {
        playlists
      }
    });
  } catch (error) {
    console.error('Get trending playlists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending playlists'
    });
  }
};

const getPlaylistById = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        playlist: req.playlist
      }
    });
  } catch (error) {
    console.error('Get playlist by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching playlist'
    });
  }
};

const createPlaylist = async (req, res) => {
  try {
    const {
      name,
      description,
      isPublic = false,
      isCollaborative = false,
      coverImage,
      tags,
      genre,
      mood
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Playlist name is required'
      });
    }

    const playlist = new Playlist({
      name,
      description,
      owner: req.user._id,
      isPublic,
      isCollaborative,
      coverImage,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      genre,
      mood
    });

    await playlist.save();

    // Update user stats
    req.user.stats.playlistsCreated += 1;
    await req.user.save();

    // Populate the response
    await playlist.populate('owner', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Playlist created successfully',
      data: {
        playlist
      }
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating playlist'
    });
  }
};

const updatePlaylist = async (req, res) => {
  try {
    const {
      name,
      description,
      isPublic,
      isCollaborative,
      coverImage,
      tags,
      genre,
      mood
    } = req.body;

    const playlist = req.playlist;

    // Update fields
    if (name !== undefined) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (isCollaborative !== undefined) playlist.isCollaborative = isCollaborative;
    if (coverImage !== undefined) playlist.coverImage = coverImage;
    if (tags !== undefined) playlist.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    if (genre !== undefined) playlist.genre = genre;
    if (mood !== undefined) playlist.mood = mood;

    await playlist.save();

    res.json({
      success: true,
      message: 'Playlist updated successfully',
      data: {
        playlist
      }
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating playlist'
    });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const playlist = req.playlist;

    // Only owner can delete
    if (!playlist.owner._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the playlist owner can delete it'
      });
    }

    // Soft delete
    playlist.isActive = false;
    await playlist.save();

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting playlist'
    });
  }
};

const addMediaToPlaylist = async (req, res) => {
  try {
    const { mediaId, position } = req.body;

    if (!mediaId) {
      return res.status(400).json({
        success: false,
        message: 'Media ID is required'
      });
    }

    // Check if media exists and is accessible
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    if (!media.isPublic && !media.uploadedBy.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot add private media to playlist'
      });
    }

    await req.playlist.addMedia(mediaId, req.user._id, position);

    // Populate the updated playlist
    await req.playlist.populate('media.mediaId', 'title artist duration thumbnailUrl type');
    await req.playlist.populate('media.addedBy', 'username avatar');

    res.json({
      success: true,
      message: 'Media added to playlist successfully',
      data: {
        playlist: req.playlist
      }
    });
  } catch (error) {
    console.error('Add media to playlist error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while adding media to playlist'
    });
  }
};

const removeMediaFromPlaylist = async (req, res) => {
  try {
    await req.playlist.removeMedia(req.params.mediaId);

    res.json({
      success: true,
      message: 'Media removed from playlist successfully'
    });
  } catch (error) {
    console.error('Remove media from playlist error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while removing media from playlist'
    });
  }
};

const reorderMediaInPlaylist = async (req, res) => {
  try {
    const { newPosition } = req.body;

    if (newPosition === undefined || newPosition < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid new position is required'
      });
    }

    await req.playlist.reorderMedia(req.params.mediaId, newPosition);

    res.json({
      success: true,
      message: 'Media reordered successfully'
    });
  } catch (error) {
    console.error('Reorder media error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while reordering media'
    });
  }
};

const addCollaboratorToPlaylist = async (req, res) => {
  try {
    const playlist = req.playlist;

    // Only owner can add collaborators
    if (!playlist.owner._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the playlist owner can add collaborators'
      });
    }

    const { userId, permissions } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await playlist.addCollaborator(userId, permissions);

    // Populate the updated playlist
    await playlist.populate('collaborators.user', 'username avatar');

    res.json({
      success: true,
      message: 'Collaborator added successfully',
      data: {
        collaborators: playlist.collaborators
      }
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while adding collaborator'
    });
  }
};

const removeCollaboratorFromPlaylist = async (req, res) => {
  try {
    const playlist = req.playlist;

    // Only owner can remove collaborators
    if (!playlist.owner._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the playlist owner can remove collaborators'
      });
    }

    await playlist.removeCollaborator(req.params.userId);

    res.json({
      success: true,
      message: 'Collaborator removed successfully'
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while removing collaborator'
    });
  }
};

const toggleFollowPlaylist = async (req, res) => {
  try {
    const playlist = req.playlist;

    // Can't follow your own playlist
    if (playlist.owner._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow your own playlist'
      });
    }

    const wasFollowing = playlist.followers.includes(req.user._id);
    await playlist.toggleFollow(req.user._id);

    res.json({
      success: true,
      message: wasFollowing ? 'Playlist unfollowed' : 'Playlist followed',
      data: {
        following: !wasFollowing,
        followCount: playlist.stats.followCount
      }
    });
  } catch (error) {
    console.error('Toggle follow playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling playlist follow'
    });
  }
};

const recordPlaylistPlay = async (req, res) => {
  try {
    await req.playlist.incrementPlayCount();

    res.json({
      success: true,
      message: 'Playlist play recorded successfully',
      data: {
        playCount: req.playlist.stats.playCount
      }
    });
  } catch (error) {
    console.error('Record playlist play error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording playlist play'
    });
  }
};

module.exports = {
  getAllPlaylists,
  getMyPlaylists,
  getTrendingPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addMediaToPlaylist,
  removeMediaFromPlaylist,
  reorderMediaInPlaylist,
  addCollaboratorToPlaylist,
  removeCollaboratorFromPlaylist,
  toggleFollowPlaylist,
  recordPlaylistPlay,
};
