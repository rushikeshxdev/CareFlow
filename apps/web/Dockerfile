# Stage 1: Dependencies & Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci --workspace=apps/web --workspace=packages/shared

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm run build:shared
RUN npm run build --workspace=apps/web

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

RUN npm ci --only=production --workspace=apps/web

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=apps/web"]
