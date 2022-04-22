pragma solidity =0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IPoolCustomer.sol";

interface IPriceAdjust {
    function initialize(IPoolCustomer _pool) external;

    function getPool() external view returns (address);

    function setPool(IPoolCustomer poolAddr) external;

    function adjust(
        string calldata tokenName,
        ERC20 tokenAddr,
        int256 targetPrice,
        uint8 decimals
    ) external;

    function topUp(ERC20 tokenAddr, uint256 amount) external;

    function getOwner() external view returns (address);

    function getBackends() external view returns (address[] memory);

    function getManagers() external view returns (address[] memory);

    function transferOwnership(address newOwner) external;

    function grantBackend(address backendAddr) external;

    function grantManager(address managerAddr) external;

    function revokeBackend(address backendAddr) external;

    function revokeManager(address managerAddr) external;
}
