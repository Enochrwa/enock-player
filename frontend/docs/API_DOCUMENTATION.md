# 📡 Mirage Media Player - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Authentication Endpoints](#authentication-endpoints)
6. [User Management Endpoints](#user-management-endpoints)
7. [Media Management Endpoints](#media-management-endpoints)
8. [Playlist Management Endpoints](#playlist-management-endpoints)
9. [Upload Endpoints](#upload-endpoints)
10. [Search Endpoints](#search-endpoints)
11. [Analytics Endpoints](#analytics-endpoints)
12. [WebSocket Events](#websocket-events)

## Overview

The Mirage Media Player API is a RESTful API built with Node.js and Express.js. It provides comprehensive endpoints for user management, media streaming, playlist creation, and social features.

**Base URL:** `https://api.mirage-media.com/api`
**Version:** v1.0.0
**Content-Type:** `application/json`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Lifecycle
- **Expiration:** 7 days (configurable)
- **Refresh:** Automatic refresh on valid requests
- **Revocation:** Logout endpoint invalidates tokens

## Error Handling

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated users:** 1000 requests per hour
- **Unauthenticated users:** 100 requests per hour
- **Upload endpoints:** 50 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": null,
      "bio": "",
      "preferences": {
        "theme": "dark",
        "language": "en",
        "autoplay": true,
        "shuffle": false,
        "repeat": "none",
        "volume": 80,
        "quality": "high"
      },
      "stats": {
        "totalPlaytime": 0,
        "songsPlayed": 0,
        "videosWatched": 0,
        "playlistsCreated": 0
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login

Authenticate user and receive access token.

**Request Body:**
```json
{
  "identifier": "johndoe", // username or email
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      // User object (same as register)
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/logout

Logout user and invalidate token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /auth/me

Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      // Complete user object with all fields
    }
  }
}
```

### PUT /auth/update-profile

Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "bio": "Music enthusiast and content creator",
  "preferences": {
    "theme": "light",
    "autoplay": false,
    "volume": 75
  }
}
```

### PUT /auth/change-password

Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmNewPassword": "newPassword456"
}
```

### POST /auth/toggle-favorite

Add or remove media from favorites.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mediaId": "64a1b2c3d4e5f6789012345"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "favorites": ["64a1b2c3d4e5f6789012345", "..."],
    "action": "added" // or "removed"
  }
}
```

## User Management Endpoints

### GET /users/profile/:id

Get user profile by ID.

**Parameters:**
- `id` - User ID

**Query Parameters:**
- `include` - Additional data to include (playlists, media, stats)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "username": "johndoe",
      "avatar": "https://cloudinary.com/avatar.jpg",
      "bio": "Music lover",
      "stats": {
        "totalPlaytime": 15000,
        "songsPlayed": 250,
        "playlistsCreated": 5
      },
      "followers": 150,
      "following": 75
    },
    "playlists": [
      // User's public playlists
    ],
    "media": [
      // User's public media
    ],
    "isFollowing": false
  }
}
```

### GET /users/search

Search for users.

**Query Parameters:**
- `q` - Search query (required)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "username": "johndoe",
        "avatar": "https://cloudinary.com/avatar.jpg",
        "bio": "Music enthusiast",
        "stats": {
          "songsPlayed": 250,
          "playlistsCreated": 5
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### POST /users/follow/:id

Follow or unfollow a user.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - User ID to follow/unfollow

**Response:**
```json
{
  "success": true,
  "data": {
    "following": true,
    "followerCount": 151
  },
  "message": "User followed successfully"
}
```

### GET /users/followers

Get current user's followers.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### GET /users/following

Get users that current user is following.

**Headers:**
```
Authorization: Bearer <token>
```

### GET /users/activity-feed

Get activity feed from followed users.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "type": "media_upload",
        "data": {
          // Media object
        },
        "createdAt": "2024-01-01T12:00:00.000Z"
      },
      {
        "type": "playlist_created",
        "data": {
          // Playlist object
        },
        "createdAt": "2024-01-01T11:30:00.000Z"
      }
    ]
  }
}
```

## Media Management Endpoints

### GET /media

Get media with filtering and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `type` - Filter by type (audio, video)
- `genre` - Filter by genre
- `artist` - Filter by artist
- `search` - Search query
- `sortBy` - Sort field (createdAt, title, playCount)
- `sortOrder` - Sort order (asc, desc)
- `mood` - Filter by mood
- `year` - Filter by year
- `language` - Filter by language

**Response:**
```json
{
  "success": true,
  "data": {
    "media": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "title": "Amazing Song",
        "artist": "Great Artist",
        "album": "Awesome Album",
        "genre": "pop",
        "year": 2024,
        "duration": 180,
        "type": "audio",
        "format": "mp3",
        "url": "https://cloudinary.com/audio.mp3",
        "thumbnailUrl": "https://cloudinary.com/thumb.jpg",
        "uploadedBy": {
          "_id": "64a1b2c3d4e5f6789012346",
          "username": "artist",
          "avatar": "https://cloudinary.com/avatar.jpg"
        },
        "stats": {
          "playCount": 1500,
          "likeCount": 250,
          "shareCount": 50
        },
        "isPublic": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      // Pagination object
    }
  }
}
```

### GET /media/:id

Get specific media by ID.

**Parameters:**
- `id` - Media ID

**Response:**
```json
{
  "success": true,
  "data": {
    "media": {
      // Complete media object with all fields
      "waveformData": [0.1, 0.3, 0.5, 0.2, ...],
      "metadata": {
        "bitrate": 320,
        "sampleRate": 44100,
        "channels": 2,
        "codec": "mp3"
      },
      "lyrics": "Song lyrics here...",
      "description": "Song description",
      "tags": ["pop", "upbeat", "2024"]
    }
  }
}
```

### GET /media/trending

Get trending media.

**Query Parameters:**
- `days` - Time period in days (default: 7)
- `limit` - Number of items (default: 20)
- `type` - Filter by type (audio, video)

### GET /media/recommendations

Get personalized recommendations.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` - Number of recommendations (default: 20)

### PUT /media/:id

Update media information.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Media ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "artist": "Updated Artist",
  "genre": "rock",
  "tags": ["rock", "guitar", "2024"],
  "isPublic": true
}
```

### DELETE /media/:id

Delete media.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Media ID

### POST /media/:id/play

Record a play for analytics.

**Parameters:**
- `id` - Media ID

**Response:**
```json
{
  "success": true,
  "data": {
    "playCount": 1501
  }
}
```

### POST /media/:id/like

Like or unlike media.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Media ID

**Response:**
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likeCount": 251
  }
}
```

### POST /media/:id/share

Record a share for analytics.

**Parameters:**
- `id` - Media ID

**Response:**
```json
{
  "success": true,
  "data": {
    "shareCount": 51
  }
}
```

## Playlist Management Endpoints

### GET /playlists

Get playlists with filtering.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search query
- `genre` - Filter by genre
- `mood` - Filter by mood
- `sortBy` - Sort field
- `sortOrder` - Sort order
- `featured` - Get featured playlists

### GET /playlists/:id

Get specific playlist by ID.

**Parameters:**
- `id` - Playlist ID

**Response:**
```json
{
  "success": true,
  "data": {
    "playlist": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "My Awesome Playlist",
      "description": "Collection of great songs",
      "owner": {
        "_id": "64a1b2c3d4e5f6789012346",
        "username": "johndoe",
        "avatar": "https://cloudinary.com/avatar.jpg"
      },
      "media": [
        {
          "mediaId": {
            // Complete media object
          },
          "addedAt": "2024-01-01T00:00:00.000Z",
          "addedBy": {
            "_id": "64a1b2c3d4e5f6789012346",
            "username": "johndoe"
          },
          "position": 0
        }
      ],
      "coverImage": "https://cloudinary.com/cover.jpg",
      "isPublic": true,
      "isCollaborative": false,
      "stats": {
        "playCount": 500,
        "likeCount": 75,
        "followCount": 25
      },
      "totalDuration": 3600,
      "trackCount": 15,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### POST /playlists

Create a new playlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My New Playlist",
  "description": "A collection of my favorite songs",
  "isPublic": true,
  "isCollaborative": false,
  "coverImage": "https://cloudinary.com/cover.jpg",
  "tags": ["favorites", "2024"],
  "genre": "mixed",
  "mood": "upbeat"
}
```

### PUT /playlists/:id

Update playlist information.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Playlist ID

### DELETE /playlists/:id

Delete playlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Playlist ID

### POST /playlists/:id/media

Add media to playlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Playlist ID

**Request Body:**
```json
{
  "mediaId": "64a1b2c3d4e5f6789012345",
  "position": 5
}
```

### DELETE /playlists/:id/media/:mediaId

Remove media from playlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Playlist ID
- `mediaId` - Media ID

### PUT /playlists/:id/media/:mediaId/position

Reorder media in playlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Playlist ID
- `mediaId` - Media ID

**Request Body:**
```json
{
  "newPosition": 3
}
```

### POST /playlists/:id/collaborators

Add collaborator to playlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Playlist ID

**Request Body:**
```json
{
  "userId": "64a1b2c3d4e5f6789012347",
  "permissions": {
    "canAdd": true,
    "canRemove": false,
    "canReorder": true,
    "canEdit": false
  }
}
```

### POST /playlists/:id/follow

Follow or unfollow playlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Playlist ID

## Upload Endpoints

### POST /upload/media

Upload media files.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `media` - Media files (multiple allowed)
- `title[0]` - Title for first file
- `artist[0]` - Artist for first file
- `album[0]` - Album for first file
- `genre[0]` - Genre for first file
- `year[0]` - Year for first file
- `description[0]` - Description for first file
- `tags[0]` - Tags for first file (comma-separated)
- `isPublic[0]` - Public flag for first file
- `isExplicit[0]` - Explicit flag for first file
- `language[0]` - Language for first file
- `mood[0]` - Mood for first file

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadedMedia": [
      {
        // Complete media object
      }
    ],
    "errors": [
      {
        "filename": "invalid-file.txt",
        "error": "Unsupported file type"
      }
    ]
  }
}
```

### POST /upload/avatar

Upload user avatar.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `avatar` - Image file

**Response:**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cloudinary.com/avatar.jpg"
  }
}
```

### POST /upload/playlist-cover

Upload playlist cover image.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `cover` - Image file

**Response:**
```json
{
  "success": true,
  "data": {
    "coverUrl": "https://cloudinary.com/cover.jpg",
    "cloudinaryId": "playlist_covers/abc123"
  }
}
```

## Search Endpoints

### GET /search

Global search across all content.

**Query Parameters:**
- `q` - Search query (required)
- `type` - Content type (media, playlists, users, all)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "media": [
      // Matching media
    ],
    "playlists": [
      // Matching playlists
    ],
    "users": [
      // Matching users
    ],
    "pagination": {
      // Pagination info
    }
  }
}
```

## Analytics Endpoints

### GET /analytics/overview

Get platform analytics overview.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 10000,
    "totalMedia": 50000,
    "totalPlaylists": 15000,
    "totalPlays": 1000000,
    "activeUsers": 2500,
    "newUsersToday": 50,
    "topGenres": [
      {"genre": "pop", "count": 15000},
      {"genre": "rock", "count": 12000}
    ]
  }
}
```

### GET /analytics/user-stats

Get current user's detailed statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "user": {
        "totalPlaytime": 15000,
        "songsPlayed": 250,
        "videosWatched": 50,
        "playlistsCreated": 5
      },
      "media": {
        "totalMedia": 25,
        "totalPlays": 5000,
        "totalLikes": 500,
        "audioCount": 20,
        "videoCount": 5
      },
      "playlists": {
        "totalPlaylists": 5,
        "totalPlaylistPlays": 1000,
        "totalPlaylistLikes": 100,
        "publicPlaylists": 3,
        "collaborativePlaylists": 1
      },
      "social": {
        "followers": 150,
        "following": 75,
        "favorites": 300
      },
      "topGenres": [
        {"genre": "pop", "count": 10},
        {"genre": "rock", "count": 8}
      ]
    }
  }
}
```

## WebSocket Events

The API supports real-time features through WebSocket connections.

### Connection

```javascript
const socket = io('wss://api.mirage-media.com', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Client to Server

- `join-room` - Join a room for real-time updates
- `leave-room` - Leave a room
- `playlist-update` - Update playlist in real-time
- `typing` - User is typing in chat

#### Server to Client

- `user-online` - User came online
- `user-offline` - User went offline
- `playlist-updated` - Playlist was updated
- `new-follower` - New follower notification
- `media-liked` - Media was liked
- `comment-added` - New comment added

### Example Usage

```javascript
// Join user's personal room
socket.emit('join-room', `user:${userId}`);

// Listen for real-time updates
socket.on('playlist-updated', (data) => {
  console.log('Playlist updated:', data);
});

// Listen for new followers
socket.on('new-follower', (follower) => {
  console.log('New follower:', follower);
});
```

## SDK and Client Libraries

### JavaScript/TypeScript SDK

```bash
npm install @mirage-media/sdk
```

```javascript
import { MirageAPI } from '@mirage-media/sdk';

const api = new MirageAPI({
  baseURL: 'https://api.mirage-media.com/api',
  token: 'your-jwt-token'
});

// Get user profile
const user = await api.users.getProfile('user-id');

// Upload media
const media = await api.upload.media(file, metadata);

// Create playlist
const playlist = await api.playlists.create({
  name: 'My Playlist',
  isPublic: true
});
```

### Python SDK

```bash
pip install mirage-media-sdk
```

```python
from mirage_media import MirageAPI

api = MirageAPI(
    base_url='https://api.mirage-media.com/api',
    token='your-jwt-token'
)

# Get trending media
trending = api.media.get_trending(days=7, limit=20)

# Search users
users = api.users.search(query='john', limit=10)
```

This comprehensive API documentation covers all endpoints, request/response formats, authentication, error handling, and real-time features of the Mirage Media Player API.

