# 工具清单（v0.1 · 只读）

端点：`https://fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run/mcp/invest`（MCP Streamable HTTP）

| 工具 | 参数 | 返回 |
|---|---|---|
| `market_snapshot` | 无 | 恐慌指数、四个宽基指数相对长期中枢的位置、七个指数乖离率与近十年排名、中证红利股息率与分位 |
| `fear_series` | 可选 `start`、`end`（YYYYMMDD，默认近一年） | 恐慌指数逐日序列（2005 年起）及五个分量 |
| `bias_series` | 可选 `code`（如 000300.SH） | 近一年 60 日乖离率与排名逐日序列 |
| `macro_series` | 可选 `name`（如 cn_m.m2_yoy） | 不传：全部序列最新值；传：该序列历史 |
| `indicator_list` | 无 | 指标清单、频率、对应工具 |
| `methodology_get` | `topic`: fear_index / median_anchor / bias_rank / dividend_yield / macro_series | 完整口径、局限、历史验证结论 |
| `account_usage` | 无 | 当前 Key 今日调用次数与上限 |

## 不提供的内容

- 原始行情转售（请用自己的数据源）
- 买卖触发线、仓位建议、个股推荐
- 任何个人持仓数据

## 计量

每次 `tools/call` 按工具扣点（价目见 README「计费」节，调用失败自动退点），另有按会员档的每日调用上限（体验 200 / 入门 1000 / Pro 5000，北京时间零点重置）。管理员发放的 Key 不扣点。
`initialize`、`tools/list` 不计次。
