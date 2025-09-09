const express = require('express');
const {
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
  getMediaStats
} = require('../controllers/mediaController');
const { ProtectRoute, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getAllMedia);
router.get('/trending', getTrendingMedia);
router.get('/recommendations', ProtectRoute, getRecommendedMedia);
router.get('/my-uploads', ProtectRoute, getMyUploads);
router.get('/stats/overview', ProtectRoute, getMediaStats);
router.get('/:id', optionalAuth, getMediaById);
router.put('/:id', ProtectRoute, updateMedia);
router.delete('/:id', ProtectRoute, deleteMedia);
router.post('/:id/play', optionalAuth, recordPlay);
router.post('/:id/like', ProtectRoute, toggleLike);
router.post('/:id/share', optionalAuth, recordShare);

module.exports = router;
