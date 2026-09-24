#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
command -v node >/dev/null 2>&1 || { echo "Node.js 22+ is required." >&2; exit 1; }
export GPIO_ENABLED="${GPIO_ENABLED:-false}"
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-8000}"
cd "$PROJECT_ROOT"
exec node backend/server.mjs
