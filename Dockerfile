# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/authz/package.json    packages/authz/
COPY packages/lib/package.json      packages/lib/
COPY packages/messages/package.json packages/messages/
COPY packages/ui/package.json       packages/ui/

RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_URL=https://staging.app.auctionit.ai/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm build

# ── Stage 2: serve ───────────────────────────────────────────────────────────
FROM caddy:2-alpine
COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 3502
