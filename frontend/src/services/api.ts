import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // No need to set auth token from local storage, cookies are used
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    autoplay: boolean;
    shuffle: boolean;
    repeat: 'none' | 'one' | 'all';
    volume: number;
    quality: 'low' | 'medium' | 'high' | 'lossless';
  };
  stats: {
    totalPlaytime: number;
    songsPlayed: number;
    videosWatched: number;
    playlistsCreated: number;
  };
  favorites: string[];
  recentlyPlayed: Array<{
    media: Media;
    playedAt: string;
    playCount: number;
  }>;
  following: string[];
  followers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  _id: string;
  title: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  duration: number;
  type: 'audio' | 'video';
  format: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  waveformData: number[];
  metadata: {
    bitrate?: number;
    sampleRate?: number;
    channels?: number;
    codec?: string;
    resolution?: {
      width: number;
      height: number;
    };
    frameRate?: number;
    aspectRatio?: string;
  };
  lyrics?: string;
  description?: string;
  tags: string[];
  uploadedBy: {
    _id: string;
    username: string;
    avatar?: string;
  };
  isPublic: boolean;
  isExplicit: boolean;
  stats: {
    playCount: number;
    likeCount: number;
    shareCount: number;
    downloadCount: number;
    lastPlayed?: string;
  };
  quality: 'low' | 'medium' | 'high' | 'lossless';
  mood?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  owner: {
    _id: string;
    username: string;
    avatar?: string;
  };
  media: Array<{
    mediaId: Media;
    addedAt: string;
    addedBy: {
      _id: string;
      username: string;
      avatar?: string;
    };
    position: number;
  }>;
  coverImage?: string;
  isPublic: boolean;
  isCollaborative: boolean;
  collaborators: Array<{
    user: {
      _id: string;
      username: string;
      avatar?: string;
    };
    permissions: {
      canAdd: boolean;
      canRemove: boolean;
      canReorder: boolean;
      canEdit: boolean;
    };
    addedAt: string;
  }>;
  followers: string[];
  tags: string[];
  genre?: string;
  mood?: string;
  stats: {
    playCount: number;
    likeCount: number;
    shareCount: number;
    followCount: number;
    lastPlayed?: string;
  };
  totalDuration: number;
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Auth API
export const authAPI = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: {
    identifier: string;
    password: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put('/auth/update-profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<ApiResponse<null>> => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  toggleFavorite: async (mediaId: string): Promise<ApiResponse<{ favorites: string[] }>> => {
    const response = await api.post('/auth/toggle-favorite', { mediaId });
    return response.data;
  },

  addToRecent: async (mediaId: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/add-recent', { mediaId });
    return response.data;
  },
};

// Media API
export const mediaAPI = {
  getMedia: async (params?: {
    page?: number;
    limit?: number;
    type?: 'audio' | 'video';
    genre?: string;
    artist?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    mood?: string;
    year?: number;
    language?: string;
  }): Promise<ApiResponse<{ media: Media[] }>> => {
    const response = await api.get('/media', { params });
    return response.data;
  },

  getMediaById: async (id: string): Promise<ApiResponse<{ media: Media }>> => {
    const response = await api.get(`/media/${id}`);
    return response.data;
  },

  getTrending: async (params?: {
    days?: number;
    limit?: number;
    type?: 'audio' | 'video';
  }): Promise<ApiResponse<{ media: Media[] }>> => {
    const response = await api.get('/media/trending', { params });
    return response.data;
  },

  getRecommendations: async (params?: {
    limit?: number;
  }): Promise<ApiResponse<{ media: Media[] }>> => {
    const response = await api.get('/media/recommendations', { params });
    return response.data;
  },

  getMyUploads: async (params?: {
    page?: number;
    limit?: number;
    type?: 'audio' | 'video';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ media: Media[] }>> => {
    const response = await api.get('/media/my-uploads', { params });
    return response.data;
  },

  updateMedia: async (id: string, mediaData: Partial<Media>): Promise<ApiResponse<{ media: Media }>> => {
    const response = await api.put(`/media/${id}`, mediaData);
    return response.data;
  },

  deleteMedia: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/media/${id}`);
    return response.data;
  },

  recordPlay: async (id: string): Promise<ApiResponse<{ playCount: number }>> => {
    const response = await api.post(`/media/${id}/play`);
    return response.data;
  },

  toggleLike: async (id: string): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> => {
    const response = await api.post(`/media/${id}/like`);
    return response.data;
  },

  recordShare: async (id: string): Promise<ApiResponse<{ shareCount: number }>> => {
    const response = await api.post(`/media/${id}/share`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<{
    totalMedia: number;
    audioCount: number;
    videoCount: number;
    totalPlays: number;
    totalLikes: number;
    totalShares: number;
  }>> => {
    const response = await api.get('/media/stats/overview');
    return response.data;
  },
};

// Playlist API
export const playlistAPI = {
  getPlaylists: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
    mood?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    featured?: boolean;
  }): Promise<ApiResponse<{ playlists: Playlist[] }>> => {
    const response = await api.get('/playlists', { params });
    return response.data;
  },

  getPlaylistById: async (id: string): Promise<ApiResponse<{ playlist: Playlist }>> => {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  getMyPlaylists: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ playlists: Playlist[] }>> => {
    const response = await api.get('/playlists/my-playlists', { params });
    return response.data;
  },

  getTrending: async (params?: {
    days?: number;
    limit?: number;
  }): Promise<ApiResponse<{ playlists: Playlist[] }>> => {
    const response = await api.get('/playlists/trending', { params });
    return response.data;
  },

  createPlaylist: async (playlistData: {
    name: string;
    description?: string;
    isPublic?: boolean;
    isCollaborative?: boolean;
    coverImage?: string;
    tags?: string[];
    genre?: string;
    mood?: string;
  }): Promise<ApiResponse<{ playlist: Playlist }>> => {
    const response = await api.post('/playlists', playlistData);
    return response.data;
  },

  updatePlaylist: async (id: string, playlistData: Partial<Playlist>): Promise<ApiResponse<{ playlist: Playlist }>> => {
    const response = await api.put(`/playlists/${id}`, playlistData);
    return response.data;
  },

  deletePlaylist: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },

  addMedia: async (id: string, mediaData: {
    mediaId: string;
    position?: number;
  }): Promise<ApiResponse<{ playlist: Playlist }>> => {
    const response = await api.post(`/playlists/${id}/media`, mediaData);
    return response.data;
  },

  removeMedia: async (id: string, mediaId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/playlists/${id}/media/${mediaId}`);
    return response.data;
  },

  reorderMedia: async (id: string, mediaId: string, newPosition: number): Promise<ApiResponse<null>> => {
    const response = await api.put(`/playlists/${id}/media/${mediaId}/position`, { newPosition });
    return response.data;
  },

  addCollaborator: async (id: string, collaboratorData: {
    userId: string;
    permissions?: {
      canAdd?: boolean;
      canRemove?: boolean;
      canReorder?: boolean;
      canEdit?: boolean;
    };
  }): Promise<ApiResponse<{ collaborators: Playlist['collaborators'] }>> => {
    const response = await api.post(`/playlists/${id}/collaborators`, collaboratorData);
    return response.data;
  },

  removeCollaborator: async (id: string, userId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/playlists/${id}/collaborators/${userId}`);
    return response.data;
  },

  toggleFollow: async (id: string): Promise<ApiResponse<{ following: boolean; followCount: number }>> => {
    const response = await api.post(`/playlists/${id}/follow`);
    return response.data;
  },

  recordPlay: async (id: string): Promise<ApiResponse<{ playCount: number }>> => {
    const response = await api.post(`/playlists/${id}/play`);
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadMedia: async (formData: FormData, onProgress?: (progress: number) => void): Promise<ApiResponse<{
    uploadedMedia: Media[];
    errors?: Array<{ filename: string; error: string }>;
  }>> => {
    const response = await api.post('/upload/media', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  uploadAvatar: async (formData: FormData): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const response = await api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadPlaylistCover: async (formData: FormData): Promise<ApiResponse<{
    coverUrl: string;
    cloudinaryId: string;
  }>> => {
    const response = await api.post('/upload/playlist-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUploadProgress: async (uploadId: string): Promise<ApiResponse<{
    uploadId: string;
    status: string;
    progress: number;
  }>> => {
    const response = await api.get(`/upload/progress/${uploadId}`);
    return response.data;
  },
};

// User API
export const userAPI = {
  getUserProfile: async (id: string): Promise<ApiResponse<{
    user: User;
    playlists: Playlist[];
    media: Media[];
    isFollowing: boolean;
  }>> => {
    const response = await api.get(`/users/profile/${id}`);
    return response.data;
  },

  searchUsers: async (params: {
    q: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ users: User[] }>> => {
    const response = await api.get('/users/search', { params });
    return response.data;
  },

  toggleFollow: async (id: string): Promise<ApiResponse<{
    following: boolean;
    followerCount: number;
  }>> => {
    const response = await api.post(`/users/follow/${id}`);
    return response.data;
  },

  getFollowers: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ followers: User[] }>> => {
    const response = await api.get('/users/followers', { params });
    return response.data;
  },

  getFollowing: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ following: User[] }>> => {
    const response = await api.get('/users/following', { params });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<{
    stats: {
      user: User['stats'];
      media: any;
      playlists: any;
      social: any;
      topGenres: any[];
    };
  }>> => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  getActivityFeed: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    activities: Array<{
      type: 'media_upload' | 'playlist_created';
      data: Media | Playlist;
      createdAt: string;
    }>;
  }>> => {
    const response = await api.get('/users/activity-feed', { params });
    return response.data;
  },

  getRecommendations: async (params?: {
    limit?: number;
  }): Promise<ApiResponse<{ recommendations: User[] }>> => {
    const response = await api.get('/users/recommendations', { params });
    return response.data;
  },
};

export default api;

