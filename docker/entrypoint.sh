#!/usr/bin/env bash
# ── eval-copilot container entrypoint ────────────────────────────────────────
# Drops into an interactive bash session with helper functions for Copilot auth.

# ────────────────────────────────────────────────────────────────────────────────
# Helper: Verify GitHub Copilot authentication
# ────────────────────────────────────────────────────────────────────────────────
check_copilot_auth() {
  if gh copilot alias &>/dev/null; then
    echo "✓ GitHub Copilot is authenticated"
    return 0
  else
    echo "✗ GitHub Copilot is NOT authenticated"
    echo ""
    echo "To authenticate with Copilot, run:"
    echo "  gh auth login"
    echo ""
    echo "You need a GitHub token with Copilot access. Get one at:"
    echo "  https://github.com/settings/tokens"
    echo ""
    echo "Minimum required scopes: 'repo', 'read:org', 'workflow'"
    return 1
  fi
}

cat <<'BANNER'
╔══════════════════════════════════════════════════════════════════╗
║                        eval-copilot                              ║
║            Contenedor listo  ·  bash interactivo                 ║
╠══════════════════════════════════════════════════════════════════╣
║  1) Autentícate con GitHub Copilot:                              ║
║        gh auth login                                             ║
║     (⚠ Token must have Copilot access)                           ║
║                                                                  ║
║  2) Verifica la autenticación:                                   ║
║        check_copilot_auth                                        ║
║                                                                  ║
║  3) Ejecuta la herramienta:                                      ║
║        eval-copilot -p "tu prompt" -x 3 \                        ║
║                    --mcp /app/mcp-config.json                    ║
║  Reportes HTML:  /app/reports                                    ║
╚══════════════════════════════════════════════════════════════════╝
BANNER

echo ""
echo "Checking Copilot authentication..."
if ! check_copilot_auth; then
  echo ""
  echo "Run 'gh auth login' to authenticate, then 'check_copilot_auth' to verify."
fi
echo ""

# ────────────────────────────────────────────────────────────────────────────────
# Ensure a Python venv for MCP tools is available at /opt/mcp_venv
# This venv is created inside the container (not under the read-only mounted code).
# If the host MCP code provides a requirements.txt, install it; otherwise install 'requests'.
# ────────────────────────────────────────────────────────────────────────────────
if command -v python3 >/dev/null 2>&1; then
  if [[ ! -d "/opt/mcp_venv" ]]; then
    echo "[eval-copilot] Creating MCP virtualenv at /opt/mcp_venv..."
    python3 -m venv /opt/mcp_venv || { echo "[eval-copilot] venv creation failed"; }
    /opt/mcp_venv/bin/python -m pip install --upgrade pip setuptools wheel || true
    if [[ -f "/opt/mcp/kali/requirements.txt" ]]; then
      echo "[eval-copilot] Installing MCP requirements from /opt/mcp/kali/requirements.txt"
      /opt/mcp_venv/bin/pip install --no-cache-dir -r /opt/mcp/kali/requirements.txt || true
    else
      echo "[eval-copilot] Installing 'requests' into MCP venv"
      /opt/mcp_venv/bin/pip install --no-cache-dir requests || true
    fi
  else
    echo "[eval-copilot] MCP venv already exists at /opt/mcp_venv"
  fi
else
  echo "[eval-copilot] python3 not available in container; MCP venv cannot be created"
fi

exec /bin/bash
