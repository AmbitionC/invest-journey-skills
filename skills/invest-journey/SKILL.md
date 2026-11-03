---
name: invest-journey
description: Invest Journey A 股数据服务的入口：安装后登录授权、确认连通、介绍能做什么与余额，并提供取数命令（恐慌指数、宽基指数相对长期中枢的位置、乖离率排名、股息率、宏观数据及口径）。用户刚装好、要登录、问「这个能干嘛 / 装好了没 / 还剩多少点」、或其他 Invest Journey Skill 需要取数时使用。
---

# Invest Journey

本 Skill 目录下自带一个零依赖的命令行（Node.js 18 以上）：`scripts/ij.mjs`。下文的 `IJ` 指
`node <本 Skill 所在目录>/scripts/ij.mjs`，运行时换成实际路径。

## 1. 登录（第一次使用必做，只做一次）

```bash
node <本 Skill 目录>/scripts/ij.mjs login
```

- 它会打开浏览器到 Invest Journey 的授权页，并在终端打印同一个链接和确认码。**把链接原样发给用户**（浏览器没自动打开、或你在远程/沙箱环境里时，用户靠它点开）。
- 用户在网页上登录（没有账号用手机号验证码登录会自动注册），核对确认码后点「授权」。新用户自动开通并送体验点。
- 命令会自己等到授权完成（最多约 100 秒）；输出「授权成功」即完成。若输出「还在等你在浏览器里点授权」并退出，等用户说点好了，再运行一次同样的 `login`（同一个链接 10 分钟内有效，不会换码）。
- 不需要 API Key、不需要环境变量、不需要在客户端里配 MCP 连接。**不要**让用户去网页上复制 Key 粘贴给你。

已经登录过的，`login` 会直接说「已经登录」。查看状态：`IJ status`。

## 2. 取数

两种方式，结果相同：

- 当前会话里有 `invest-journey` 的 MCP 工具（装了插件或配了 MCP）时，直接调用工具。
- 否则用命令行：
  - `IJ tools`：列出全部工具和参数
  - `IJ call <工具名> '<JSON 参数>'`，例如：
    - `IJ call market_snapshot`
    - `IJ call fear_series '{"start":"20250101"}'`
    - `IJ call methodology_get '{"topic":"fear_index"}'`

返回的是 JSON 文本，自己解析后用人话回答。退出码非 0 表示出错，错误原因在输出里。

## 3. 刚装好时怎么回复用户

目标：让用户一分钟内完成第一次成功提问。**简短**，不要长篇介绍，不要一上来列出全部工具，也不要主动推销会员。

1. 没登录就先按第 1 步登录；登录后运行 `IJ status`（即 `account_usage`，不扣点）。
2. 用两三句话回复：
   - 能做什么：看 A 股恐慌指数、宽基指数相对长期中枢的位置、短期偏离度排名、股息率和宏观数据，每个数都能查到计算方法；也能帮你把自己的投资规则写清楚、用历史数据检验。
   - 当前余额：照返回的 `points`（或 `onboarding.balance`）说；体验用户说明「调用失败自动退点」。
   - 给 3 个可以直接发的问法让用户挑（返回里有 `onboarding.tryAsking` 时用它）：
     - 这个恐慌指数是怎么算的？有什么局限？（不扣点）
     - 现在沪深300 贵不贵？市场情绪怎么样？（约 2 点）
     - 把 2015 年以来的恐慌指数画出来。（约 2 点）
3. 用户挑了就按对应 Skill 去做：`market-reading`（市场读数）、`methodology`（指标口径）、`strategy-builder`（把你的规则写清楚并回测）。

## 4. 出错时

按现象判断，**把修法告诉用户，不要反复重试**：

| 现象 / 输出里写着 | 怎么办 |
|---|---|
| 「还没登录」「凭证不可用」「Key 已被吊销」 | 运行 `IJ login`，把打印的链接发给用户，让用户登录后点「授权」 |
| 用户在网页上点了取消 / 链接过期 | 重新运行 `IJ login`，会生成新链接 |
| 「连不上」「没有放行」、HTTP 403 / 405、Site Unavailable、fetch failed | 你所在环境的网络把我们的服务拦了（服务本身正常），见下方「网络被拦」，**不要重试、不要自己找别的接口** |
| MCP 工具显示 needs authentication（插件 / MCP 方式） | Claude Code 里输入 `/mcp`，选中 `invest-journey` → Authenticate，登录后点「授权」；或者改用上面的命令行登录 |
| Journey 点数不足 | 停止调用，把报错里的余额、充值链接和价格原样告诉用户；充值到账后直接重试，不用重新登录 |
| 今日调用已达上限 | 告诉用户北京时间零点重置 |

### 网络被拦（沙箱环境常见）

Claude App / 网页版、部分云端或公司内网环境只允许访问白名单里的网站，访问 `fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run` 会被拦下，表现为 403、405、Site Unavailable 或连接失败。这不是 Invest Journey 出了问题，也不是没登录。照下面原样告诉用户，选一种：

1. **放行域名**（Claude App / 网页版）：打开 设置 → 功能（Capabilities），在代码执行的网络访问里选「所有域名」，或把 `fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run` 加进允许列表。改完**新开一个对话**，再说一次「登录 Invest Journey」。
2. **换本机的 Agent**：在自己电脑终端里用 Claude Code、Codex 或 Cursor，没有这个限制。
3. 公司网络或其他客户端：请管理员放行上面这个域名。

说完就停，等用户处理好再继续，不要反复运行 login。

工具结果末尾出现「【Journey 提示】」（点数快用完）时，在回答末尾原样转告用户一次，之后不要重复。

不想用了：`IJ logout` 删除本机凭证；到 https://invest-journey.vercel.app/skills 「我的账户」可吊销。
