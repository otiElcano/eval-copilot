# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /build

# Install dependencies first (layer cache)
COPY package.json ./
COPY package-lock.json* ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source and compile
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine

LABEL org.opencontainers.image.title="eval-copilot" \
      org.opencontainers.image.description="Run a prompt N times via GitHub Copilot SDK and generate an HTML report"

# Install runtime dependencies from Alpine community repo:
#   bash        — entrypoint uses bash (Alpine default shell is ash)
#   github-cli  — gh CLI for optional interactive auth
#   docker-cli  — Docker client (socket mounted from host for MCP tools)
#   python3     — required by MCP servers; venv support is built-in on Alpine
#   py3-pip     — pip for MCP server dependencies
RUN apk add --no-cache \
    ca-certificates \
    curl \
    bash \
    github-cli \
    docker-cli \
    python3 \
    py3-pip \
 # Remove Alpine's "externally managed" marker so pip works without --break-system-packages
 && rm -f /usr/lib/python3*/EXTERNALLY-MANAGED

WORKDIR /app

# Force IPv4-first DNS resolution — musl libc (Alpine) defaults to IPv6 first,
# which can cause silent connection stalls when the upstream network does not
# fully support IPv6.  This prevents the Copilot SDK streaming connection from
# hanging indefinitely after MCP tool calls complete.
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Copy compiled app and production dependencies
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY package.json ./

# MCP config adapted for Docker (overridable via volume mount)
COPY docker_alpine/mcp-config.json ./mcp-config.json

COPY docker_alpine/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Install eval-copilot globally (uses "bin" entry from package.json)
RUN npm install -g . --legacy-peer-deps --no-audit --no-fund

# Reports are written to /app/reports — mount a host directory here
RUN mkdir -p /app/reports

ENTRYPOINT ["/entrypoint.sh"]
