---
sidebar_position: 3
title: 💧 费用和強平
---

​**费用** 

除按 [借款利率](https://docs.mappedswap.io/docs/MappedSwap%20Protocol%20Chinese/Cross-Margin%20Swap%20Trading/BorrowingRates) 收取的利息费外，交易手续费按出售资产规模的0.3%计算，直接从交易中扣除。
​
例如，如果用户卖出 1 个 BTCM，将从订单中取出 0.003 个 BTCM，剩余的 0.997 个 BTCM 将进行掉期交易。

​
**強平** 

风险水平用于评估用户账户的风险

:::tip 公式为: 

风险水平 = 1 – 净资产总值 x 10 / 已用额度
         =（已用额度 - 总体额度）/已用额度 
         = - 可用额度 / 已用额度
:::
- **示例 6：** 从示例 2、4 和 5 的配资机制，用户的风险水平 = - (-6,000) / 31,000 = 19%。

当风险水平达到 80% 时，将触发平仓，协议会将所有非 USDM 头寸转换为 USDM。


