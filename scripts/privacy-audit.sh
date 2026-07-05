#!/usr/bin/env bash
# Privacy audit (07-verification-and-guardrails.md) — HARD GATE, run before every commit.
# Fails if any excluded personal name or hard-rule material appears in built output.
set -uo pipefail

cd "$(dirname "$0")/.."

EXCLUDE="Mitchell|Janessa|Chris|Leo|Ahad|Abhay|Brendon|David|JZ|Noah|Brandon Worden"
# Hard-rule material (04): legal/rebrand/aliases, sensitive entities.
HARD_RULES="Enterprise Strategy Solutions|stealth rebrand|X Consulting|non-compete|therapist"

FAIL=0
for pattern in "$EXCLUDE" "$HARD_RULES"; do
  HITS=$(grep -riE "$pattern" .next/server/app .next/static out dist build 2>/dev/null | grep -v '\.map:' || true)
  if [ -n "$HITS" ]; then
    echo "PRIVACY FAIL — pattern: $pattern"
    echo "$HITS" | head -20
    FAIL=1
  fi
done

# Belt & braces: no isPublic:false content titles in output.
HELD=$(grep -riE "I Am an Actor|What I Learned This Summer" .next/server/app .next/static out 2>/dev/null || true)
if [ -n "$HELD" ]; then
  echo "PRIVACY FAIL — held (isPublic:false) content found in build output"
  echo "$HELD" | head -10
  FAIL=1
fi

if [ "$FAIL" -ne 0 ]; then exit 1; fi
echo "privacy ok"
