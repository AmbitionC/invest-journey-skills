# Invest Journey Skills

把 [Invest Journey](https://invest-journey.cn) 的 **A 股市场加工数据与口径**接进你自己的 Agent：
恐慌指数、宽基指数相对长期中枢的位置、乖离率与近十年排名、红利股息率、宏观数据，以及每个数「怎么算、有什么局限、历史上验证过什么」。

怎么用、风险偏好是什么，由你自己定。我们提供数据和口径，你的 Agent 帮你把自己的规则写清楚、做检验。

| Skill | 用途 |
|---|---|
| `market-reading` | 读市场温度，带口径与局限 |
| `methodology` | 查指标口径，在本地复刻或改造 |
| `strategy-builder` | 把你的想法写成可检验的规则并用历史数据检验 |

口径文档静态版见 [methodology/](methodology/README.md)。

## 1. 获取 API Key

目前为内测，Key 由人工发放（格式 `jk_` 开头）。联系作者获取后：

```bash
export INVEST_JOURNEY_API_KEY=jk_你的key
```

## 2. 安装

### Claude Code（推荐，MCP + Skills 一起装）

```text
/plugin marketplace add AmbitionC/invest-journey-skills
/plugin install invest-journey@invest-journey
```

重启 Claude Code，`/mcp` 里看到 `invest-journey` 已连接即可。

### 只接 MCP（任何支持远程 MCP 的客户端）

```bash
claude mcp add --transport http invest-journey \
  https://fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run/mcp/invest \
  --header "Authorization: Bearer $INVEST_JOURNEY_API_KEY"
```

Cursor / 其他客户端的 `mcp.json`：

```json
{
  "mcpServers": {
    "invest-journey": {
      "url": "https://fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run/mcp/invest",
      "headers": { "Authorization": "Bearer jk_你的key" }
    }
  }
}
```

## 3. 试一下

> 用 invest-journey 看看现在 A 股市场温度，说明每个数的口径

> 恐慌指数是怎么算的？帮我用 Python 复刻一版

> 我想在沪深300 低于长期中枢且恐慌指数 ≥75 时分批买入，帮我写成规则并检验

排查 Key 或网络问题：`./scripts/call.sh tools/list`

## 工具与计量

完整工具清单见 [docs/tools.md](docs/tools.md)。当前版本只读、不扣点，每个 Key 每日 2000 次调用上限。

## 声明

本服务提供的数据、指标与口径仅供研究和学习参考，**不构成任何投资建议**，不提供买卖时点或个股推荐。
历史验证结论不代表未来表现。据此操作的风险由使用者自行承担。

## 许可

Skill 文本、脚本与口径文档采用 MIT 许可；通过 MCP 获取的数据归 Invest Journey 所有，仅供个人研究使用，不得批量抓取再分发。
