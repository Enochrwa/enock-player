const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/logout',
        'GET /api/auth/me',
        'PUT /api/auth/update-profile'
      ],
      media: [
        'GET /api/media',
        'GET /api/media/:id',
        'POST /api/media',
        'PUT /api/media/:id',
        'DELETE /api/media/:id'
      ],
      playlists: [
        'GET /api/playlists',
        'GET /api/playlists/:id',
        'POST /api/playlists',
        'PUT /api/playlists/:id',
        'DELETE /api/playlists/:id'
      ],
      upload: [
        'POST /api/upload/media',
        'POST /api/upload/avatar',
        'POST /api/upload/playlist-cover'
      ]
    }
  });
};

module.exports = notFound;

