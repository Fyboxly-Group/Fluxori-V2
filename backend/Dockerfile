FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Create production image
FROM node:20-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy built assets and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 8080

# Set user to non-root
USER node

# Start the application
CMD ["node", "dist/server.js"]