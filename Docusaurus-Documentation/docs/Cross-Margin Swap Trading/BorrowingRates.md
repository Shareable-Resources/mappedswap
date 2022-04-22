---
sidebar_position: 2
title: 📈 Borrowing Rates
---

The **Borrowing Rates** can be found on the [Account](https://app.mappedswap.io/account) Page of the Protocol.

Interest-calculation rules: simple interest on any borrowed asset shall accrue every hour on the hour:

If the user borrows 1 BTCM at 10:45 and repays the borrowed 1BTCM at 10:55, no interest is accrued at 11:00.
If the user borrows 1 BTCM at 10:45 and doesn’t repay the borrowed 1BTCM at 11:00. One hour of interest is accrued on the borrowed BTCM. If the user keeps the borrowed position till the next hour at 12:00, it will be considered as 2 hours of interest.

:::tip The formula will be: 
> Hourly Interest = Borrowed Amount of the Asset * Hourly Interest rate of the Asset
:::

Repayment shall be deemed payment of interest first, and after interest is fully paid, repayment of the principle of the relevant borrowed asset.

Any interest accrued will increase the Used Funding or decrease the equity value, which may lead to the risk of [liquidation](https://docs.mappedswap.io/docs/Cross-Margin%20Swap%20Trading/FeesandLiquidations).
