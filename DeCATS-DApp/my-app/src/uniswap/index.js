import { ChainId, Token, TokenAmount, Pair, TradeType, Route, Trade, Percent } from "@uniswap/sdk";
// import { 
//     computePriceImpact, 
//     CurrencyAmount 
// } from '@uniswap/sdk-core'
import { deleteScientificForTruncateNum } from "../web3";
import { getTransactionFeeRatio } from "../store";
import { bigNumberTimes, bigNumberToFixed } from "../utils";

const BTCM = new Token(
    ChainId.MAINNET,
    "0x561A8E87937CeB3fDE3FB15CCDDFcD3e2504364e",
    18,
    "BTCM",
    "BTCM Token"
);
const USDM = new Token(
    ChainId.MAINNET,
    "0xBa103EF33e259c6bb4285cBe50B0a36F3d5fB090",
    6,
    "USDM",
    "USDM Token"
);
const ETHM = new Token(
    ChainId.MAINNET,
    "0xa842F87F9b4A01B41E9680d1336D1241d35A05FC",
    18,
    "ETHM",
    "ETHM Token"
);

const _slippage = "5"; // = 5/1000 = 0.5%

export function getUsdmBtcmPair(usdmReserve, btcmReserve) {
    const USDM_BTCM = new Pair(
        new TokenAmount(USDM, usdmReserve),
        new TokenAmount(BTCM, btcmReserve)
    );
    return USDM_BTCM;
}

export function getUsdmEthmPair(usdmReserve, ethmReserve) {
    const USDM_ETHM = new Pair(
        new TokenAmount(USDM, usdmReserve),
        new TokenAmount(ETHM, ethmReserve)
    );
    return USDM_ETHM;
}

export function buyTradeToken(tradeToken, usdmReserve, tradeReserve, buyAmount, slippage = _slippage) {
    if (tradeToken === 'BTCM') {
        return buyBtcmFromUsdm(usdmReserve, tradeReserve, buyAmount, slippage)
    } else if (tradeToken === 'ETHM') {
        return buyEthmFromUsdm(usdmReserve, tradeReserve, buyAmount, slippage)
    }
}

export function sellTradeToken(tradeToken, usdmReserve, tradeReserve, sellAmount, slippage = _slippage) {
    if (tradeToken === 'BTCM') {
        return sellBtcmForUsdm(usdmReserve, tradeReserve, sellAmount, slippage)
    } else if (tradeToken === 'ETHM') {
        return sellEthmForUsdm(usdmReserve, tradeReserve, sellAmount, slippage)
    }
}

export function buyBaseToken(tradeToken, usdmReserve, tradeReserve, buyAmount, slippage = _slippage) {
    if (tradeToken === 'BTCM') {
        return buyUsdmFromBtcm(usdmReserve, tradeReserve, buyAmount, slippage)
    } else if (tradeToken === 'ETHM') {
        return buyUsdmFromEthm(usdmReserve, tradeReserve, buyAmount, slippage)
    }
}

export function sellBaseToken(tradeToken, usdmReserve, tradeReserve, sellAmount, slippage = _slippage) {
    if (tradeToken === 'BTCM') {
        return sellUsdmForBtcm(usdmReserve, tradeReserve, sellAmount, slippage)
    } else if (tradeToken === 'ETHM') {
        return sellUsdmForEthm(usdmReserve, tradeReserve, sellAmount, slippage)
    }
}

export function calculatePriceImpact(midPrice, inputAmount, outputAmount) {
    try {
        // console.info("calculatePriceImpact inputAmount:", inputAmount);
        // console.info("calculatePriceImpact outputAmount:", outputAmount);
        const _inputAmountValue = bigNumberToFixed(bigNumberTimes(inputAmount.raw.toString(), (1 - getTransactionFeeRatio())), 0)
        const _outputAmountValue = bigNumberTimes(outputAmount.raw.toString(), 1)
        // console.info("calculatePriceImpact _inputAmountValue:", _inputAmountValue);
        // console.info("calculatePriceImpact _outputAmountValue:", _outputAmountValue);

        const _newInputAmount = new TokenAmount(
            inputAmount.token,
            _inputAmountValue
        )
        const _newOutputAmount = new TokenAmount(
            outputAmount.token,
            _outputAmountValue
        )
        // console.info("calculatePriceImpact _newInputAmount:", _newInputAmount);
        // console.info("calculatePriceImpact _newOutputAmount:", _newOutputAmount);
        // const _quotedOutputAmount = midPrice.quote(_newInputAmount)
        // console.info("calculatePriceImpact _quotedOutputAmount:", _quotedOutputAmount.toFixed(6));
        // console.info("calculatePriceImpact _newOutputAmount:", _newOutputAmount.toFixed(6));

        const _newPriceImpact = computePriceImpact(
            midPrice,
            _newInputAmount,
            _newOutputAmount
        )
        return _newPriceImpact.toFixed(2)
    } catch (error) {
        console.log("calculatePriceImpact error:", error);
        return '0'
    }
}

export function computePriceImpact(
    midPrice,
    inputAmount,
    outputAmount
) {
    const quotedOutputAmount = midPrice.quote(inputAmount)
    // calculate price impact := (exactQuote - outputAmount) / exactQuote
    const priceImpact = quotedOutputAmount.subtract(outputAmount).divide(quotedOutputAmount)
    return new Percent(priceImpact.numerator, priceImpact.denominator)
}

export function buyBtcmFromUsdm(usdmReserve, btcmReserve, btcmBuyAmount, slippage = _slippage) {
    console.log("buyBtcmFromUsdm - usdmReserve, btcmReserve, btcmBuyAmount:", usdmReserve, btcmReserve, btcmBuyAmount)
    const USDM_TO_BTCM = new Route(
        [getUsdmBtcmPair(usdmReserve, btcmReserve)],
        USDM
    );
    const trade = new Trade(
        USDM_TO_BTCM,
        new TokenAmount(BTCM, deleteScientificForTruncateNum(btcmBuyAmount)),
        TradeType.EXACT_OUTPUT
    );
    const percent = new Percent(slippage, "1000");
    const currencyAmountIn = trade.maximumAmountIn(percent);
    const newPriceImpact = calculatePriceImpact(USDM_TO_BTCM.midPrice, trade.inputAmount, trade.outputAmount)
    const output = {
        amountIn: trade.inputAmount.raw.toString(),
        maxAmountIn: currencyAmountIn.raw.toString(),
        priceImpact: newPriceImpact,
        originalPriceImpact: trade.priceImpact.toFixed()
    }
    console.info("buyBtcmFromUsdm output:", output);
    return output;
}

export function buyUsdmFromBtcm(usdmReserve, btcmReserve, usdmBuyAmount, slippage = _slippage) {
    console.log("buyUsdmFromBtcm - usdmReserve, btcmReserve, usdmBuyAmount:", usdmReserve, btcmReserve, usdmBuyAmount)

    const USDM_TO_BTCM = new Route(
        [getUsdmBtcmPair(usdmReserve, btcmReserve)],
        BTCM
    );
    const trade = new Trade(
        USDM_TO_BTCM,
        new TokenAmount(USDM, deleteScientificForTruncateNum(usdmBuyAmount)),
        TradeType.EXACT_OUTPUT
    );
    const percent = new Percent(slippage, "1000");
    const currencyAmountOut = trade.maximumAmountIn(percent);
    const newPriceImpact = calculatePriceImpact(USDM_TO_BTCM.midPrice, trade.inputAmount, trade.outputAmount)
    const output = {
        amountIn: trade.inputAmount.raw.toString(),
        maxAmountIn: currencyAmountOut.raw.toString(),
        priceImpact: newPriceImpact,
        originalPriceImpact: trade.priceImpact.toFixed()
    }
    console.info("buyUsdmFromBtcm output:", output);
    return output;
}

export function sellBtcmForUsdm(usdmReserve, btcmReserve, btcmSellAmount, slippage = _slippage) {
    console.log("sellBtcmForUsdm - usdmReserve, btcmReserve, btcmSellAmount:", usdmReserve, btcmReserve, btcmSellAmount)
    const USDM_TO_BTCM = new Route(
        [getUsdmBtcmPair(usdmReserve, btcmReserve)],
        BTCM
    );
    const trade = new Trade(
        USDM_TO_BTCM,
        new TokenAmount(BTCM, deleteScientificForTruncateNum(btcmSellAmount)),
        TradeType.EXACT_INPUT
    );
    const percent = new Percent(slippage, "1000");
    const currencyAmountOut = trade.minimumAmountOut(percent);
    const newPriceImpact = calculatePriceImpact(USDM_TO_BTCM.midPrice, trade.inputAmount, trade.outputAmount)
    const output = {
        amountOut: trade.outputAmount.raw.toString(),
        minAmountOut: currencyAmountOut.raw.toString(),
        priceImpact: newPriceImpact,
        originalPriceImpact: trade.priceImpact.toFixed()
    }
    console.info("sellBtcmForUsdm output:", output);
    return output;
}

export function sellUsdmForBtcm(usdmReserve, btcmReserve, usdmSellAmount, slippage = _slippage) {
    console.log("sellUsdmForBtcm - usdmReserve, btcmReserve, usdmSellAmount:", usdmReserve, btcmReserve, usdmSellAmount)
    const USDM_TO_BTCM = new Route(
        [getUsdmBtcmPair(usdmReserve, btcmReserve)],
        USDM
    );
    const trade = new Trade(
        USDM_TO_BTCM,
        new TokenAmount(USDM, deleteScientificForTruncateNum(usdmSellAmount)),
        TradeType.EXACT_INPUT
    );
    const percent = new Percent(slippage, "1000");
    const currencyAmountOut = trade.minimumAmountOut(percent);
    const newPriceImpact = calculatePriceImpact(USDM_TO_BTCM.midPrice, trade.inputAmount, trade.outputAmount)
    const output = {
        amountOut: trade.outputAmount.raw.toString(),
        minAmountOut: currencyAmountOut.raw.toString(),
        priceImpact: newPriceImpact,
        originalPriceImpact: trade.priceImpact.toFixed()
    }
    console.info("sellUsdmForBtcm output:", output);
    return output;
}

export function buyEthmFromUsdm(usdmReserve, ethmReserve, ethmBuyAmount, slippage = _slippage) {
    console.log("buyEthmFromUsdm - usdmReserve, ethmReserve, ethmBuyAmount:", usdmReserve, ethmReserve, ethmBuyAmount)
    const USDM_TO_ETHM = new Route(
        [getUsdmEthmPair(usdmReserve, ethmReserve)],
        USDM
    );
    const trade = new Trade(
        USDM_TO_ETHM,
        new TokenAmount(ETHM, deleteScientificForTruncateNum(ethmBuyAmount)),
        TradeType.EXACT_OUTPUT
    );
    const percent = new Percent(slippage, "1000");
    const currencyAmountIn = trade.maximumAmountIn(percent);
    const newPriceImpact = calculatePriceImpact(USDM_TO_ETHM.midPrice, trade.inputAmount, trade.outputAmount)
    const output = {
        amountIn: trade.inputAmount.raw.toString(),
        maxAmountIn: currencyAmountIn.raw.toString(),
        priceImpact: newPriceImpact,
        originalPriceImpact: trade.priceImpact.toFixed()
    }
    console.info("buyEthmFromUsdm output:", output);
    return output;
}

export function buyUsdmFromEthm(usdmReserve, ethmReserve, usdmBuyAmount, slippage = _slippage) {
    console.log("buyUsdmFromEthm - usdmReserve, ethmReserve, usdmBuyAmount:", usdmReserve, ethmReserve, usdmBuyAmount)
    const USDM_TO_ETHM = new Route(
        [getUsdmEthmPair(usdmReserve, ethmReserve)],
        ETHM
    );
    const trade = new Trade(
        USDM_TO_ETHM,
        new TokenAmount(USDM, deleteScientificForTruncateNum(usdmBuyAmount)),
        TradeType.EXACT_OUTPUT
    );
    const percent = new Percent(slippage, "1000");
    const currencyAmountIn = trade.maximumAmountIn(percent);
    const newPriceImpact = calculatePriceImpact(USDM_TO_ETHM.midPrice, trade.inputAmount, trade.outputAmount)
    const output = {
        amountIn: trade.inputAmount.raw.toString(),
        maxAmountIn: currencyAmountIn.raw.toString(),
        priceImpact: newPriceImpact,
        originalPriceImpact: trade.priceImpact.toFixed()
    }
    console.info("buyUsdmFromEthm output:", output);
    return output;
}

export function sellEthmForUsdm(usdmReserve, ethmReserve, ethmSellAmount, slippage = _slippage) {
    console.log("sellEthmForUsdm - usdmReserve, ethmReserve, ethmSellAmount:", usdmReserve, ethmReserve, ethmSellAmount)
    const USDM_TO_ETHM = new Route(
        [getUsdmEthmPair(usdmReserve, ethmReserve)],
        ETHM
    );
    const trade = new Trade(
        USDM_TO_ETHM,
        new TokenAmount(ETHM, deleteScientificForTruncateNum(ethmSellAmount)),
        TradeType.EXACT_INPUT
    );
    const percent = new Percent(slippage, "1000");
    const currencyAmountOut = trade.minimumAmountOut(percent);
    const newPriceImpact = calculatePriceImpact(USDM_TO_ETHM.midPrice, trade.inputAmount, trade.outputAmount)
    const output = {
        amountOut: trade.outputAmount.raw.toString(),
        minAmountOut: currencyAmountOut.raw.toString(),
        priceImpact: newPriceImpact,
        originalPriceImpact: trade.priceImpact.toFixed()
    }
    console.info("sellEthmForUsdm output:", output);
    return output;
}

export function sellUsdmForEthm(usdmReserve, ethmReserve, usdmSellAmount, slippage = _slippage) {
    console.log("sellUsdmForEthm - usdmReserve, ethmReserve, usdmSellAmount:", usdmReserve, ethmReserve, usdmSellAmount)
    const USDM_TO_ETHM = new Route(
        [getUsdmEthmPair(usdmReserve, ethmReserve)],
        USDM
    );
    const trade = new Trade(
        USDM_TO_ETHM,
        new TokenAmount(USDM, deleteScientificForTruncateNum(usdmSellAmount)),
        TradeType.EXACT_INPUT
    );
    const percent = new Percent(slippage, "1000");
    const currencyAmountOut = trade.minimumAmountOut(percent);
    const newPriceImpact = calculatePriceImpact(USDM_TO_ETHM.midPrice, trade.inputAmount, trade.outputAmount)
    const output = {
        amountOut: trade.outputAmount.raw.toString(),
        minAmountOut: currencyAmountOut.raw.toString(),
        priceImpact: newPriceImpact,
        originalPriceImpact: trade.priceImpact.toFixed()
    }
    console.info("sellUsdmForEthm output:", output);
    return output;
}
