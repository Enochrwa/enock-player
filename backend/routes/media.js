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
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getAllMedia);
router.get('/trending', getTrendingMedia);
router.get('/recommendations', authenticate, getRecommendedMedia);
router.get('/my-uploads', authenticate, getMyUploads);
router.get('/stats/overview', authenticate, getMediaStats);
router.get('/:id', optionalAuth, getMediaById);
router.put('/:id', authenticate, updateMedia);
router.delete('/:id', authenticate, deleteMedia);
router.post('/:id/play', optionalAuth, recordPlay);
router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/share', optionalAuth, recordShare);

module.exports = router;
