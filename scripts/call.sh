#!/usr/bin/env bash
# 不经 MCP 客户端、直接用 curl 调一个工具（排查 Key / 网络问题用）。
# 用法：INVEST_JOURNEY_API_KEY=jk_xxx ./scripts/call.sh <tool> ['<json 参数>']
#   ./scripts/call.sh tools/list
#   ./scripts/call.sh fear_series '{"start":"20260101"}'
set -euo pipefail
URL="${INVEST_JOURNEY_MCP_URL:-https://fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run/mcp/invest}"
if [ -z "${INVEST_JOURNEY_API_KEY:-}" ]; then
  echo "请先 export INVEST_JOURNEY_API_KEY=jk_xxx" >&2
  exit 1
fi
TOOL="${1:-tools/list}"
ARGS="${2:-}"
if [ -z "$ARGS" ]; then ARGS='{}'; fi
if [ "$TOOL" = "tools/list" ]; then
  BODY='{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
else
  BODY="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$TOOL\",\"arguments\":$ARGS}}"
fi
curl -sS -X POST "$URL" \
  -H "Authorization: Bearer $INVEST_JOURNEY_API_KEY" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d "$BODY"
echo
