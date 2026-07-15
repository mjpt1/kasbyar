#!/usr/bin/env bash
# KesbYar local quality gate — mirrors CI verify subset (no build).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "KesbYar verify: generate + lint + typecheck + test"
npm run db:generate
npm run lint
npm run typecheck
npm test
echo "verify OK — run 'npm run ci' before release cuts"
