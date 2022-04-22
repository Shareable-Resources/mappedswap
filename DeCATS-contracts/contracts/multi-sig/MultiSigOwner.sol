pragma solidity =0.6.6;

import "@openzeppelin/contracts/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IAccessControl.sol";
import "../interfaces/IOwnable.sol";
import "../proxy/OwnedBeaconProxy.sol";
import "../proxy/OwnedUpgradeableProxy.sol";
import "./MultiSigWallet.sol";

contract MultiSigOwner is ERC165, MultiSigWallet {
    /**
     * @dev This MultiSigOwner adds some wrapper to make submitting common functions easier
     * For some more specific functions, use the traditional way submitTransaction()
     */
    constructor(address[] memory _owners, uint256 _required) public MultiSigWallet(_owners, _required) {
        // Use this interface to make sure contract have basic functions to execute
        _registerInterface(submitTransaction.selector ^ confirmTransaction.selector ^ revokeConfirmation.selector ^ executeTransaction.selector);
    }

    /// @dev Wrapper function to make calling internal functions easier
    function submitInternalAddOwner(address owner) external returns (uint256 transactionId) {
        transactionId = submitInternalAddOwnerWithExpiry(DEFAULT_EXPIRY_SECONDS, owner);
    }

    function submitInternalAddOwnerWithExpiry(uint64 expirySeconds, address owner) public returns (uint256 transactionId) {
        transactionId = submitTransactionWithExpiry(expirySeconds, address(this), 0, abi.encodeWithSelector(MultiSigWallet.addOwner.selector, owner));
    }

    function submitInternalRemoveOwner(address owner) external returns (uint256 transactionId) {
        transactionId = submitInternalRemoveOwnerWithExpiry(DEFAULT_EXPIRY_SECONDS, owner);
    }

    function submitInternalRemoveOwnerWithExpiry(uint64 expirySeconds, address owner) public returns (uint256 transactionId) {
        transactionId = submitTransactionWithExpiry(expirySeconds, address(this), 0, abi.encodeWithSelector(MultiSigWallet.removeOwner.selector, owner));
    }

    function submitInternalReplaceOwner(address owner, address newOwner) external returns (uint256 transactionId) {
        transactionId = submitInternalReplaceOwnerWithExpiry(DEFAULT_EXPIRY_SECONDS, owner, newOwner);
    }

    function submitInternalReplaceOwnerWithExpiry(
        uint64 expirySeconds,
        address owner,
        address newOwner
    ) public returns (uint256 transactionId) {
        transactionId = submitTransactionWithExpiry(expirySeconds, address(this), 0, abi.encodeWithSelector(MultiSigWallet.replaceOwner.selector, owner, newOwner));
    }

    function submitInternalChangeRequirement(uint256 _required) external returns (uint256 transactionId) {
        transactionId = submitInternalChangeRequirementWithExpiry(DEFAULT_EXPIRY_SECONDS, _required);
    }

    function submitInternalChangeRequirementWithExpiry(uint64 expirySeconds, uint256 _required) public returns (uint256 transactionId) {
        transactionId = submitTransactionWithExpiry(expirySeconds, address(this), 0, abi.encodeWithSelector(MultiSigWallet.changeRequirement.selector, _required));
    }

    /**
     * @dev Used by OwnedBeaconProxy and OwnedUpgradeableProxy
     * Accept list of proxies
     */
    function submitProxyChangeAdmins(address[] calldata proxies, address newAdmin) external returns (uint256[] memory transactionIds) {
        transactionIds = submitProxyChangeAdminsWithExpiry(DEFAULT_EXPIRY_SECONDS, proxies, newAdmin);
    }

    function submitProxyChangeAdminsWithExpiry(
        uint64 expirySeconds,
        address[] memory proxies,
        address newAdmin
    ) public returns (uint256[] memory transactionIds) {
        transactionIds = new uint256[](proxies.length);
        for (uint256 i = 0; i < proxies.length; i++) {
            transactionIds[i] = submitTransactionWithExpiry(expirySeconds, proxies[i], 0, abi.encodeWithSelector(OwnedUpgradeableProxy.changeAdmin.selector, newAdmin));
        }
    }

    /// @dev Used by OwnedUpgradeableProxy
    function submitProxyUpgradeTo(address proxy, address newImplementation) external returns (uint256 transactionId) {
        transactionId = submitProxyUpgradeToWithExpiry(DEFAULT_EXPIRY_SECONDS, proxy, newImplementation);
    }

    function submitProxyUpgradeToWithExpiry(
        uint64 expirySeconds,
        address proxy,
        address newImplementation
    ) public returns (uint256 transactionId) {
        transactionId = submitTransactionWithExpiry(expirySeconds, proxy, 0, abi.encodeWithSelector(OwnedUpgradeableProxy.upgradeTo.selector, newImplementation));
    }

    /**
     * @dev Used by OwnedBeaconProxy
     * Change which beacon to be used is rare, normally only the one below is used
     */
    function submitProxyUpgradeBeaconTo(address proxy, address newBeacon) external returns (uint256 transactionId) {
        transactionId = submitProxyUpgradeBeaconToWithExpiry(DEFAULT_EXPIRY_SECONDS, proxy, newBeacon);
    }

    function submitProxyUpgradeBeaconToWithExpiry(
        uint64 expirySeconds,
        address proxy,
        address newBeacon
    ) public returns (uint256 transactionId) {
        transactionId = submitTransactionWithExpiry(expirySeconds, proxy, 0, abi.encodeWithSelector(OwnedBeaconProxy.upgradeBeaconTo.selector, newBeacon));
    }

    /**
     * @dev Used by UpgradeableBeacon
     * Actually the selector is same as normal proxy's upgradeTo
     * Make a separated function just for clearer meaning
     */
    function submitBeaconUpgradeTo(address beacon, address newImplementation) external returns (uint256 transactionId) {
        transactionId = submitBeaconUpgradeToWithExpiry(DEFAULT_EXPIRY_SECONDS, beacon, newImplementation);
    }

    function submitBeaconUpgradeToWithExpiry(
        uint64 expirySeconds,
        address beacon,
        address newImplementation
    ) public returns (uint256 transactionId) {
        transactionId = submitTransactionWithExpiry(expirySeconds, beacon, 0, abi.encodeWithSelector(UpgradeableBeacon.upgradeTo.selector, newImplementation));
    }

    /**
     * @dev This contract is normally the owner of many contracts
     * Allow submit transfer / renounce ownership at once
     * UpgradeableBeacon is also Ownable, remember to transfer its ownership as well
     */
    function submitTransferOwnerships(address[] calldata contractAddresses, address newOwner) external returns (uint256[] memory transactionIds) {
        transactionIds = submitTransferOwnershipsWithExpiry(DEFAULT_EXPIRY_SECONDS, contractAddresses, newOwner);
    }

    function submitTransferOwnershipsWithExpiry(
        uint64 expirySeconds,
        address[] memory contractAddresses,
        address newOwner
    ) public returns (uint256[] memory transactionIds) {
        transactionIds = new uint256[](contractAddresses.length);
        for (uint256 i = 0; i < contractAddresses.length; i++) {
            transactionIds[i] = submitTransactionWithExpiry(expirySeconds, contractAddresses[i], 0, abi.encodeWithSelector(IOwnable.transferOwnership.selector, newOwner));
        }
    }

    function submitRenounceOwnerships(address[] calldata contractAddresses) external returns (uint256[] memory transactionIds) {
        transactionIds = submitRenounceOwnershipsWithExpiry(DEFAULT_EXPIRY_SECONDS, contractAddresses);
    }

    function submitRenounceOwnershipsWithExpiry(uint64 expirySeconds, address[] memory contractAddresses) public returns (uint256[] memory transactionIds) {
        transactionIds = new uint256[](contractAddresses.length);
        for (uint256 i = 0; i < contractAddresses.length; i++) {
            transactionIds[i] = submitTransactionWithExpiry(expirySeconds, contractAddresses[i], 0, abi.encodeWithSelector(IOwnable.renounceOwnership.selector));
        }
    }

    /**
     * @dev It is common to grant / revoke role to multiple accounts at the same time
       So these 2 functions accept array of accounts
     */
    function submitGrantRoles(
        address contractAddress,
        bytes32 role,
        address[] calldata accounts
    ) external returns (uint256[] memory transactionIds) {
        transactionIds = submitGrantRolesWithExpiry(DEFAULT_EXPIRY_SECONDS, contractAddress, role, accounts);
    }

    function submitGrantRolesWithExpiry(
        uint64 expirySeconds,
        address contractAddress,
        bytes32 role,
        address[] memory accounts
    ) public returns (uint256[] memory transactionIds) {
        transactionIds = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            transactionIds[i] = submitTransactionWithExpiry(expirySeconds, contractAddress, 0, abi.encodeWithSelector(IAccessControl.grantRole.selector, role, accounts[i]));
        }
    }

    function submitRevokeRoles(
        address contractAddress,
        bytes32 role,
        address[] calldata accounts
    ) external returns (uint256[] memory transactionIds) {
        transactionIds = submitRevokeRolesWithExpiry(DEFAULT_EXPIRY_SECONDS, contractAddress, role, accounts);
    }

    function submitRevokeRolesWithExpiry(
        uint64 expirySeconds,
        address contractAddress,
        bytes32 role,
        address[] memory accounts
    ) public returns (uint256[] memory transactionIds) {
        transactionIds = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            transactionIds[i] = submitTransactionWithExpiry(expirySeconds, contractAddress, 0, abi.encodeWithSelector(IAccessControl.revokeRole.selector, role, accounts[i]));
        }
    }

    /**
     * @dev Renounce role is only for self
     * No need to pass account to function
     */
    function submitRenounceRole(address contractAddress, bytes32 role) external returns (uint256 transactionId) {
        transactionId = submitRenounceRoleWithExpiry(DEFAULT_EXPIRY_SECONDS, contractAddress, role);
    }

    function submitRenounceRoleWithExpiry(
        uint64 expirySeconds,
        address contractAddress,
        bytes32 role
    ) public returns (uint256 transactionId) {
        transactionId = submitTransactionWithExpiry(expirySeconds, contractAddress, 0, abi.encodeWithSelector(IAccessControl.renounceRole.selector, role, address(this)));
    }

    /**
     * @dev Common ERC20 functions
     */
    function submitERC20Transfer(
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external returns (uint256 transactionId) {
        transactionId = submitERC20TransferWithExpiry(DEFAULT_EXPIRY_SECONDS, tokenAddress, recipient, amount);
    }

    function submitERC20TransferWithExpiry(
        uint64 expirySeconds,
        address tokenAddress,
        address recipient,
        uint256 amount
    ) public returns (uint256 transactionId) {
        transactionId = submitTransactionWithExpiry(expirySeconds, tokenAddress, 0, abi.encodeWithSelector(IERC20.transfer.selector, recipient, amount));
    }

    function submitERC20TransferFrom(
        address tokenAddress,
        address sender,
        address recipient,
        uint256 amount
    ) external returns (uint256 transactionId) {
        transactionId = submitERC20TransferFromWithExpiry(DEFAULT_EXPIRY_SECONDS, tokenAddress, sender, recipient, amount);
    }

    function submitERC20TransferFromWithExpiry(
        uint64 expirySeconds,
        address tokenAddress,
        address sender,
        address recipient,
        uint256 amount
    ) public returns (uint256 transactionId) {
        transactionId = submitTransactionWithExpiry(expirySeconds, tokenAddress, 0, abi.encodeWithSelector(IERC20.transferFrom.selector, sender, recipient, amount));
    }

    function submitERC20Approve(
        address tokenAddress,
        address spender,
        uint256 amount
    ) external returns (uint256 transactionId) {
        transactionId = submitERC20ApproveWithExpiry(DEFAULT_EXPIRY_SECONDS, tokenAddress, spender, amount);
    }

    function submitERC20ApproveWithExpiry(
        uint64 expirySeconds,
        address tokenAddress,
        address spender,
        uint256 amount
    ) public returns (uint256 transactionId) {
        transactionId = submitTransactionWithExpiry(expirySeconds, tokenAddress, 0, abi.encodeWithSelector(IERC20.approve.selector, spender, amount));
    }

    /// @dev Work on multiple transaction ids at once
    function confirmTransactions(uint256[] calldata transactionIds) external {
        for (uint256 i = 0; i < transactionIds.length; i++) {
            confirmTransaction(transactionIds[i]);
        }
    }

    function revokeConfirmations(uint256[] calldata transactionIds) external {
        for (uint256 i = 0; i < transactionIds.length; i++) {
            revokeConfirmation(transactionIds[i]);
        }
    }

    function executeTransactions(uint256[] calldata transactionIds) external {
        for (uint256 i = 0; i < transactionIds.length; i++) {
            executeTransaction(transactionIds[i]);
        }
    }
}
