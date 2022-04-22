---
sidebar_position: 2
title: 💧 Fees and Liquidations
---

### Fees
Apart from the interest fee charged based on the [Borrowing Rates](https://docs.mappedswap.io/docs/Cross-Margin%20Swap%20Trading/BorrowingRates), a trading fee is charged on a per swap trade basis and calculated based on 0.3% on the sold assets size, and is taken directly from the swap trade.

As an example, if a user sells 1 BTCM, 0.003 BTCM is taken from the order and the remaining 0.997 BTCM will undergo the swap trade.

### Liquidations
Risk Level is used to evaluate the riskiness of user’s account, with the formula:

:::tip Formula: 
> Risk Level = 1 – Equity x 10 / Used Funding 
           = (Used Funding – Total Funding) / Used Funding 
           = - Available Funding / Used Funding
:::

- **Example 6:** From example 2, 4 & 5 on section [Funding Facility](https://docs.mappedswap.io/docs/Cross-Margin%20Swap%20Trading/FundingFacility), 
the risk level of the user = - (-6,000) / 31,000 = 19%.

When the risk level reaches 80%, liquidation will be triggered and the Protocol would convert all non-USDM positions into USDM.
