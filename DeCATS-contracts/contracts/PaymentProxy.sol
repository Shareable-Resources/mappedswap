pragma solidity =0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interfaces/ERC223/IERC223.sol";
import "./interfaces/IPaymentProxy.sol";

contract PaymentProxy is IPaymentProxy {
    using SafeMath for uint256;

    mapping(uint256 => Round) private rounds;

    uint256 private nextRoundID;

    function getRound(uint256 roundID) external view override returns (Round memory) {
        return rounds[roundID];
    }

    function roundCount() external view override returns (uint256) {
        return nextRoundID;
    }

    function depositToNewRound(
        address token,
        address spender,
        address recipient,
        uint256 amount
    ) external override returns (uint256 roundID) {
        require(token != address(0) && spender != address(0) && recipient != address(0), "Zero address is given");
        require(amount > 0, "Amount is 0");

        roundID = nextRoundID++;
        rounds[roundID] = Round(token, msg.sender, spender, recipient, amount);

        emit NewRound(roundID, token, msg.sender, spender, recipient, amount);
        SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), amount);
    }

    function withdrawFromRound(uint256 roundID) external override {
        Round storage ptr = rounds[roundID];
        Round memory round = ptr;
        require(round.funder == msg.sender, "Not the funder");
        require(round.amount > 0, "No remaining tokens");

        ptr.amount = 0;

        emit RoundCancel(roundID);
        SafeERC20.safeTransfer(IERC20(round.token), msg.sender, round.amount);
    }

    function transfer(uint256 roundID, uint256 amount) external override {
        Round storage ptr = rounds[roundID];
        Round memory round = ptr;
        require(round.spender == msg.sender, "Not the spender");

        ptr.amount = ptr.amount.sub(amount);
        _transfer(roundID, round.token, round.recipient, amount);
    }

    function transferMultiple(uint256 roundID, uint256[] calldata amounts) external override {
        Round storage ptr = rounds[roundID];
        Round memory round = ptr;
        require(round.spender == msg.sender, "Not the spender");

        for (uint256 i = 0; i < amounts.length; i++) {
            uint256 amount = amounts[i];
            ptr.amount = ptr.amount.sub(amount);
            _transfer(roundID, round.token, round.recipient, amount);
        }
    }

    function _transfer(
        uint256 roundID,
        address token,
        address recipient,
        uint256 amount
    ) private validAmount(amount) {
        emit Transfer(roundID, amount);
        SafeERC20.safeTransfer(IERC20(token), recipient, amount);
    }

    function transferWithData(
        uint256 roundID,
        uint256 amount,
        bytes calldata data
    ) external override {
        Round storage ptr = rounds[roundID];
        Round memory round = ptr;
        require(round.spender == msg.sender, "Not the spender");

        ptr.amount = ptr.amount.sub(amount);
        _transferWithData(roundID, round.token, round.recipient, amount, data);
    }

    function transferMultipleWithData(
        uint256 roundID,
        uint256[] calldata amounts,
        bytes[] calldata data
    ) external override {
        Round storage ptr = rounds[roundID];
        Round memory round = ptr;
        require(round.spender == msg.sender, "Not the spender");
        require(amounts.length == data.length, "Length of arrays not match");

        for (uint256 i = 0; i < amounts.length; i++) {
            uint256 amount = amounts[i];
            ptr.amount = ptr.amount.sub(amount);
            _transferWithData(roundID, round.token, round.recipient, amount, data[i]);
        }
    }

    function _transferWithData(
        uint256 roundID,
        address token,
        address recipient,
        uint256 amount,
        bytes memory data
    ) private validAmount(amount) {
        emit Transfer(roundID, amount);
        require(IERC223(token).transfer(recipient, amount, data), "Transfer failed");
    }

    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount is 0");
        _;
    }
}
