# price-robot

Demo program and contract to adjust token price in Mapped Swap.

Fetch price from Ethereum Uniswap regularly and trade in Mapped Swap pool, to make price follow the real world.

## Contract `PriceAdjust`

The two most important functions are `topUp()` and `adjust()`.

---

### `topUp(ERC20 tokenAddr, uint256 amount)`

`tokenAddr`:  Address of token to top up, either `BTCM`'s or `ETHM`'s address

`amount`: Top up amount

To trade in Mapped Swap, one should have enough tokens transferred to the pool.

This function is doing this; by transferring tokens to the pool, `PriceAdjust` is treated as a customer and allowed to trade.

Before using `topUp()`, you should also transfer token to this `PriceAdjust` contract first.

---

### `adjust(string tokenName, ERC20 tokenAddr, int256 targetPrice, uint8 decimals)`

`tokenName`: The token you want to adjust, currently either `BTCM` or `ETHM`

`tokenAddr`: Token address of `BTCM` or `ETHM`

`targetPrice`: The target USDC price of token, with decimals below

`decimals`: The decimals of above price

Given the target price, `PriceAdjust` contract calculates amount needed to sell in order to make the price in Mapped Swap reach this target, then make the trade.

if you want adjust current ETH price to $3,981.86745761, input `targetPrice = 398186745761` and `decimals = 8`.

---

### Calculation

To simplify calculation, contract always find the exact amount to sell, so that price will reach to target after swap.

Assume target price is higher than current price, sell some USDM to rise the price:

Amount to sell can be calculated by

<img src="https://render.githubusercontent.com/render/math?math=\LARGE \frac{\frac{R_R %2B A_{in}}{10^{d_{R}}}}{\frac{R_T - A_{out}}{10^{d_{T}}}}=\frac{P}{10^{d}}">

<img src="https://render.githubusercontent.com/render/math?math=P"> = `targetPrice`

<img src="https://render.githubusercontent.com/render/math?math=d"> = `decimals`

<img src="https://render.githubusercontent.com/render/math?math=R_{R}"> = reserve of USDM (reference token)

<img src="https://render.githubusercontent.com/render/math?math=d_{R}"> = decimals of USDM

<img src="https://render.githubusercontent.com/render/math?math=R_{T}"> = reserve of token (target token)

<img src="https://render.githubusercontent.com/render/math?math=d_{T}"> = decimals of token

<img src="https://render.githubusercontent.com/render/math?math=A_{in}"> = amount to sell (go into pool)

<img src="https://render.githubusercontent.com/render/math?math=A_{out}"> = amount to buy (go outside pool)

Make it clearer

<img src="https://render.githubusercontent.com/render/math?math=\LARGE \frac{R_R %2B A_{in}}{R_T - A_{out}}=\frac{P}{E}\: ,\:  E=10^{d %2B d_{T} - d_{R}}">

And we know <img src="https://render.githubusercontent.com/render/math?math=A_{out}"> can be calculated by (The same equation can be found in `UniswapV2Library.sol` `getAmountOut()`)

<img src="https://render.githubusercontent.com/render/math?math=\LARGE A_{out}=\frac{997R_{T}A_{in}}{1000R_{R} %2B 997A_{in}}">

Combine these 2 equations to get

<img src="https://render.githubusercontent.com/render/math?math=\LARGE 997E{A_{in}}^2 %2B 1997ER_{R}A_{in} %2B 1000E{R_{R}}^2-1000PR_{R}R_{T}=0">

Then solve the quadratic equation. If current price is higher than target price, the calculation is similar; but this time sell tokens to lower its price.

### Compiling the Contract

Install packages

`yarn`

Use truffle to compile, truffle should be installed globally

`truffle compile`

### Deploy the Contract

`truffle migrate --network testnet`

This will deploy `PriceAdjust` and a proxy contract, then grant access. Note that you need to set your private key in `truffle-config.js` first.

## Program `onlineDataFetcher`

Please read the doc in `MappedSwap_BackEnd`