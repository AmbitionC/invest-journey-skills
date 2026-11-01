---
name: getting-started
description: Invest Journey 刚装好、第一次使用，或用户问「这个能干嘛 / 怎么用 / 装好了没 / 还剩多少点」时使用：确认连通、简短介绍能力与余额、给出可以直接试的问法；调用报 Key 相关错误时带用户排查。
---

# 第一次使用 Invest Journey

目标：让用户在一分钟内完成第一次成功提问。**简短**，不要长篇介绍。

## 步骤

1. 调 `account_usage`（不扣点）。成功即说明已经连通。
2. 用两三句话回复用户：
   - 能做什么：看 A 股恐慌指数、宽基指数相对长期中枢的位置、短期偏离度排名、股息率和宏观数据，每个数都能查到计算方法；也能帮你把自己的投资规则写清楚、用历史数据检验。
   - 当前余额：照 `account_usage` 返回的 `points`（或 `onboarding.balance`）说；体验用户说明「调用失败自动退点」。
   - 给 3 个可以直接发的问法，让用户挑一个（返回里有 `onboarding.tryAsking` 时用它，没有就用下面的）：
   - 这个恐慌指数是怎么算的？有什么局限？（不扣点）
   - 现在沪深300 贵不贵？市场情绪怎么样？（约 2 点）
   - 把 2015 年以来的恐慌指数画出来。（约 2 点）
3. 用户挑了就直接按对应 Skill 去做：`market-reading`（市场读数）、`methodology`（指标口径）、`strategy-builder`（把你的规则写清楚并回测）。
4. 只在用户问起时再提：同一个 Key 和余额也能用 Agent Journey（前端 / AI 工程知识库、真实面经和实战题卡），装法见 https://www.agent-journey.cn/developer 。

不要一上来就列出全部工具，也不要主动推销会员。

## 调用报错时

按报错原文判断，**把修法告诉用户，不要反复重试**：

| 报错里写着 | 让用户做 |
|---|---|
| 没读到 API Key / 环境变量没有生效 | 在终端运行 `echo $INVEST_JOURNEY_API_KEY`，确认能看到 `jk_` 开头的 Key；没有就 `export INVEST_JOURNEY_API_KEY=jk_你的key` 并写进 `~/.zshrc` 或 `~/.bashrc`，然后**完全退出客户端再打开** |
| Key 格式不对 / Key 不存在 | 到 https://www.agent-journey.cn/developer 「我的后台」核对 Key 前缀，复制完整（不带引号空格）；明文找不到就新建一个 |
| Key 已被吊销 | 到后台新建一个，替换环境变量后重启客户端，余额不受影响 |
| 工具列表里根本没有 `invest-journey` 的工具 | 说明 MCP 没连上：Claude Code 里输入 `/mcp` 看 `invest-journey` 的状态，按上面第一行排查 |
| Journey 点数不足 | 停止调用，把报错里的余额、充值链接和价格原样告诉用户；充值到账后直接重试，Key 不用换 |
| 今日调用已达上限 | 告诉用户北京时间零点重置 |

## 点数提醒

工具结果末尾出现「【Journey 提示】」时，在回答末尾原样转告用户一次，之后不要重复。
