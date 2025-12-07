# ==================== Stage 1: Dependencies ====================
FROM node:24-alpine AS deps
# Cài đặt libc6-compat (Bắt buộc cho process.dlopen)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Enable corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# [FIX] Cài thêm sharp (Rất quan trọng cho Next.js Standalone Image)
RUN pnpm add sharp
# Cài các dependencies khác
RUN pnpm install --frozen-lockfile --prod=false

# ==================== Stage 2: Builder ====================
FROM node:24-alpine AS builder

WORKDIR /app

# Copy node_modules từ bước trên
COPY --from=deps /app/node_modules ./node_modules

# [CACHE BUSTING] Biến này thay đổi sẽ ép Docker copy lại code mới
ARG CACHEBUST=1

# Copy source code (Sau khi đã cache dependencies)
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Nhận build args
ARG NEXT_PUBLIC_CRYPTO_KEY
ARG NEXT_PUBLIC_ENABLE_ENCRYPTION
ENV NEXT_PUBLIC_CRYPTO_KEY=$NEXT_PUBLIC_CRYPTO_KEY
ENV NEXT_PUBLIC_ENABLE_ENCRYPTION=$NEXT_PUBLIC_ENABLE_ENCRYPTION

# Build source
RUN corepack enable && pnpm build

# ==================== Stage 3: Runner ====================
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8001
ENV HOSTNAME="0.0.0.0"

# Tạo user để bảo mật
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy file cần thiết (Dùng flag --chown để tối ưu layer)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]