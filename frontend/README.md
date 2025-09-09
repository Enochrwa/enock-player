# 🎵 Mirage Media Player

**The Next-Generation Media Streaming Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue)](https://www.typescriptlang.org/)

Mirage Media Player is a revolutionary, full-stack media streaming platform that surpasses existing solutions like Spotify and Amazon Music with its cutting-edge design, advanced features, and superior user experience. Built with modern technologies and best practices, it offers a comprehensive solution for media management, streaming, and social interaction.

## ✨ Key Features

### 🎨 **Revolutionary Design**
- **Glassmorphism UI**: Stunning visual effects with backdrop blur and transparency
- **Advanced Animations**: Smooth transitions and micro-interactions
- **Responsive Design**: Perfect experience across all devices
- **Dark Theme**: Modern, eye-friendly interface
- **Gradient Backgrounds**: Dynamic, animated gradient effects

### 🎵 **Advanced Media Player**
- **Professional Controls**: Play, pause, skip, shuffle, repeat with advanced options
- **Waveform Visualization**: Real-time audio waveform display
- **Keyboard Shortcuts**: Full keyboard navigation support (Space, Arrow keys, M, L, S, R, F)
- **Multiple Playback Speeds**: 0.5x to 2x playback speed control
- **Quality Settings**: Adaptive quality from low to lossless
- **Fullscreen Mode**: Immersive media experience
- **Smart Volume Control**: Intelligent volume management with visual feedback

### 📤 **Sophisticated Upload System**
- **Drag & Drop Interface**: Intuitive file upload experience
- **Multi-format Support**: Audio (MP3, WAV, FLAC, AAC, OGG, M4A), Video (MP4, AVI, MOV, WMV, FLV, WebM), Images (JPEG, PNG, GIF, WebP)
- **Metadata Editing**: Comprehensive tag and information management
- **Progress Tracking**: Real-time upload progress with error handling
- **Cloud Storage**: Integrated Cloudinary for reliable media storage
- **Batch Processing**: Upload multiple files simultaneously

### 👥 **Social Features**
- **User Profiles**: Customizable user profiles with statistics
- **Follow System**: Follow favorite artists and users
- **Collaborative Playlists**: Create and share playlists with friends
- **Activity Feeds**: Real-time updates from followed users
- **Sharing**: Share media and playlists across platforms
- **Comments & Likes**: Engage with content and community

### 📊 **Analytics & Insights**
- **Detailed Statistics**: Play counts, likes, shares, and engagement metrics
- **User Analytics**: Personal listening habits and preferences
- **Trending Content**: Discover popular and trending media
- **Recommendation Engine**: AI-powered content suggestions
- **Performance Metrics**: Comprehensive dashboard for creators

## 🏗️ Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with enhanced IDE support
- **Vite**: Lightning-fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Radix UI**: Accessible, unstyled UI components
- **Lucide Icons**: Beautiful, customizable icon library
- **Axios**: Promise-based HTTP client for API communication

### Backend Stack
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: Elegant MongoDB object modeling
- **JWT**: Secure authentication and authorization
- **Multer**: Middleware for handling multipart/form-data
- **Cloudinary**: Cloud-based media management and optimization
- **bcrypt**: Secure password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Enochrwa/mirage-media-scape.git
   cd mirage-media-scape
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Mirage Media Player
   VITE_APP_VERSION=1.0.0
   VITE_ENVIRONMENT=development
   ```
   
   Create `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mirage-media
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:8080
   ```

5. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Start the frontend development server**
   ```bash
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

## 📁 Project Structure

```
mirage-media-scape/
├── backend/                    # Backend application
│   ├── config/                # Configuration files
│   │   └── cloudinary.js      # Cloudinary setup
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # Authentication middleware
│   │   ├── errorHandler.js   # Error handling
│   │   └── notFound.js       # 404 handler
│   ├── models/               # Database models
│   │   ├── User.js           # User schema
│   │   ├── Media.js          # Media schema
│   │   └── Playlist.js       # Playlist schema
│   ├── routes/               # API routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── media.js          # Media management
│   │   ├── playlists.js      # Playlist operations
│   │   ├── upload.js         # File upload handling
│   │   └── users.js          # User management
│   ├── .env                  # Environment variables
│   ├── package.json          # Backend dependencies
│   └── server.js             # Main server file
├── src/                      # Frontend application
│   ├── components/           # React components
│   │   ├── MediaPlayer/      # Media player components
│   │   ├── Upload/           # Upload components
│   │   ├── ui/               # UI components
│   │   └── ...
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   │   └── useAuth.tsx       # Authentication hook
│   ├── pages/                # Page components
│   ├── services/             # API services
│   │   └── api.ts            # API client
│   └── ...
├── public/                   # Static assets
├── .env                      # Frontend environment variables
├── package.json              # Frontend dependencies
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── README.md                 # This file
```

## 🔧 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

#### POST /api/auth/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "identifier": "username or email",
  "password": "string"
}
```

### Media Endpoints

#### GET /api/media
Retrieve media with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `type`: Filter by media type (audio/video)
- `genre`: Filter by genre
- `search`: Search query

#### POST /api/upload/media
Upload media files with metadata.

**Request:** Multipart form data with files and metadata

### Playlist Endpoints

#### GET /api/playlists
Retrieve playlists with filtering options.

#### POST /api/playlists
Create a new playlist.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "isPublic": boolean,
  "isCollaborative": boolean
}
```

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with secure token management
- Password hashing using bcrypt with salt rounds
- Protected routes with middleware validation
- Session management with automatic token refresh

### Data Protection
- Input validation and sanitization
- SQL injection prevention through Mongoose ODM
- XSS protection with proper data encoding
- CORS configuration for secure cross-origin requests

### File Upload Security
- File type validation and restrictions
- File size limits to prevent abuse
- Secure file storage with Cloudinary
- Malware scanning integration ready

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Prepare backend for production**
   ```bash
   cd backend
   npm install --production
   ```

3. **Set production environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-production-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

## 🎯 Competitive Advantages

### Superior to Spotify
- **Advanced UI/UX**: Glassmorphism design vs. standard flat design
- **Better Upload System**: Comprehensive metadata editing vs. limited artist tools
- **Real-time Collaboration**: Live playlist editing vs. basic sharing
- **Waveform Visualization**: Visual audio representation vs. basic progress bar
- **Advanced Player Controls**: Keyboard shortcuts and speed control vs. basic controls

### Superior to Amazon Music
- **Modern Architecture**: React/Node.js vs. legacy systems
- **Social Features**: Built-in community vs. limited social interaction
- **Open Platform**: User uploads vs. restricted catalog
- **Advanced Analytics**: Detailed insights vs. basic statistics
- **Customization**: Extensive personalization vs. limited options

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **React Team** for the amazing React framework
- **Vercel** for the excellent Vite build tool
- **Tailwind Labs** for the utility-first CSS framework
- **MongoDB** for the flexible NoSQL database
- **Cloudinary** for cloud-based media management
- **Radix UI** for accessible component primitives

---

**Built with ❤️ by the Mirage Team**

*Revolutionizing the way we experience media.*

