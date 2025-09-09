
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { mediaAPI, Media } from '@/services/api';

export type MediaType = 'audio' | 'video';

export interface MediaFile extends Partial<Media> {
  id: string;
  file: string;
  cover?: string;
}

export interface Playlist {
  id: string;
  name: string;
  files: MediaFile[];
}

interface MediaContextType {
  files: MediaFile[];
  playlists: Playlist[];
  currentFile: MediaFile | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  addFile: (file: MediaFile) => void;
  removeFile: (id: string) => void;
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, fileId: string) => void;
  removeFromPlaylist: (playlistId: string, fileId: string) => void;
  playFile: (file: MediaFile) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  togglePlayback: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  updateCurrentTime: (time: number) => void;
  updateDuration: (duration: number) => void;
  isPlayerFullscreen: boolean;
  setPlayerFullscreen: (fullscreen: boolean) => void;
  closePlayer: () => void;
  fetchMedia: () => Promise<void>;
}

export const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentFile, setCurrentFile] = useState<MediaFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerFullscreen, setPlayerFullscreen] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const response = await mediaAPI.getMedia();
      if (response.success && response.data?.media) {
        const mappedFiles: MediaFile[] = response.data.media.map(mediaItem => ({
          ...mediaItem,
          id: mediaItem._id,
          file: mediaItem.url,
          cover: mediaItem.thumbnailUrl || '/placeholder.svg'
        }));
        setFiles(mappedFiles);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);
  
  const addFile = (file: MediaFile) => {
    setFiles(prev => [...prev, file]);
  };
  
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    setPlaylists(prev => prev.map(playlist => ({
      ...playlist,
      files: playlist.files.filter(file => file.id !== id)
    })));
    
    if (currentFile?.id === id) {
      setCurrentFile(null);
      setIsPlaying(false);
    }
  };
  
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      files: []
    };
    
    setPlaylists(prev => [...prev, newPlaylist]);
  };
  
  const addToPlaylist = (playlistId: string, fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        if (!playlist.files.some(f => f.id === fileId)) {
          return {
            ...playlist,
            files: [...playlist.files, file]
          };
        }
      }
      return playlist;
    }));
  };
  
  const removeFromPlaylist = (playlistId: string, fileId: string) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          files: playlist.files.filter(file => file.id !== fileId)
        };
      }
      return playlist;
    }));
  };
  
  const playFile = (file: MediaFile) => {
    setCurrentFile(file);
    setIsPlaying(true);
  };

  const closePlayer = () => {
    setCurrentFile(null);
    setIsPlaying(false);
  };
  
  const pausePlayback = () => {
    setIsPlaying(false);
  };
  
  const resumePlayback = () => {
    if (currentFile) {
      setIsPlaying(true);
    }
  };
  
  const togglePlayback = () => {
    if (currentFile) {
      setIsPlaying(prev => !prev);
    }
  };
  
  const seekTo = (time: number) => {
    setCurrentTime(time);
  };
  
  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };
  
  const findCurrentFileIndex = () => {
    if (!currentFile) return -1;
    return files.findIndex(file => file.id === currentFile.id);
  };
  
  const nextTrack = () => {
    const currentIndex = findCurrentFileIndex();
    if (currentIndex < 0 || currentIndex >= files.length - 1) return;
    
    playFile(files[currentIndex + 1]);
  };
  
  const previousTrack = () => {
    const currentIndex = findCurrentFileIndex();
    if (currentIndex <= 0) return;
    
    playFile(files[currentIndex - 1]);
  };
  
  const updateCurrentTime = (time: number) => {
    setCurrentTime(time);
  };
  
  const updateDuration = (newDuration: number) => {
    setDuration(newDuration);
  };
  
  const value = {
    files,
    playlists,
    currentFile,
    isPlaying,
    volume,
    currentTime,
    duration,
    addFile,
    removeFile,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    playFile,
    pausePlayback,
    resumePlayback,
    togglePlayback,
    seekTo,
    setVolume,
    nextTrack,
    previousTrack,
    updateCurrentTime,
    updateDuration,
    isPlayerFullscreen,
    setPlayerFullscreen,
    closePlayer,
    fetchMedia
  };
  
  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};
