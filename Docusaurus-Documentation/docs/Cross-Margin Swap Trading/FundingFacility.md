---
sidebar_position: 1
title: 🔷 Funding Facility 
---

Protocol users could access the funding facility only if the user gets referred by another user who has already acquired the funding facility.

:::tip Rule 1

> The Total Funding of the user will be 10 times the Equity Value in the user’s account of MappedSwap based on USDM. It will govern the maximum amount of crypto assets that can be borrowed by a single user.

```
Total Funding = Equity Value x 10 
```
:::

- **Example 1:** If the user deposits 100 USDM into MappedSwap, the total funding will be 10 times of equity value = 1,000 USDM.
- **Example 2:** If the user deposits 1 ETHM into MappedSwap, where the price of 1 ETHM is 4,000 USDM, the Total Funding will be 40,000 USDM. When the price of 1 ETHM goes up to 4,500 USDM, the Total Funding in the account will increase to 45,000 USDM.


:::tip Rule 2

> The Used Funding for the user will be the total borrowing incurred by the user and based on USDM. The Protocol will first deduct that crypto asset before incurring any borrowing.

:::

- **Example 3:** Based on example 1, if the user enters a trade to buy 0.05 ETHM (worth 200 USDM), the protocol will first sell the 100 USDM of the user and then sell the borrowed 100 USDM for the trade. After the trade, the Used Funding of the user becomes 100 USDM.

- **Example 4:** Based on example 2, if the user enters a trade to sell 0.5 BTCM (worth 30,000 USDM), since the user has no BTCM in the protocol, the protocol will help the user borrow 0.5 BTC for this trade, this leads to Used Funding turning into 30,000 USDM. In the future, if BTCM price goes up to 70,000 USDM, the Used Funding will become 35,000 USDM (70,000 x 0.5 BTCM).


:::tip Rule 3

> The Available Funding of the user will be Total Funding deducting Used Funding. 
```sh
Available Funding = Total Funding – Used Funding
```
> If the Available Funding goes below 0, then the user can no longer execute any margin trade that further increases the Used Funding.

:::

- **Example 5:** Based on examples 2 & 4, the user now has a balance of 30,000 USDM (from selling 0.5 BTCM) and 1 ETHM, with a borrowing of 0.5 BTCM. If ETHM price is 3,500 USDM and BTCM price is 62,000 USDM, then: 
Total Funding = (30,000 USDM x 1 + 1 ETHM x 3,500 + (-0.5) BTCM x 62,000) x 10 = 25,000 USDM;
Used Funding = 0.5 BTCM x 62,000 = 31,000 USDM;
Available Funding = Total Funding – Used Funding = 25,000 USDM – 31,000 USDM = -6,000 USDM.

Therefore, the user would not be able to further execute any margin trade that further increases Used Funding, unless Total Funding increases (making more deposits to increase equity value or ETHM price increases) or Used Funding decreases (BTCM price decreases), making Available Funding a positive balance.
