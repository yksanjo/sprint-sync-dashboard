FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema (needed for postinstall script)
COPY prisma ./prisma

# Install ALL dependencies (needed for build)
# This will run postinstall which generates Prisma client
RUN npm ci

# Copy rest of source code
COPY . .

# Build TypeScript and web UI
RUN npm run build

# Remove dev dependencies and source files
RUN rm -rf src server web/src tsconfig.json prisma node_modules
RUN npm ci --only=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "dist/server/index.js"]
