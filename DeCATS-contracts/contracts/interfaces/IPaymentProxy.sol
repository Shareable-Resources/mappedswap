pragma solidity =0.6.6;
pragma experimental ABIEncoderV2;

interface IPaymentProxy {
    function getRound(uint256 roundID) external view returns (Round memory);

    function roundCount() external view returns (uint256);

    function depositToNewRound(
        address token,
        address spender,
        address recipient,
        uint256 amount
    ) external returns (uint256 roundID);

    function withdrawFromRound(uint256 roundID) external;

    function transfer(uint256 roundID, uint256 amount) external;

    function transferMultiple(uint256 roundID, uint256[] calldata amounts) external;

    function transferWithData(
        uint256 roundID,
        uint256 amount,
        bytes calldata data
    ) external;

    function transferMultipleWithData(
        uint256 roundID,
        uint256[] calldata amounts,
        bytes[] calldata data
    ) external;

    event NewRound(uint256 roundID, address token, address indexed funder, address indexed spender, address indexed recipient, uint256 amount);

    event RoundCancel(uint256 roundID);

    event Transfer(uint256 roundID, uint256 amount);

    struct Round {
        address token;
        address funder;
        address spender;
        address recipient;
        uint256 amount;
    }
}
