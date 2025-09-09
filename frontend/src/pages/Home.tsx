
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useMedia, MediaFile } from '@/contexts/MediaContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowRight, Play, Music, Film, ListMusic, Upload, 
  Clock, Heart, Bookmark, Share2, Shuffle, TrendingUp
} from 'lucide-react';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";

interface MediaCardProps {
  file: MediaFile;
}

const MediaCard: React.FC<MediaCardProps> = ({ file }) => {
  const { playFile } = useMedia();
  
  return (
    <div className="media-card group relative overflow-hidden">
      <div className="aspect-square relative">
        <img 
          src={file.cover || '/placeholder.svg'} 
          alt={file.title} 
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 rounded-lg"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg"></div>
        
        {/* Play button with enhanced styling */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            className="btn-gradient-primary w-14 h-14 rounded-full flex items-center justify-center shadow-glow"
            onClick={() => playFile(file)}
          >
            <Play className="h-6 w-6 ml-0.5" />
          </button>
        </div>
        
        {/* Floating waveform indicator */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-end gap-1 h-6">
            <div className="waveform-bar w-1 h-2"></div>
            <div className="waveform-bar w-1 h-4"></div>
            <div className="waveform-bar w-1 h-3"></div>
            <div className="waveform-bar w-1 h-5"></div>
            <div className="waveform-bar w-1 h-2"></div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <p className="font-semibold truncate text-foreground group-hover:text-gradient-primary transition-all duration-300">{file.title}</p>
        <p className="text-sm text-muted-foreground truncate mt-1">{file.artist || 'Unknown Artist'}</p>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: JSX.Element; label: string; count: number; bg: string }> = ({ icon, label, count, bg }) => {
  return (
    <div className={`stat-card ${bg} text-white relative overflow-hidden`}>
      {/* Floating particles */}
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
          {icon}
        </div>
        <span className="text-3xl font-bold font-display animate-float">{count}</span>
      </div>
      <p className="text-sm font-medium opacity-90">{label}</p>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

const Home = () => {
  const { files, playlists } = useMedia();
  const [activeTab, setActiveTab] = useState("discover");
  
  const audioFiles = files.filter(file => file.type === 'audio');
  const videoFiles = files.filter(file => file.type === 'video');
  
  const recentFiles = [...files].sort((a, b) => 0.5 - Math.random()).slice(0, 6);
  const featuredFiles = [...files].sort((a, b) => 0.5 - Math.random()).slice(0, 4);
  const popularFiles = [...files].sort((a, b) => 0.5 - Math.random()).slice(0, 8);
  const recommendedFiles = [...files].sort((a, b) => 0.5 - Math.random()).slice(0, 4);
  
  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in relative">
        {/* Background particles */}
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold font-display tracking-tight mb-2 text-gradient-primary">
            Welcome to Mirage
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your beautiful all-in-one media player with advanced features and stunning visuals
          </p>
        </div>
        
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<Music className="h-6 w-6" />} 
            label="Audio Tracks" 
            count={audioFiles.length} 
            bg="bg-gradient-to-br from-purple-600/80 to-blue-500/80" 
          />
          <StatCard 
            icon={<Film className="h-6 w-6" />} 
            label="Videos" 
            count={videoFiles.length} 
            bg="bg-gradient-to-br from-pink-600/80 to-orange-500/80" 
          />
          <StatCard 
            icon={<ListMusic className="h-6 w-6" />} 
            label="Playlists" 
            count={playlists.length} 
            bg="bg-gradient-to-br from-cyan-500/80 to-blue-600/80" 
          />
          <StatCard 
            icon={<Clock className="h-6 w-6" />} 
            label="Recently Played" 
            count={Math.min(4, files.length)} 
            bg="bg-gradient-to-br from-emerald-500/80 to-lime-600/80" 
          />
        </div>
        
        {/* Enhanced Tabs */}
        <Tabs defaultValue="discover" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="glass-card grid grid-cols-4 md:w-[500px] mb-8 mx-auto p-1">
            <TabsTrigger value="discover" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Discover
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Trending
            </TabsTrigger>
            <TabsTrigger value="recommended" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              For You
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Recent
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover" className="space-y-8">
            {featuredFiles.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold font-display tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <Bookmark className="h-6 w-6 text-primary" />
                    </div>
                    Featured
                  </h2>
                  <Link to="/library">
                    <button className="btn-gradient-primary gap-2">
                      View Library <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredFiles.map(file => (
                    <MediaCard key={file.id} file={file} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="trending" className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold font-display tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-pink-500/20 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-pink-500" />
                  </div>
                  Popular Now
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {popularFiles.map(file => (
                  <MediaCard key={file.id} file={file} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recommended" className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold font-display tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-xl">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  Recommended For You
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedFiles.map(file => (
                  <MediaCard key={file.id} file={file} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold font-display tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                  Recently Added
                </h2>
                <Link to="/library">
                  <button className="btn-gradient-primary gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {recentFiles.map(file => (
                  <MediaCard key={file.id} file={file} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Enhanced Upload Section */}
        <div className="glass-card text-center p-12 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700/10 via-fuchsia-700/10 to-pink-700/10"></div>
          
          <div className="relative z-10">
            <div className="mb-6">
              <div className="inline-flex p-4 bg-primary/20 rounded-2xl mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-display tracking-tight mb-3 text-gradient-secondary">
                Upload Your Own Media
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Add your music and videos to enjoy them in this beautiful player with advanced features
              </p>
            </div>
            <Link to="/upload">
              <button className="btn-gradient-secondary gap-3 text-lg px-8 py-4">
                <Upload className="h-5 w-5" /> Upload Media
              </button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
