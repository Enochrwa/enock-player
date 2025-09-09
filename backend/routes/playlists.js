const express = require('express');
const Playlist = require('../models/Playlist');
const {
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
} = require('../controllers/playlistController');
const { ProtectRoute, optionalAuth, requirePlaylistPermission } = require('../middleware/auth');

const router = express.Router();

// Middleware to load playlist and check access
const loadPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('collaborators.user', 'username avatar')
      .populate('media.mediaId', 'title artist duration thumbnailUrl type')
      .populate('media.addedBy', 'username avatar');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    // Check if playlist is accessible
    if (!playlist.isPublic && (!req.user || 
        (!playlist.owner._id.equals(req.user._id) && 
         !playlist.collaborators.some(collab => collab.user._id.equals(req.user._id))))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private playlist'
      });
    }

    req.playlist = playlist;
    next();
  } catch (error) {
    console.error('Load playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while loading playlist'
    });
  }
};

router.get('/', optionalAuth, getAllPlaylists);
router.get('/my-playlists', ProtectRoute, getMyPlaylists);
router.get('/trending', getTrendingPlaylists);
router.post('/', ProtectRoute, createPlaylist);

router.get('/:id', optionalAuth, loadPlaylist, getPlaylistById);
router.put('/:id', ProtectRoute, loadPlaylist, requirePlaylistPermission('canEdit'), updatePlaylist);
router.delete('/:id', ProtectRoute, loadPlaylist, deletePlaylist);
router.post('/:id/media', ProtectRoute, loadPlaylist, requirePlaylistPermission('canAdd'), addMediaToPlaylist);
router.delete('/:id/media/:mediaId', ProtectRoute, loadPlaylist, requirePlaylistPermission('canRemove'), removeMediaFromPlaylist);
router.put('/:id/media/:mediaId/position', ProtectRoute, loadPlaylist, requirePlaylistPermission('canReorder'), reorderMediaInPlaylist);
router.post('/:id/collaborators', ProtectRoute, loadPlaylist, addCollaboratorToPlaylist);
router.delete('/:id/collaborators/:userId', ProtectRoute, loadPlaylist, removeCollaboratorFromPlaylist);
router.post('/:id/follow', ProtectRoute, loadPlaylist, toggleFollowPlaylist);
router.post('/:id/play', optionalAuth, loadPlaylist, recordPlaylistPlay);

module.exports = router;
