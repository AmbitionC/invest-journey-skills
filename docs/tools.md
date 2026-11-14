# 工具清单（v0.1 · 只读）

端点：`https://fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run/mcp/invest`（MCP Streamable HTTP）

| 工具 | 参数 | 返回 |
|---|---|---|
| `market_snapshot` | 无 | 恐慌指数、四个宽基指数相对长期中枢的位置、七个指数乖离率与近十年排名、中证红利股息率与分位 |
| `fear_series` | 可选 `start`、`end`（YYYYMMDD，默认近一年） | 恐慌指数逐日序列（2005 年起）及五个分量 |
| `bias_series` | 可选 `code`（如 000300.SH） | 近一年 60 日乖离率与排名逐日序列 |
| `macro_series` | 可选 `name`（如 cn_m.m2_yoy） | 不传：全部序列最新值；传：该序列历史 |
| `market_sentiment` | 可选 `days`（默认 20，最多 250） | 逐日涨停/跌停/炸板家数、封板率、连板高度、昨日涨停今日平均涨幅与开盘溢价 |
| `sector_rank` | 可选 `category`（industry / concept / region）、`period`（交易日数，默认 5）、`order`（top / bottom）、`top`（默认 10） | 同花顺行业/概念/地域指数涨跌幅排行与成交额 |
| `sector_history` | `keyword`（如「半导体」）或 `code`，可选 `days`（默认 120） | 单个板块指数日线 |
| `index_history` | 可选 `code`（默认 000300.SH）、`start`、`end` | 41 个常见指数日线：宽基、策略风格、行业主题、港股海外（如 399997.SZ 中证白酒、HSI.HI 恒生指数），从各指数发布日起 |
| `index_metrics` | 可选 `code`、`category`（宽基 / 策略风格 / 行业主题 / 港股海外）、`days`（默认 250，最多 6000）、`start`、`end` | 不传 code：41 个指数最新读数（长期中枢、收盘÷中枢、近5年中位线、距最高点、60 日偏离度、近十年名次、全历史分位）；传 code：该指数逐日序列 |
| `rule_backtest` | 无 | 网站跟车规则在四个指数上的历史回测成绩与逐年对照买入持有（免费） |
| `indicator_list` | 无 | 指标清单、频率、对应工具 |
| `methodology_get` | `topic`: fear_index / median_anchor / bias_rank / index_metrics / dividend_yield / macro_series | 完整口径、局限、历史验证结论 |
| `account_usage` | 无 | 当前 Key 今日调用次数与上限 |

## 不提供的内容

- 个股行情（请用自己的数据源）
- 买卖触发线、仓位建议、个股推荐
- 任何个人持仓数据

## 计量

每次 `tools/call` 按工具扣点（价目见 README「计费」节，调用失败自动退点；`fear_series`、`bias_series`、`macro_series`、`market_sentiment`、`sector_history`、`index_history`、`index_metrics` 同一天只扣一次），另有按会员档的每日调用上限（体验 200 / 会员 1500，北京时间零点重置）。管理员发放的 Key 不扣点。
`initialize`、`tools/list` 不计次。
