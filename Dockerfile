FROM node:20-slim

WORKDIR /app

# Install OpenSSL (for Prisma) and other build dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Copy Prisma schema (needed for prisma generate)
COPY prisma ./prisma

# Install ALL dependencies (needed for build)
RUN npm ci

# Generate Prisma Client (MUST be before build)
RUN npx prisma generate

# Copy rest of source code
COPY . .

# Build TypeScript and web UI
RUN npm run build

# Verify web build completed
RUN echo "=== Verifying web build ===" && \
    ls -la web/dist && \
    ls -la web/dist/assets && \
    cat web/dist/index.html | head -5 && \
    echo "=== Web build verified ==="

# Remove source files and dev dependencies, but keep Prisma schema, generated client, and web/dist
RUN rm -rf src server web/src web/node_modules tsconfig.json
# Keep web/dist for serving static files
# Remove dev dependencies but keep production deps (including @prisma/client)
# The generated Prisma client in node_modules/@prisma/client will be preserved
RUN npm prune --production

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

USER nodejs

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "dist/server/index.js"]
