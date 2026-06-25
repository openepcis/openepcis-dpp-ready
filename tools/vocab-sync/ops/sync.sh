#!/usr/bin/env bash
# Scheduled wrapper for `vocab-sync sync`. Fail-soft: if the local LLM endpoint is down it logs and
# exits 0 (a scheduler should not alarm when the Mac simply has LM Studio closed). Run by launchd or
# cron (see com.openepcis.vocab-sync.plist / the README). The whole chain is local — no API key.
set -uo pipefail

# --- config (override via env) ------------------------------------------------------------------
TOOL_DIR="${VOCAB_SYNC_DIR:-$HOME/Documents/projects/openepcis/openepcis-dpp-ready/tools/vocab-sync}"
# Dedicated var (not the ambient JAVA_HOME, which is often an older JDK): the tool needs JDK 25.
JAVA_HOME="${VOCAB_SYNC_JAVA_HOME:-$HOME/.sdkman/candidates/java/25.0.2-graalce}"
LLM_BASE_URL="${LLM_BASE_URL:-http://localhost:1234/v1}"
JAR="$TOOL_DIR/target/quarkus-app/quarkus-run.jar"
LOG="$TOOL_DIR/.cache/sync.log"
STAMP="$(date +%Y-%m-%d)"

mkdir -p "$(dirname "$LOG")"
exec >>"$LOG" 2>&1
echo "===== vocab-sync sync @ $(date '+%Y-%m-%d %H:%M:%S') ====="

# --- preconditions ------------------------------------------------------------------------------
if [ ! -f "$JAR" ]; then
  echo "sync.sh: jar not found at $JAR — build it first (mvn -DskipTests package). Skipping."
  exit 0
fi
if ! curl -sf -o /dev/null --max-time 10 "$LLM_BASE_URL/models"; then
  echo "sync.sh: LLM endpoint $LLM_BASE_URL not reachable (LM Studio not running?). Skipping this run."
  exit 0
fi

# --- run ----------------------------------------------------------------------------------------
# Default: report + apply QA-confirmed mappings to a branch for review (never pushes, never touches
# the current branch). Pass extra args through, e.g. ops/sync.sh --no-apply, or --module battery.
cd "$TOOL_DIR" || exit 0
"$JAVA_HOME/bin/java" -jar "$JAR" sync --stamp "$STAMP" "$@"
echo "sync.sh: done (exit $?)."
