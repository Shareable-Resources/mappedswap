//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

interface IFixedRateExchange {
    function WEUN() external view returns (address);

    function getRate(
        address provider,
        address tokenIn,
        address tokenOut
    ) external view returns (Rate memory);

    function setRate(
        address tokenIn,
        address tokenOut,
        uint256 equivalentIn,
        uint256 equivalentOut,
        uint256 fixedFee
    ) external;

    function getReserve(address provider, address tokenOut) external view returns (uint256);

    function getAmountOut(
        address provider,
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut);

    function getAmountIn(
        address provider,
        address tokenIn,
        address tokenOut,
        uint256 amountOut
    ) external view returns (uint256 amountIn);

    function exchangeFromExactAmount(
        address provider,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external;

    function exchangeFromExactAmount(
        address provider,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        address recipient
    ) external;

    function exchangeToExactAmount(
        address provider,
        address tokenIn,
        address tokenOut,
        uint256 amountOut,
        uint256 amountInMax
    ) external;

    function exchangeToExactAmount(
        address provider,
        address tokenIn,
        address tokenOut,
        uint256 amountOut,
        uint256 amountInMax,
        address recipient
    ) external;

    function exchangeFromExactEUN(
        address provider,
        address tokenOut,
        uint256 amountOutMin
    ) external payable;

    function exchangeFromExactEUN(
        address provider,
        address tokenOut,
        uint256 amountOutMin,
        address recipient
    ) external payable;

    function exchangeEUNToExactAmount(
        address provider,
        address tokenOut,
        uint256 amountOut,
        uint256 amountInMax
    ) external payable;

    function exchangeEUNToExactAmount(
        address provider,
        address tokenOut,
        uint256 amountOut,
        uint256 amountInMax,
        address recipient
    ) external payable;

    function exchangeExactAmountToEUN(
        address provider,
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin
    ) external;

    function exchangeExactAmountToEUN(
        address provider,
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin,
        address recipient
    ) external;

    function exchangeToExactEUN(
        address provider,
        address tokenIn,
        uint256 amountOut,
        uint256 amountInMax
    ) external;

    function exchangeToExactEUN(
        address provider,
        address tokenIn,
        uint256 amountOut,
        uint256 amountInMax,
        address recipient
    ) external;

    function wrapEUN(address recipient) external payable;

    function unwrapWEUN(uint256 amount, address recipient) external;

    event ExchangeRate(address indexed provider, address indexed tokenIn, address indexed tokenOut, uint256 numerator, uint256 denominator, uint256 fixedFee);

    event Exchange(address indexed from, address indexed provider, address indexed recipient, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    struct Rate {
        uint256 numerator;
        uint256 denominator;
        uint256 fixedFee;
    }
}
