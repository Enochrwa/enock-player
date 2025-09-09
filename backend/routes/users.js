const express = require('express');
const {
  getUserProfile,
  searchUsers,
  toggleFollowUser,
  getFollowers,
  getFollowing,
  getUserStats,
  getActivityFeed,
  getUserRecommendations,
} = require('../controllers/userController');
const { ProtectRoute, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/profile/:id', optionalAuth, getUserProfile);
router.get('/search', searchUsers);
router.post('/follow/:id', ProtectRoute, toggleFollowUser);
router.get('/followers', ProtectRoute, getFollowers);
router.get('/following', ProtectRoute, getFollowing);
router.get('/stats', ProtectRoute, getUserStats);
router.get('/activity-feed', ProtectRoute, getActivityFeed);
router.get('/recommendations', ProtectRoute, getUserRecommendations);

module.exports = router;
