import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, X, Music, Video, Image, File, 
  CheckCircle, AlertCircle, Loader2, 
  Plus, Settings, Tag, Globe, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { uploadAPI } from '@/services/api';

interface FileUpload {
  id: string;
  file: File;
  type: 'audio' | 'video' | 'image';
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  preview?: string;
  metadata: {
    title: string;
    artist: string;
    album: string;
    genre: string;
    year: string;
    description: string;
    tags: string[];
    isPublic: boolean;
    isExplicit: boolean;
    language: string;
    mood: string;
  };
}

interface AdvancedUploadProps {
  onUploadComplete?: (files: FileUpload[]) => void;
  onClose?: () => void;
  className?: string;
}

const AdvancedUpload: React.FC<AdvancedUploadProps> = ({
  onUploadComplete,
  onClose,
  className
}) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supported file types
  const supportedTypes = {
    audio: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/m4a'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'],
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  };

  // Get file type
  const getFileType = (file: File): 'audio' | 'video' | 'image' | 'unknown' => {
    if (supportedTypes.audio.includes(file.type)) return 'audio';
    if (supportedTypes.video.includes(file.type)) return 'video';
    if (supportedTypes.image.includes(file.type)) return 'image';
    return 'unknown';
  };

  // Get file icon
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Music className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'image': return <Image className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  // Create file preview
  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  // Handle file selection
  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: FileUpload[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const type = getFileType(file);

      if (type === 'unknown') {
        continue; // Skip unsupported files
      }

      const preview = await createPreview(file);
      const fileUpload: FileUpload = {
        id: `${Date.now()}-${i}`,
        file,
        type,
        progress: 0,
        status: 'pending',
        preview,
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: '',
          album: '',
          genre: '',
          year: new Date().getFullYear().toString(),
          description: '',
          tags: [],
          isPublic: true,
          isExplicit: false,
          language: 'en',
          mood: ''
        }
      };

      newFiles.push(fileUpload);
    }

    setFiles(prev => [...prev, ...newFiles]);
    if (newFiles.length > 0 && !selectedFileId) {
      setSelectedFileId(newFiles[0].id);
    }
  }, [selectedFileId]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  // File input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  }, [handleFiles]);

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFileId === fileId) {
      const remainingFiles = files.filter(f => f.id !== fileId);
      setSelectedFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
  };

  // Update file metadata
  const updateFileMetadata = (fileId: string, metadata: Partial<FileUpload['metadata']>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, metadata: { ...file.metadata, ...metadata } }
        : file
    ));
  };

  // Add tag
  const addTag = (fileId: string, tag: string) => {
    if (!tag.trim()) return;
    
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { 
            ...file, 
            metadata: { 
              ...file.metadata, 
              tags: [...file.metadata.tags, tag.trim()] 
            } 
          }
        : file
    ));
  };

  // Remove tag
  const removeTag = (fileId: string, tagIndex: number) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { 
            ...file, 
            metadata: { 
              ...file.metadata, 
              tags: file.metadata.tags.filter((_, index) => index !== tagIndex) 
            } 
          }
        : file
    ));
  };

  // Upload files
  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      
      files.forEach((fileUpload, index) => {
        formData.append('media', fileUpload.file);
        
        // Add metadata for each file
        Object.entries(fileUpload.metadata).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formData.append(`${key}[${index}]`, value.join(','));
          } else {
            formData.append(`${key}[${index}]`, value.toString());
          }
        });
      });

      // Update all files to uploading status
      setFiles(prev => prev.map(file => ({ ...file, status: 'uploading' as const })));

      const response = await uploadAPI.uploadMedia(formData, (progress) => {
        setFiles(prev => prev.map(file => ({ ...file, progress })));
      });

      if (response.success && response.data) {
        // Update files with success status
        setFiles(prev => prev.map(file => ({ ...file, status: 'completed' as const, progress: 100 })));
        
        if (onUploadComplete) {
          onUploadComplete(files);
        }

        // Show success message
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 2000);
      } else {
        // Handle errors
        setFiles(prev => prev.map(file => ({ 
          ...file, 
          status: 'error' as const, 
          error: 'Upload failed' 
        })));
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(file => ({ 
        ...file, 
        status: 'error' as const, 
        error: error.message || 'Upload failed' 
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div className={cn("glass-panel rounded-xl p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gradient-primary">Upload Media</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div className="space-y-4">
          {/* Drag and Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
              isDragging 
                ? "border-primary bg-primary/10" 
                : "border-white/20 hover:border-white/40"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-white/60" />
            <h3 className="text-lg font-semibold mb-2">Drop files here</h3>
            <p className="text-white/60 mb-4">
              or click to browse your files
            </p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={[...supportedTypes.audio, ...supportedTypes.video, ...supportedTypes.image].join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Supported Formats */}
          <div className="text-sm text-white/60">
            <p className="font-medium mb-2">Supported formats:</p>
            <div className="space-y-1">
              <p><strong>Audio:</strong> MP3, WAV, FLAC, AAC, OGG, M4A</p>
              <p><strong>Video:</strong> MP4, AVI, MOV, WMV, FLV, WebM</p>
              <p><strong>Images:</strong> JPEG, PNG, GIF, WebP</p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Files ({files.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedFileId === file.id 
                        ? "border-primary bg-primary/10" 
                        : "border-white/10 hover:border-white/20"
                    )}
                    onClick={() => setSelectedFileId(file.id)}
                  >
                    <div className="text-white/60">
                      {getFileIcon(file.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.metadata.title}</p>
                      <p className="text-sm text-white/60 truncate">
                        {(file.file.size / 1024 / 1024).toFixed(1)} MB • {file.type}
                      </p>
                      
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-2" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      {file.status === 'uploading' && (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metadata Editor */}
        {selectedFile && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Edit Metadata
            </h4>

            {selectedFile.preview && (
              <div className="w-32 h-32 mx-auto">
                <img 
                  src={selectedFile.preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={selectedFile.metadata.title}
                  onChange={(e) => updateFileMetadata(selectedFile.id, { title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>

              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={selectedFile.metadata.artist}
                  onChange={(e) => updateFileMetadata(selectedFile.id, { artist: e.target.value })}
                  placeholder="Enter artist name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="album">Album</Label>
                  <Input
                    id="album"
                    value={selectedFile.metadata.album}
                    onChange={(e) => updateFileMetadata(selectedFile.id, { album: e.target.value })}
                    placeholder="Album name"
                  />
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={selectedFile.metadata.year}
                    onChange={(e) => updateFileMetadata(selectedFile.id, { year: e.target.value })}
                    placeholder="2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select
                    value={selectedFile.metadata.genre}
                    onValueChange={(value) => updateFileMetadata(selectedFile.id, { genre: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="hip-hop">Hip Hop</SelectItem>
                      <SelectItem value="electronic">Electronic</SelectItem>
                      <SelectItem value="jazz">Jazz</SelectItem>
                      <SelectItem value="classical">Classical</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                      <SelectItem value="r&b">R&B</SelectItem>
                      <SelectItem value="indie">Indie</SelectItem>
                      <SelectItem value="alternative">Alternative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mood">Mood</Label>
                  <Select
                    value={selectedFile.metadata.mood}
                    onValueChange={(value) => updateFileMetadata(selectedFile.id, { mood: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="romantic">Romantic</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="melancholic">Melancholic</SelectItem>
                      <SelectItem value="uplifting">Uplifting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={selectedFile.metadata.description}
                  onChange={(e) => updateFileMetadata(selectedFile.id, { description: e.target.value })}
                  placeholder="Describe your media..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedFile.metadata.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-4 h-4 p-0 hover:bg-transparent"
                        onClick={() => removeTag(selectedFile.id, index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(selectedFile.id, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedFile.metadata.isPublic ? (
                      <Globe className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <Label htmlFor="isPublic">Public</Label>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={selectedFile.metadata.isPublic}
                    onCheckedChange={(checked) => updateFileMetadata(selectedFile.id, { isPublic: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isExplicit">Explicit Content</Label>
                  <Switch
                    id="isExplicit"
                    checked={selectedFile.metadata.isExplicit}
                    onCheckedChange={(checked) => updateFileMetadata(selectedFile.id, { isExplicit: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-white/10">
          <Button variant="outline" onClick={() => setFiles([])} disabled={isUploading}>
            Clear All
          </Button>
          <Button 
            onClick={uploadFiles} 
            disabled={isUploading || files.length === 0}
            className="min-w-32"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdvancedUpload;

