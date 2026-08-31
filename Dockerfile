# --- Base image ---
FROM node:20-slim AS base
WORKDIR /app

# Prisma butuh openssl buat generate client di image slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Aktifkan pnpm via corepack, dipin ke versi 9 karena pnpm versi terbaru
# (10+) butuh Node.js 22+, sedangkan base image ini masih Node 20.
RUN corepack enable && corepack prepare pnpm@9 --activate

# --- Dependencies ---
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build (generate Prisma client) ---
FROM deps AS build
COPY . .
RUN pnpm prisma generate

# --- Runtime ---
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 3000
CMD ["node", "src/server.js"]
