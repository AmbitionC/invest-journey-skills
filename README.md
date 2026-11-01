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

在 https://invest-journey.vercel.app/skills 登录后点「开通」，送 50 点体验额度（约够跑通 5~6 次完整场景），然后自助创建 Key（格式 `jk_` 开头，只显示一次）。拿到后：

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

第一次用可以直接问「这个能干嘛」，Agent 会告诉你余额和几个可以直接试的问法（`getting-started` Skill，查余额不扣点）。装好后回到 https://invest-journey.vercel.app/skills ，页面顶部的进度条会自动检测你的 Agent 有没有连上。

### 连不上怎么办

| 现象 | 处理 |
|---|---|
| 报「没读到 API Key / 环境变量没有生效」 | 终端运行 `echo $INVEST_JOURNEY_API_KEY` 确认有值；改完环境变量要**完全退出客户端再打开** |
| 报「Key 格式不对 / Key 不存在」 | 到后台核对 Key 前缀，复制完整、不带引号空格；明文找不到就新建 |
| 报「Key 已被吊销」 | 后台新建一个替换即可，余额不受影响 |
| Claude Code 里没有 invest-journey 的工具 | 输入 `/mcp` 看 `invest-journey` 状态，按第一行排查 |

不经客户端直接测 Key 和网络：`./scripts/call.sh tools/list`

## 工具与计量

完整工具清单见 [docs/tools.md](docs/tools.md)。当前版本只读。

## 计费

按调用扣点（1 点约 ¥0.1），调用失败自动退点；`account_usage` 可随时查余额。新用户开通送 **50 点体验额度**，用完后需开通会员或购买加油包才能继续调用（点数不足时工具会返回剩余点数和充值链接）。没有自动续费，不需要绑卡。

1. **早期用户半价（2026-11-01 起）**：按原价五折，已购会员在有效期内不受后续调价影响。
2. **正式价**：恢复原价，开始日期另行公布。

| 档位 | 半价期 | 原价 | 每月点数 | Key 数 | 每日调用上限 |
|---|---|---|---|---|---|
| 体验 | — | — | 开通送 50 点（一次性） | 1 | 200 |
| 会员 | ¥14.5/月，¥119.5/年 | ¥29/月（一天不到一块钱），¥239/年 | 400 | 2 | 1500 |

会员是数据服务会员：每月发放点数、更多 Key 和更高的每日上限，点数不过期，没有自动续费；点数不够时买加油包，和会员叠加使用。支持支付宝网页付款（到账自动发放）和微信扫码。

加油包（不过期）：100 点 ¥5（原价 ¥10）· 500 点 ¥22.5（原价 ¥45）· 1100 点 ¥44（原价 ¥88）。

每次调用的点数：口径类工具（`indicator_list`、`methodology_get`、`account_usage`）不扣点；`market_snapshot`、`fear_series`、`bias_series` 每次 2 点；其余每次 1 点。完整价目以 https://invest-journey.vercel.app/skills 为准。

## 声明

本服务提供的数据、指标与口径仅供研究和学习参考，**不构成任何投资建议**，不提供买卖时点或个股推荐。
历史验证结论不代表未来表现。据此操作的风险由使用者自行承担。

## 许可

Skill 文本、脚本与口径文档采用 MIT 许可；通过 MCP 获取的数据归 Invest Journey 所有，仅供个人研究使用，不得批量抓取再分发。
