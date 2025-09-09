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
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/profile/:id', optionalAuth, getUserProfile);
router.get('/search', searchUsers);
router.post('/follow/:id', authenticate, toggleFollowUser);
router.get('/followers', authenticate, getFollowers);
router.get('/following', authenticate, getFollowing);
router.get('/stats', authenticate, getUserStats);
router.get('/activity-feed', authenticate, getActivityFeed);
router.get('/recommendations', authenticate, getUserRecommendations);

module.exports = router;
