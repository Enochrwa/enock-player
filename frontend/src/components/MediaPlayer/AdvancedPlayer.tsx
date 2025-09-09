import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, Share2, Download, MoreHorizontal,
  Maximize, Minimize, Settings, List, Mic2, Radio,
  Rewind, FastForward, RotateCcw, Volume1, VolumeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Media } from '@/services/api';

interface AdvancedPlayerProps {
  currentMedia: Media | null;
  playlist: Media[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isLiked: boolean;
  isFullscreen: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onLike: () => void;
  onShare: () => void;
  onDownload: () => void;
  onFullscreen: () => void;
  onShowQueue: () => void;
  onShowLyrics: () => void;
  className?: string;
}

const AdvancedPlayer: React.FC<AdvancedPlayerProps> = ({
  currentMedia,
  playlist,
  currentIndex,
  isPlaying,
  volume,
  currentTime,
  duration,
  isShuffled,
  repeatMode,
  isLiked,
  isFullscreen,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onShuffle,
  onRepeat,
  onLike,
  onShare,
  onDownload,
  onFullscreen,
  onShowQueue,
  onShowLyrics,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showWaveform, setShowWaveform] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout>();

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle progress bar click
  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    onSeek(newTime);
  }, [duration, onSeek]);

  // Handle volume slider auto-hide
  const handleVolumeHover = () => {
    setShowVolumeSlider(true);
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
  };

  const handleVolumeLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 2000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          isPlaying ? onPause() : onPlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            onSeek(Math.max(0, currentTime - 10));
          } else {
            onPrevious();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            onSeek(Math.min(duration, currentTime + 10));
          } else {
            onNext();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          onVolumeChange(Math.min(100, volume + 10));
          break;
        case 'ArrowDown':
          e.preventDefault();
          onVolumeChange(Math.max(0, volume - 10));
          break;
        case 'KeyM':
          e.preventDefault();
          onVolumeChange(volume > 0 ? 0 : 50);
          break;
        case 'KeyL':
          e.preventDefault();
          onLike();
          break;
        case 'KeyS':
          e.preventDefault();
          onShuffle();
          break;
        case 'KeyR':
          e.preventDefault();
          onRepeat();
          break;
        case 'KeyF':
          e.preventDefault();
          onFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime, duration, volume, onPlay, onPause, onNext, onPrevious, onSeek, onVolumeChange, onLike, onShuffle, onRepeat, onFullscreen]);

  // Waveform visualization (simplified)
  const renderWaveform = () => {
    if (!currentMedia?.waveformData || !showWaveform) return null;

    const progress = duration > 0 ? currentTime / duration : 0;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="flex items-end gap-0.5 h-8">
          {currentMedia.waveformData.slice(0, 100).map((amplitude, index) => (
            <div
              key={index}
              className={cn(
                "w-1 bg-gradient-to-t transition-all duration-150",
                index / 100 <= progress 
                  ? "from-primary to-primary/60" 
                  : "from-white/20 to-white/10"
              )}
              style={{ height: `${Math.max(2, amplitude * 32)}px` }}
            />
          ))}
        </div>
      </div>
    );
  };

  if (!currentMedia) {
    return (
      <div className={cn(
        "glass-panel border-t border-white/10 p-4",
        className
      )}>
        <div className="flex items-center justify-center text-white/60">
          <Mic2 className="w-6 h-6 mr-2" />
          <span>No media selected</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "glass-panel border-t border-white/10 transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-50 rounded-none" : "relative",
      className
    )}>
      {/* Waveform Background */}
      {renderWaveform()}

      <div className="relative z-10 p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div 
            ref={progressRef}
            className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-150"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: 'translateX(-50%) translateY(-50%)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/60 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Media Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {currentMedia.thumbnailUrl && (
              <div className="relative">
                <img 
                  src={currentMedia.thumbnailUrl} 
                  alt={currentMedia.title}
                  className="w-16 h-16 rounded-lg object-cover shadow-lg"
                />
                {currentMedia.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                      <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white truncate">{currentMedia.title}</h3>
              <p className="text-sm text-white/70 truncate">{currentMedia.artist || 'Unknown Artist'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {currentMedia.type.toUpperCase()}
                </Badge>
                {currentMedia.isExplicit && (
                  <Badge variant="destructive" className="text-xs">E</Badge>
                )}
                {currentMedia.quality && (
                  <Badge variant="secondary" className="text-xs">
                    {currentMedia.quality.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center space-x-2 mx-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={onShuffle}
              className={cn(
                "text-white hover:bg-white/10",
                isShuffled && "text-primary"
              )}
            >
              <Shuffle className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="text-white hover:bg-white/10"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSeek(Math.max(0, currentTime - 10))}
              className="text-white hover:bg-white/10"
            >
              <Rewind className="w-4 h-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={isPlaying ? onPause : onPlay}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-glow"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white fill-white" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSeek(Math.min(duration, currentTime + 10))}
              className="text-white hover:bg-white/10"
            >
              <FastForward className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="text-white hover:bg-white/10"
            >
              <SkipForward className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onRepeat}
              className={cn(
                "text-white hover:bg-white/10",
                repeatMode !== 'none' && "text-primary"
              )}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full text-xs flex items-center justify-center text-white">
                  1
                </span>
              )}
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={onLike}
              className={cn(
                "text-white hover:bg-white/10",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            </Button>

            {/* Volume Control */}
            <div 
              className="relative flex items-center"
              onMouseEnter={handleVolumeHover}
              onMouseLeave={handleVolumeLeave}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onVolumeChange(volume > 0 ? 0 : 50)}
                className="text-white hover:bg-white/10"
              >
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : volume < 30 ? (
                  <VolumeOff className="w-4 h-4" />
                ) : volume < 70 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              
              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-black/80 backdrop-blur-sm rounded-lg">
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => onVolumeChange(value[0])}
                    max={100}
                    step={1}
                    orientation="vertical"
                    className="h-20"
                  />
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onShowQueue}
              className="text-white hover:bg-white/10"
            >
              <List className="w-4 h-4" />
            </Button>

            {currentMedia.lyrics && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onShowLyrics}
                className="text-white hover:bg-white/10"
              >
                <Mic2 className="w-4 h-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowWaveform(!showWaveform)}>
                  <Radio className="w-4 h-4 mr-2" />
                  {showWaveform ? 'Hide' : 'Show'} Waveform
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Playback Speed: {playbackRate}x
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onFullscreen}>
                  {isFullscreen ? (
                    <>
                      <Minimize className="w-4 h-4 mr-2" />
                      Exit Fullscreen
                    </>
                  ) : (
                    <>
                      <Maximize className="w-4 h-4 mr-2" />
                      Fullscreen
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Queue Info */}
        {playlist.length > 1 && (
          <div className="mt-3 text-center text-xs text-white/60">
            {currentIndex + 1} of {playlist.length} • {playlist.length - currentIndex - 1} remaining
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPlayer;

