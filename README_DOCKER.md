# Mediscope UI - Docker Setup

This directory contains the React/TypeScript frontend for the DTcare medical assistant platform, containerized with Docker.

## Architecture

- **Build Stage**: Node.js 18 Alpine for building the Vite/React application
- **Production Stage**: Nginx Alpine for serving static files
- **Port**: Exposed on port 3003 (mapped to container port 80)
- **Network**: Connects to `dtcare-network` to communicate with backend

## Files

- `Dockerfile`: Multi-stage build for production-optimized image
- `docker-compose.yml`: Container orchestration configuration
- `nginx.conf`: Nginx reverse proxy configuration
- `.dockerignore`: Excludes unnecessary files from Docker build

## Building and Running

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker compose up --build

# Run in detached mode
docker compose up -d --build

# Stop the container
docker compose down
```

### Option 2: Using Docker directly

```bash
# Build the image
docker build -t mediscope-ui .

# Run the container
docker run -p 3003:80 --name mediscope-ui --network dtcare-network mediscope-ui
```

## Prerequisites

1. **Backend must be running**: The core_ai backend must be running and connected to `dtcare-network`
2. **Network setup**: Run backend first to create the shared network:
   ```bash
   cd ../core_ai
   docker compose up -d
   ```

## Accessing the Application

Once running, access the UI at:
- **Local**: http://localhost:3003
- **Container**: http://mediscope-ui (within Docker network)

## API Proxy

Nginx proxies API requests to the backend:
- Frontend: `/api/*` → Backend: `http://coreai:8001/*`

This eliminates CORS issues and simplifies deployment.

## Environment Variables

The container runs in production mode:
- `NODE_ENV=production`

## Development vs Production

### Development (without Docker)
```bash
npm install
npm run dev
# Runs on http://localhost:3003 with Vite dev server
```

### Production (with Docker)
```bash
docker compose up --build
# Runs on http://localhost:3003 with Nginx
```

## Troubleshooting

### UI container can't reach backend
```bash
# Check if both containers are on the same network
docker network inspect dtcare-network

# Verify backend is accessible
docker exec mediscope-ui ping coreai
```

### Build errors
```bash
# Clear Docker cache
docker builder prune

# Rebuild from scratch
docker compose build --no-cache
```

### Port already in use
```bash
# Stop conflicting service
docker compose down

# Or change port in docker-compose.yml
ports:
  - "3004:80"  # Use different port
```

## Performance Optimizations

- **Multi-stage build**: Smaller production image (~25MB)
- **Gzip compression**: Enabled for all text assets
- **Static asset caching**: 1-year cache headers for immutable assets
- **SPA routing**: Nginx serves index.html for all routes
