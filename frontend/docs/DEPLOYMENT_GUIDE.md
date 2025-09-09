# 🚀 Mirage Media Player - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment Options](#cloud-deployment-options)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [SSL/HTTPS Configuration](#ssl-https-configuration)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying Mirage Media Player, ensure you have the following:

- **Node.js** (v18.0.0 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Cloudinary account** for media storage
- **Domain name** (for production deployment)
- **SSL certificate** (for HTTPS)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Enochrwa/mirage-media-scape.git
cd mirage-media-scape
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Configuration

Create `.env` files for both frontend and backend:

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Mirage Media Player
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

**Backend `backend/.env`:**
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

### 4. Start Services

```bash
# Start MongoDB
sudo systemctl start mongod

# Start backend server (in one terminal)
cd backend
npm run dev

# Start frontend server (in another terminal)
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:8080
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## Production Deployment

### 1. Build the Frontend

```bash
npm run build
```

This creates a `dist` directory with optimized production files.

### 2. Prepare Backend for Production

```bash
cd backend
npm install --production
```

### 3. Production Environment Variables

Update your production environment variables:

**Frontend Production `.env`:**
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=Mirage Media Player
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

**Backend Production `backend/.env`:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-host:27017/mirage-media
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com
```

### 4. Start Production Server

```bash
cd backend
npm start
```

## Docker Deployment

### 1. Create Dockerfile for Backend

**`backend/Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]
```

### 2. Create Dockerfile for Frontend

**`Dockerfile`:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Create Docker Compose

**`docker-compose.yml`:**
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:5000/api

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/mirage-media
      - JWT_SECRET=your-jwt-secret
      - CLOUDINARY_CLOUD_NAME=your-cloud-name
      - CLOUDINARY_API_KEY=your-api-key
      - CLOUDINARY_API_SECRET=your-api-secret
    volumes:
      - ./backend:/app
      - /app/node_modules

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=mirage-media

volumes:
  mongodb_data:
```

### 4. Deploy with Docker Compose

```bash
docker-compose up -d
```

## Cloud Deployment Options

### 1. Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**`vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2. Heroku (Backend)

1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git

**`backend/Procfile`:**
```
web: npm start
```

**`backend/package.json` scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 3. AWS EC2

1. Launch an EC2 instance with Ubuntu
2. Install Node.js, MongoDB, and PM2
3. Clone repository and configure environment
4. Use PM2 for process management

**PM2 Configuration (`ecosystem.config.js`):**
```javascript
module.exports = {
  apps: [
    {
      name: 'mirage-backend',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
```

### 4. DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build and run commands
3. Set environment variables
4. Deploy with automatic scaling

## Environment Configuration

### Development Environment

```env
# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_ENVIRONMENT=development

# Backend
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mirage-media-dev
JWT_SECRET=dev-secret-key
CORS_ORIGIN=http://localhost:8080
```

### Staging Environment

```env
# Frontend
VITE_API_URL=https://staging-api.mirage-media.com/api
VITE_ENVIRONMENT=staging

# Backend
NODE_ENV=staging
PORT=5000
MONGODB_URI=mongodb://staging-db.mirage-media.com:27017/mirage-media-staging
JWT_SECRET=staging-secret-key
CORS_ORIGIN=https://staging.mirage-media.com
```

### Production Environment

```env
# Frontend
VITE_API_URL=https://api.mirage-media.com/api
VITE_ENVIRONMENT=production

# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://prod-db.mirage-media.com:27017/mirage-media
JWT_SECRET=production-secret-key
CORS_ORIGIN=https://mirage-media.com
```

## Database Setup

### MongoDB Atlas (Cloud)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Configure network access and database users
4. Get connection string and update MONGODB_URI

### Self-hosted MongoDB

1. Install MongoDB on your server
2. Configure authentication and security
3. Set up regular backups
4. Monitor performance and logs

**MongoDB Configuration (`/etc/mongod.conf`):**
```yaml
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled
```

## SSL/HTTPS Configuration

### Using Let's Encrypt with Nginx

1. Install Certbot
2. Obtain SSL certificate
3. Configure Nginx with SSL

**Nginx Configuration (`/etc/nginx/sites-available/mirage-media`):**
```nginx
server {
    listen 80;
    server_name mirage-media.com www.mirage-media.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mirage-media.com www.mirage-media.com;

    ssl_certificate /etc/letsencrypt/live/mirage-media.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mirage-media.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/mirage-media/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring and Logging

### Application Monitoring

1. **PM2 Monitoring:**
```bash
pm2 monit
pm2 logs
pm2 status
```

2. **Health Checks:**
```bash
# Backend health check
curl https://api.mirage-media.com/health

# Frontend health check
curl https://mirage-media.com
```

### Log Management

1. **Backend Logs:**
```javascript
// In server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

2. **Nginx Logs:**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Performance Monitoring

1. **New Relic or DataDog** for application performance monitoring
2. **MongoDB Compass** for database monitoring
3. **Cloudinary Analytics** for media delivery metrics

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check CORS_ORIGIN environment variable
   - Verify frontend and backend URLs match

2. **Database Connection Issues:**
   - Verify MongoDB is running
   - Check MONGODB_URI format
   - Ensure network connectivity

3. **File Upload Issues:**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure proper MIME type handling

4. **Authentication Issues:**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure HTTPS in production

### Debug Commands

```bash
# Check application status
pm2 status

# View application logs
pm2 logs mirage-backend

# Check MongoDB status
sudo systemctl status mongod

# Check Nginx status
sudo systemctl status nginx

# Test API endpoints
curl -X GET https://api.mirage-media.com/health
curl -X POST https://api.mirage-media.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"password"}'
```

### Performance Optimization

1. **Frontend Optimization:**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement code splitting
   - Optimize images and media

2. **Backend Optimization:**
   - Use connection pooling for MongoDB
   - Implement caching with Redis
   - Use clustering for multiple CPU cores
   - Optimize database queries

3. **Database Optimization:**
   - Create proper indexes
   - Use aggregation pipelines
   - Implement data archiving
   - Monitor query performance

## Security Considerations

### Production Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure JWT secrets
- [ ] Configure proper CORS origins
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Backup data regularly

### Security Headers

```javascript
// In Express.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/mirage-media" --out=/backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/mirage-media" /backup/20240101/mirage-media
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"
DB_NAME="mirage-media"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/$DATE.tar.gz -C $BACKUP_DIR $DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$DATE.tar.gz"
```

### Cron Job for Automated Backups

```bash
# Add to crontab (crontab -e)
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

This comprehensive deployment guide covers all aspects of deploying the Mirage Media Player from local development to production environments, including Docker containerization, cloud deployment options, security considerations, and monitoring setup.

