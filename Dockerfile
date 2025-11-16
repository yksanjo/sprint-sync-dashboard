FROM node:20-alpine

WORKDIR /app

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

# Remove source files and dev dependencies, but keep Prisma schema and generated client
RUN rm -rf src server web/src tsconfig.json
# Remove dev dependencies but keep production deps (including @prisma/client)
# The generated Prisma client in node_modules/@prisma/client will be preserved
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "dist/server/index.js"]
