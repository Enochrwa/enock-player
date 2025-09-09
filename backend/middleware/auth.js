const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated.'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired.'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Middleware to check if user is premium
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.subscription.type === 'free' || !req.user.subscription.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required for this feature.'
    });
  }

  next();
};

// Middleware to check if user owns resource or is admin
const requireOwnership = (resourceField = 'uploadedBy') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // If resource is loaded in previous middleware
    if (req.resource) {
      const ownerId = req.resource[resourceField];
      if (!ownerId || !ownerId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.'
        });
      }
    }

    next();
  };
};

// Middleware to check playlist collaboration permissions
const requirePlaylistPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.playlist) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Owner has all permissions
    if (req.playlist.owner.equals(req.user._id)) {
      return next();
    }

    // Check if user is a collaborator with required permission
    const collaborator = req.playlist.collaborators.find(
      collab => collab.user.equals(req.user._id)
    );

    if (!collaborator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a collaborator on this playlist.'
      });
    }

    if (!collaborator.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You do not have ${permission} permission.`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (jwtError) {
      // Silently ignore token errors for optional auth
    }

    next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    next(); // Continue without authentication
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verify token without middleware
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticate,
  requirePremium,
  requireOwnership,
  requirePlaylistPermission,
  optionalAuth,
  generateToken,
  verifyToken
};

