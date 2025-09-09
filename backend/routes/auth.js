const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  toggleFavorite,
  addRecent
} = require('../controllers/authController');
const { ProtectRoute } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', ProtectRoute, logout);
router.get('/me', ProtectRoute, getMe);
router.put('/update-profile', ProtectRoute, updateProfile);
router.put('/change-password', ProtectRoute, changePassword);
router.post('/toggle-favorite', ProtectRoute, toggleFavorite);
router.post('/add-recent', ProtectRoute, addRecent);

module.exports = router;
