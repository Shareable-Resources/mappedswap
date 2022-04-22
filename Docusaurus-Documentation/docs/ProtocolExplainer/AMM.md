---
sidebar_position: 1
title: 🔗 AMM (Automated Maket Maker) 
---

MappedSwap Protocol maintains at least 6 billion in value of [Mapped Tokens](https://docs.mappedswap.io/docs/ProtocolExplainer/WhatAreTheMappedTokens) liquidity in RaijinSwap, a decentralized swap exchange built on Eurus Blockchain which uses the Constant Product Market Maker Model algorithm for market making.

The Constant Product Market Maker Model is a type of **Automated Market Maker (AMM)** mechanism. The complete formula is below: 
:::tip Formula
```sh
                             X * Y = K
```
:::

X and Y are the numbers of tokens in the liquidity pool. K is a constant. X and Y can only vary in the opposite direction. No matter how X and Y change, K always stays the same. In a MappedSwap transaction, the product of two Mapped Tokens in the liquidity pool at RaijinSwap before and after a transaction is a constant value, that is, product before buying = product after buying.

For now, MappedSwap supports liquidity pools including:
- [BTCM/USDM](https://app.mappedswap.io/trade/BTCM)
- [ETHM/USDM](https://app.mappedswap.io/trade/ETHM)

For example: Buying USDM with BTCM will increase x (the number of BTCM in the pool) and decrease y (the number of USDM in the pool), so the price of BTCM/USDM (y/x) will decrease accordingly.
