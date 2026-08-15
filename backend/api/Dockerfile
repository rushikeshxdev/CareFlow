# Stage 1: Build
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY backend/api/package*.json ./backend/api/
COPY packages/shared/package*.json ./packages/shared/
COPY prisma ./prisma/

RUN npm ci --workspace=backend/api --workspace=packages/shared

# Copy source files
COPY packages/shared ./packages/shared
COPY backend/api ./backend/api

# Build shared package, generate Prisma client, build NestJS API
RUN npm run build:shared
RUN npx prisma generate
RUN npm run build --workspace=backend/api

# Stage 2: Production Execution
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY backend/api/package*.json ./backend/api/
COPY prisma ./prisma/

RUN npm ci --only=production --workspace=backend/api
RUN npx prisma generate

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/backend/api/dist ./backend/api/dist

EXPOSE 3001

CMD ["node", "backend/api/dist/src/main.js"]