pragma solidity =0.6.6;

import "./IOwnable.sol";

interface IHashedKeyStorage is IOwnable {
    function initialize() external;

    function hashes(bytes32 hashedKey) external view returns (bytes32);

    function proposals(bytes32 hashedKey) external view returns (bytes32);

    function verifyData(bytes32 hashedKey, bytes calldata data) external view returns (bool);

    function insertData(bytes32 hashedKey, bytes calldata data) external;

    function updateData(bytes32 hashedKey, bytes calldata data) external;

    function approveData(bytes32 hashedKey, bytes calldata data) external;

    function getInserters() external view returns (address[] memory);

    function getUpdaters() external view returns (address[] memory);

    function getApprovers() external view returns (address[] memory);

    function grantInserter(address inserterAddr) external;

    function grantUpdater(address updaterAddr) external;

    function grantApprover(address approverAddr) external;

    function revokeInserter(address inserterAddr) external;

    function revokeUpdater(address updaterAddr) external;

    function revokeApprover(address approverAddr) external;

    event DataInserted(address indexed inserter, bytes32 indexed hashedKey, bytes32 dataHash);

    event UpdateProposed(address indexed updater, bytes32 indexed hashedKey, bytes32 oldDataHash, bytes32 newDataHash);

    event UpdateApproved(address indexed approver, bytes32 indexed hashedKey, bytes32 dataHash);
}
