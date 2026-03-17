# ── Build stage ──────────────────────────────────────────────────────────────
# node:22-bookworm-slim includes Node.js 22 with node:sqlite built-in support
FROM node:22-bookworm-slim AS builder

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
FROM node:22-bookworm-slim

LABEL org.opencontainers.image.title="eval-copilot" \
      org.opencontainers.image.description="Run a prompt N times via GitHub Copilot SDK and generate an HTML report"

# 1) Base tools needed to add external repos
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# 2) gh CLI repo
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] \
        https://cli.github.com/packages stable main" \
        > /etc/apt/sources.list.d/github-cli.list

# 3) Docker CLI repo (client only — socket is mounted from host)
RUN curl -fsSL https://download.docker.com/linux/debian/gpg \
        | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
        https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
        > /etc/apt/sources.list.d/docker.list

# 4) Install gh + docker-ce-cli and Python tooling (for MCP servers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gh \
    docker-ce-cli \
    python3 \
    python3-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy compiled app and production dependencies
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY package.json ./

# MCP config adapted for Docker (overridable via volume mount)
COPY docker/mcp-config.json ./mcp-config.json

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Install eval-copilot globally (uses "bin" entry from package.json)
RUN npm install -g . --legacy-peer-deps --no-audit --no-fund

# Reports are written to /app/reports — mount a host directory here
RUN mkdir -p /app/reports

ENTRYPOINT ["/entrypoint.sh"]
