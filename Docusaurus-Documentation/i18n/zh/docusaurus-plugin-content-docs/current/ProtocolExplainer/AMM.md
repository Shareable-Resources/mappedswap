---
sidebar_position: 1
title: 🔗 AMM (Automated Maket Maker) 
---

MappedSwap 协议在 RaijinSwap 中维护了至少 60 亿的 [Mapped Tokens](https://docs.mappedswap.io/docs/MappedSwap%20Protocol%20Chinese/ProtocolExplainer/WhatAreTheMappedTokens) 流动性价值，RaijinSwap 是一个建立在 Eurus 区块链上的去中心化交换交易所，它采用恒定乘积做市商模型（Constant Product Market Maker Model）算法进行做市。

恒定乘积做市商模型是一种自动化做市商 (AMM) 机制。 公式如下：

:::tip 公式为
```sh
                             X * Y = K
```
:::

X 和 Y 是流动性池中的代币数量。 K 是一个常数。 X 和 Y 只能沿相反方向变化。 无论 X 和 Y 如何变化，K 始终保持不变。 在一次 MappedSwap 交易中，交易前后 RaijinSwap 流动性池中的两个 Mapped Token 的乘积是一个恒定值，即买前乘积 = 买后乘积。

目前，MappedSwap支持的流动池包括：
- [BTCM/USDM](https://app.mappedswap.io/trade/BTCM)
- [ETHM/USDM](https://app.mappedswap.io/trade/ETHM)

例如：用BTCM购买USDM会增加x（池中BTCM的数量）和减少y（池中的USDM数量），因此BTCM/USDM的价格（y/x）会相应下降。

