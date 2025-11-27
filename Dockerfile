FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .


# Build the application
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start the server pointing to the build output directory (dist)
# -s: Single Page Application mode (rewrites 404s to index.html)
# -l: Listen on port
CMD ["serve", "-s", "dist", "-l", "8080"]