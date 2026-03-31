#!/usr/bin/env bash
# ── eval-copilot container entrypoint ────────────────────────────────────────
# Drops into an interactive bash session with helper functions for Copilot auth.

# ────────────────────────────────────────────────────────────────────────────────
# Helper: Verify GitHub Copilot authentication
# ────────────────────────────────────────────────────────────────────────────────
check_copilot_auth() {
  if [[ -n "$GITHUB_TOKEN" ]]; then
    echo "✓ GITHUB_TOKEN is set — token-based auth is active"
    return 0
  elif gh copilot alias &>/dev/null; then
    echo "✓ GitHub Copilot is authenticated via gh CLI"
    return 0
  else
    echo "✗ No authentication found"
    echo ""
    echo "Option A — set a GitHub PAT (recommended, no login required):"
    echo "  export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx"
    echo ""
    echo "Option B — log in interactively with the gh CLI:"
    echo "  gh auth login"
    echo ""
    echo "Your token needs Copilot access. Create one at:"
    echo "  https://github.com/settings/tokens"
    return 1
  fi
}

cat <<'BANNER'
╔══════════════════════════════════════════════════════════════════╗
║                        eval-copilot                              ║
║            Contenedor listo  ·  bash interactivo                 ║
╠══════════════════════════════════════════════════════════════════╣
║  Auth (opción A, recomendada — no requiere login previo):        ║
║    export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx                  ║
║                                                                  ║
║  Auth (opción B — CLI interactivo):                              ║
║    gh auth login                                                 ║
║                                                                  ║
║  Verifica autenticación:                                         ║
║    check_copilot_auth                                            ║
║                                                                  ║
║  Ejecuta la herramienta:                                         ║
║    eval-copilot -p "tu prompt" -x 3 \                            ║
║                --mcp /app/mcp-config.json                        ║
║    # o con token explícito:                                      ║
║    eval-copilot --token "$GITHUB_TOKEN" -p "tu prompt" -x 3     ║
║  Reportes HTML:  /app/reports                                    ║
╚══════════════════════════════════════════════════════════════════╝
BANNER

echo ""
echo "Checking Copilot authentication..."
if ! check_copilot_auth; then
  echo ""
  echo "Set GITHUB_TOKEN or run 'gh auth login', then 'check_copilot_auth' to verify."
fi
echo ""

# ────────────────────────────────────────────────────────────────────────────────
# Install MCP Python dependencies into system Python
# ────────────────────────────────────────────────────────────────────────────────
if command -v python3 >/dev/null 2>&1; then
  if [[ -f "/opt/mcp/kali/requirements.txt" ]]; then
    echo "[eval-copilot] Installing MCP requirements from /opt/mcp/kali/requirements.txt"
    pip install --no-cache-dir -r /opt/mcp/kali/requirements.txt || true
  else
    echo "[eval-copilot] /opt/mcp/kali/requirements.txt not found, skipping pip install"
  fi
else
  echo "[eval-copilot] python3 not available in container; skipping pip install"
fi

exec /bin/bash
