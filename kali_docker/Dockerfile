# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder

WORKDIR /build
COPY package.json ./
COPY package-lock.json* ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── Runtime stage — Kali Linux ────────────────────────────────────────────────
FROM kalilinux/kali-rolling

LABEL org.opencontainers.image.title="eval-copilot-kali" \
      org.opencontainers.image.description="eval-copilot running on Kali Linux"

# 1) Base tools for APT repo setup
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg lsb-release \
 && rm -rf /var/lib/apt/lists/*

# 2) Node.js 22 via NodeSource (official Debian-compatible, same ABI as builder)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/*

# 3) gh CLI APT repo
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] \
        https://cli.github.com/packages stable main" \
        > /etc/apt/sources.list.d/github-cli.list

# 4) Docker CE CLI APT repo (bookworm — same Debian base as Kali)
RUN curl -fsSL https://download.docker.com/linux/debian/gpg \
        | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
        https://download.docker.com/linux/debian bookworm stable" \
        > /etc/apt/sources.list.d/docker.list

# 5) Install gh + docker-ce-cli (no Python in this image)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gh docker-ce-cli \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only the compiled output and production deps from builder
COPY --from=builder /build/dist         ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY package.json ./
COPY kali_docker/entrypoint.sh   /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Install eval-copilot globally so `eval-copilot` is on $PATH
RUN npm install -g . --legacy-peer-deps --no-audit --no-fund

RUN mkdir -p /app/reports

ENTRYPOINT ["/entrypoint.sh"]
