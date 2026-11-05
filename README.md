# Invest Journey Skills

把 [Invest Journey](https://invest-journey.cn) 的 **A 股市场加工数据与口径**接进你自己的 Agent：
恐慌指数、宽基指数相对长期中枢的位置、乖离率与近十年排名、红利股息率、宏观数据，以及每个数「怎么算、有什么局限、历史上验证过什么」。

怎么用、风险偏好是什么，由你自己定。我们提供数据和口径，你的 Agent 帮你把自己的规则写清楚、做检验。

| Skill | 用途 |
|---|---|
| `invest-journey` | 入口：登录授权、取数命令、刚装好时的引导与排错 |
| `market-reading` | 读市场温度，带口径与局限 |
| `methodology` | 查指标口径，在本地复刻或改造 |
| `strategy-builder` | 把你的想法写成可检验的规则并用历史数据检验 |

口径文档静态版见 [methodology/](methodology/README.md)。

## 1. 安装（一句话）

对你的 Agent（Claude Code、Codex、Cursor、OpenCode 等能运行终端命令的都行）说：

> 帮我安装 Invest Journey Skill 并登录：npx skills add AmbitionC/invest-journey-skills -g -y

或者自己在终端运行（需要 Node.js 22 以上）：

```bash
npx skills add AmbitionC/invest-journey-skills -g -y
```

## 2. 登录：浏览器里点一下「授权」

装好后 Agent 会运行 Skill 自带的登录命令（也可以自己在 `invest-journey` Skill 目录里运行）：

```bash
node scripts/ij.mjs login
```

浏览器会打开 Invest Journey，登录（手机号验证码登录会自动注册），核对确认码后点「授权」，就好了。
**不用建 Key、不用写环境变量、不用在客户端里配连接。** 新用户授权时自动开通，送 **100 点体验额度**，14 天内有效（约够跑一次完整回测，再每天看一眼市场）。

凭证保存在本机 `~/.config/invest-journey/credentials.json`。不想用了：`node scripts/ij.mjs logout`，或到 https://invest-journey.vercel.app/skills 「我的账户」吊销。

> 给 Agent 看的说明：安装运行上面那条 `npx skills add` 即可；登录运行 `invest-journey` Skill 里的 `node scripts/ij.mjs login`，把它打印的链接发给用户，等用户点完「授权」。不要让用户复制 Key 给你。

### 其他接入方式（可选）

- **Claude Code 插件**（Skill + MCP 一起装）：`claude plugin marketplace add AmbitionC/invest-journey-skills && claude plugin install invest-journey@invest-journey`，重启后输入 `/mcp` → 选 `invest-journey` → Authenticate，浏览器里点「授权」。
- **只接 MCP**：地址 `https://fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run/mcp/invest`（Streamable HTTP），支持浏览器授权（OAuth）的客户端填地址即可：
  - Claude Code：`claude mcp add --transport http --scope user invest-journey https://fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run/mcp/invest`
  - Cursor：`~/.cursor/mcp.json` 里加 `{"mcpServers": {"invest-journey": {"url": "https://fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run/mcp/invest"}}}`，在 MCP 设置页点登录。
  - 不支持浏览器授权的客户端：到 https://invest-journey.vercel.app/skills 「我的账户」创建 Key（`jk_` 开头，只显示一次），请求头带 `Authorization: Bearer jk_你的key`。

## 3. 试一下

> 用 invest-journey 看看现在 A 股市场温度，说明每个数的口径

> 恐慌指数是怎么算的？帮我用 Python 复刻一版

> 我想在沪深300 低于长期中枢且恐慌指数 ≥75 时分批买入，帮我写成规则并检验

第一次用可以直接问「这个能干嘛」，Agent 会告诉你余额和几个可以直接试的问法（查余额不扣点）。装好后回到 https://invest-journey.vercel.app/skills ，页面顶部的进度条会自动检测你的 Agent 有没有连上。

### 连不上怎么办

| 现象 | 处理 |
|---|---|
| 提示「还没登录」「凭证不可用」「Key 已被吊销」 | 运行 `node scripts/ij.mjs login`，在打开的页面登录并点「授权」，余额不受影响 |
| 浏览器没打开（远程机器、沙箱） | 把 login 打印的链接复制到任意设备的浏览器打开，点「授权」即可 |
| 报「连不上」、403 / 405、Site Unavailable（常见于 Claude App / 网页版） | 所在环境的网络没放行我们的服务：Claude App / 网页版在 设置 → 功能 → 代码执行的网络访问 里选「所有域名」或加入 `fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run`，新开对话再登录；或改用本机终端里的 Agent |
| 插件 / MCP 方式：`/mcp` 里显示 needs authentication | 选中它按提示选 Authenticate，在打开的页面登录并点「授权」 |
| 手填 Key 的客户端报「没读到 API Key / Key 不存在」 | 确认请求头是 `Authorization: Bearer jk_…`、Key 复制完整；明文找不到就在后台新建 |

> 版本说明：0.5.0 起默认用 `npx skills add` 安装、Skill 自带命令行登录；0.4.0 的插件 / MCP 浏览器授权继续可用；0.3.x 及更早靠环境变量 `INVEST_JOURNEY_API_KEY` 传 Key，原来的 Key 仍可用于手填接入。

## 工具与计量

完整工具清单见 [docs/tools.md](docs/tools.md)。当前版本只读。

## 计费

按调用扣点（1 点约 ¥0.1），调用失败自动退点；`account_usage` 可随时查余额。新用户开通（第一次授权即开通）送 **100 点体验额度**（14 天内有效，到期没用完的清零），用完或到期后需开通会员或购买加油包才能继续调用（点数不足时工具会返回剩余点数和充值链接）。没有自动续费，不需要绑卡。

1. **早期用户半价（2026-11-01 起）**：按原价五折，已购会员在有效期内不受后续调价影响。
2. **正式价**：恢复原价，开始日期另行公布。

| 档位 | 半价期 | 原价 | 每月点数 | Key 数 | 每日调用上限 |
|---|---|---|---|---|---|
| 体验 | — | — | 开通送 100 点（一次性，14 天内有效） | 1 | 200 |
| 会员 | ¥14.5/月，¥119.5/年 | ¥29/月（一天不到一块钱），¥239/年 | 800 | 2 | 1500 |

会员是数据服务会员：每月发放点数、更多 Key 和更高的每日上限，点数不过期，没有自动续费；点数不够时买加油包，和会员叠加使用。支持支付宝网页付款（到账自动发放）和微信扫码。

加油包（不过期）：100 点 ¥5（原价 ¥10）· 500 点 ¥22.5（原价 ¥45）· 1100 点 ¥44（原价 ¥88）。

每次调用的点数：口径类工具（`indicator_list`、`methodology_get`、`account_usage`）不扣点；`market_snapshot` 每次 5 点；`fear_series`、`bias_series` 每次 10 点；`macro_series`、`market_sentiment`、`sector_rank`、`sector_history`、`index_history` 每次 5 点；`rule_backtest` 免费。**历史序列（`fear_series`、`bias_series`、`macro_series`、`market_sentiment`、`sector_history`、`index_history`）同一天只扣一次**：分段取全历史、换参数重取都不再扣点。完整价目以 https://invest-journey.vercel.app/skills 为准。

## 声明

本服务提供的数据、指标与口径仅供研究和学习参考，**不构成任何投资建议**，不提供买卖时点或个股推荐。
历史验证结论不代表未来表现。据此操作的风险由使用者自行承担。

## 许可

Skill 文本、脚本与口径文档采用 MIT 许可；通过 MCP 获取的数据归 Invest Journey 所有，仅供个人研究使用，不得批量抓取再分发。
