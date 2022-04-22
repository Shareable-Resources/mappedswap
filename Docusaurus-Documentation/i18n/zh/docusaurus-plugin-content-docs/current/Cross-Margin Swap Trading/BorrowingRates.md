---
sidebar_position: 2
title: 📈 借款利率
---


借款利率可以在协议的 [账户页面](https://app.mappedswap.io/account) 上找到。

利息计算规则：借入资产的单利应按每小时整点计算：
如果用户在 10:45 借入 1 BTCM 并在 10:55 归还所借的 1BTCM，则在 11:00 不产生利息。
如果用户在 10:45 借了 1 BTCM，在 11:00 没有归还所借的 1BTCM。 借入的 BTCM 会产生一小时的利息。 如果用户将借入的头寸保留到下一小时12:00，将被视为2小时的利息。

:::tip 公式为：

一小时利息 ＝ 该资产借款金额 * 该资产每小时借贷利率
:::

还款应视为先支付利息，在利息全部支付后，偿还相关借入资产的本金。任何应计利息都会增加已用额度或降低净资产总值，从而可能导致 [平仓](https://docs.mappedswap.io/docs/MappedSwap%20Protocol%20Chinese/Cross-Margin%20Swap%20Trading/FeesandLiquidations) 风险。协议可以随时调整借款利率。

