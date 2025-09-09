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
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/update-profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/toggle-favorite', authenticate, toggleFavorite);
router.post('/add-recent', authenticate, addRecent);

module.exports = router;
