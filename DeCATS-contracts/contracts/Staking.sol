pragma solidity =0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/introspection/ERC165Upgradeable.sol";
import "./interfaces/IStaking.sol";

contract Staking is OwnableUpgradeable, ERC165Upgradeable, IStaking {
    using SafeMath for uint256;

    bytes4 private constant ERC1363RECEIVER_RETURN = bytes4(keccak256("onTransferReceived(address,address,uint256,bytes)"));
    uint8 private constant NOT_ENTERED = 1;
    uint8 private constant ENTERED = 2;

    uint8 public constant override STAKE_REWARDS = 0;
    uint8 public constant override FREE_STAKING = 1;
    uint8 public constant override PROMOTION_REWARDS = 2;

    struct User {
        uint256 freeStakingAmount;
        uint112 redeemStart;
        uint112 redeemLast;
    }

    struct LockedStakingUser {
        uint64 start;
        uint64 last;
    }

    /// @dev stakeType 0 = locked, 1 = free, 2 = rewards, ...
    struct LockedStakingNode {
        uint256 initialStakeAmount;
        uint256 remainAmount;
        uint64 stakeTime;
        uint64 unlockInterval;
        uint64 division;
        uint64 next;
        address sourceAddr;
        uint8 stakeType;
    }

    struct RedemptionNode {
        uint256 lockedStakingAmount;
        uint64 requestTime;
        uint112 next;
        bytes10 __unsed;
        uint256 freeStakingAmount;
    }

    mapping(address => bool) private stakeable;

    mapping(address => uint256) private freeStakings;

    mapping(address => mapping(address => User)) private users;

    mapping(uint112 => RedemptionNode) private redemptionNodes;

    uint8 private directCalling;

    uint112 private nextNodeID;

    uint64 private redeemWaitPeriod;

    mapping(bytes32 => bool) private stakeHashes;

    mapping(address => mapping(address => LockedStakingUser)) private lockedStakingUsers;

    mapping(uint64 => LockedStakingNode) private lockedStakingNodes;

    uint64 private nextLockedStakingNodeID;

    address private _lockedStakingAdder;

    mapping(address => uint256) private lockedStakings;

    mapping(address => uint256) private freeRedemptions;

    mapping(address => uint256) private lockedRedemptions;

    function initialize(uint64 _redeemWaitPeriod) external override initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __ERC165_init_unchained();

        directCalling = NOT_ENTERED;
        nextNodeID = 1;
        redeemWaitPeriod = _redeemWaitPeriod;
        nextLockedStakingNodeID = 1;

        IStaking i;
        _registerInterface(i.tokenReceived.selector);
        _registerInterface(i.onTokenTransfer.selector);
        _registerInterface(i.onTransferReceived.selector);
    }

    function owner() public view override(OwnableUpgradeable, IOwnable) returns (address) {
        return OwnableUpgradeable.owner();
    }

    function renounceOwnership() public override(OwnableUpgradeable, IOwnable) {
        OwnableUpgradeable.renounceOwnership();
    }

    function transferOwnership(address newOwner) public override(OwnableUpgradeable, IOwnable) {
        address _owner = owner();
        require(_owner != newOwner, "Ownable: self ownership transfer");

        OwnableUpgradeable.transferOwnership(newOwner);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165Upgradeable, IERC165) returns (bool) {
        return ERC165Upgradeable.supportsInterface(interfaceId);
    }

    function tokenReceived(
        address from,
        uint256 amount,
        bytes calldata data
    ) external override {
        transferCallback(from, amount, data);
    }

    function onTokenTransfer(
        address from,
        uint256 amount,
        bytes calldata data
    ) external override returns (bool) {
        transferCallback(from, amount, data);
        return true;
    }

    function onTransferReceived(
        address,
        address from,
        uint256 value,
        bytes calldata data
    ) external override returns (bytes4) {
        transferCallback(from, value, data);
        return ERC1363RECEIVER_RETURN;
    }

    function transferCallback(
        address from,
        uint256 value,
        bytes memory data
    ) private {
        if (directCalling == ENTERED) {
            return;
        }

        // Transfer token without data = normal staking
        if (data.length == 0) {
            stake(_msgSender(), from, value);
            return;
        }

        // If transfer contains data, this becomes adding promotion rewards
        address userAddr;
        require(data.length == 32, "incorrect data format");
        assembly {
            userAddr := mload(add(data, 32))
        }

        addPromotionRewards(_msgSender(), from, userAddr, value);
    }

    function isTokenStakeable(IERC20 tokenAddr) external view override returns (bool) {
        return stakeable[address(tokenAddr)];
    }

    function setTokenStakeability(IERC20 tokenAddr, bool stakeability) external override onlyOwner {
        stakeable[address(tokenAddr)] = stakeability;
    }

    function getRedeemWaitPeriod() external view override returns (uint64) {
        return redeemWaitPeriod;
    }

    function setRedeemWaitPeriod(uint64 newRedeemWaitPeriod) external override onlyOwner {
        redeemWaitPeriod = newRedeemWaitPeriod;
    }

    function lockedStakingAdder() external view override returns (address) {
        return _lockedStakingAdder;
    }

    function setLockedStakingAdder(address adderAddr) external override onlyOwner {
        _lockedStakingAdder = adderAddr;
    }

    function stakeToken(IERC20 tokenAddr, uint256 amount) external override skipTransferCallback {
        address sender = _msgSender();
        SafeERC20.safeTransferFrom(tokenAddr, sender, address(this), amount);
        stake(address(tokenAddr), sender, amount);
    }

    function stake(
        address tokenAddr,
        address from,
        uint256 amount
    ) private {
        require(stakeable[tokenAddr], "Token is not stakeable");
        require(from != address(0), "Invalid sender");
        require(amount > 0, "Invalid amount");

        // Simply update stake record
        // Also update token deposited here because it must be transferred at the same time
        freeStakings[tokenAddr] = freeStakings[tokenAddr].add(amount);
        users[tokenAddr][from].freeStakingAmount = users[tokenAddr][from].freeStakingAmount.add(amount);

        emit StakeToken(tokenAddr, from, amount);
    }

    function addLockedStaking(
        IERC20 tokenAddr,
        address poolAddr,
        address userAddr,
        uint256 amount,
        uint64 stakeTime,
        uint64 nodeID,
        bytes32 stakeHash,
        uint64 unlockInterval,
        uint64 division
    ) external override onlyLockedStakingAdder {
        address token = address(tokenAddr);

        {
            // Basic checking
            require(stakeable[token], "Token is not stakeable");
            require(amount > 0 && unlockInterval > 0 && division > 0, "Invalid parameter(s)");
            require(userAddr != address(0), "Address receiving the staking cannot be 0");

            // Every staking on Ethereum can produce an unique stakeHash, it can be used only once
            require(stakeHashes[stakeHash] == false, "This staking has been already added");
            stakeHashes[stakeHash] = true;

            // Verify the hash
            // However this cannot prove the staking is real, just to make sure input data is correct
            bytes32 verifyHash = keccak256(abi.encodePacked(poolAddr, userAddr, amount, stakeTime, nodeID));
            require(stakeHash == verifyHash, "The stakeHash is incorrect");
        }

        // Add the node, note that this function does not need token transfer at the same time
        appendNewLockedStakingNode(token, userAddr, amount, stakeTime, unlockInterval, division, poolAddr, STAKE_REWARDS);
        emit AddLockedStaking(token, poolAddr, userAddr, amount, stakeTime, nodeID, unlockInterval, division);
    }

    function addPromotionRewards(
        address tokenAddr,
        address sender,
        address userAddr,
        uint256 amount
    ) private {
        // This function can only be called by transfer token with ERC223/677/1363 and bring correct data
        require(stakeable[tokenAddr], "Token is not stakeable");
        require(amount > 0, "Invalid parameter");
        require(userAddr != address(0), "Address receiving the staking cannot be 0");

        appendNewLockedStakingNode(tokenAddr, userAddr, amount, uint64(block.timestamp), 0, 1, sender, PROMOTION_REWARDS);
        emit AddPromotionRewards(tokenAddr, sender, userAddr, amount);
    }

    function appendNewLockedStakingNode(
        address tokenAddr,
        address userAddr,
        uint256 amount,
        uint64 stakeTime,
        uint64 unlockInterval,
        uint64 division,
        address sourceAddr,
        uint8 stakeType
    ) private {
        // Update total staking amount
        lockedStakings[tokenAddr] = lockedStakings[tokenAddr].add(amount);

        // Add a new node and append to list
        uint64 lockedStakingNodeID = newLockedStakingNode(amount, stakeTime, unlockInterval, division, sourceAddr, stakeType);
        LockedStakingUser storage ptr = lockedStakingUsers[tokenAddr][userAddr];
        LockedStakingUser memory user = ptr;
        if (user.start == 0) {
            ptr.start = lockedStakingNodeID;
        } else {
            lockedStakingNodes[user.last].next = lockedStakingNodeID;
        }
        ptr.last = lockedStakingNodeID;
    }

    function newLockedStakingNode(
        uint256 amount,
        uint64 stakeTime,
        uint64 unlockInterval,
        uint64 division,
        address sourceAddr,
        uint8 stakeType
    ) private returns (uint64) {
        // Workaround of nextLockedStakingNodeID not initialized to 1
        uint64 lockedStakingNodeID;
        if (nextLockedStakingNodeID == 0) {
            lockedStakingNodeID = 1;
            nextLockedStakingNodeID = 2;
        } else {
            lockedStakingNodeID = nextLockedStakingNodeID++;
        }

        lockedStakingNodes[lockedStakingNodeID] = LockedStakingNode(amount, amount, stakeTime, unlockInterval, division, 0, sourceAddr, stakeType);
        return lockedStakingNodeID;
    }

    function redeemFromLockedStaking(
        address tokenAddr,
        address userAddr,
        uint256 maxRedeemAmount
    ) private returns (uint256) {
        LockedStakingUser storage ptr = lockedStakingUsers[tokenAddr][userAddr];
        LockedStakingUser memory user = ptr;

        // Deletion may occur during list traverse, so need the last nodeID
        uint64 nodeID = user.start;
        uint64 lastNodeID = 0;

        // Total amount can be redeemed from locked staking, must not larger than maxRedeemAmount
        uint256 redeemed = 0;

        while (nodeID != 0) {
            LockedStakingNode storage nodePtr = lockedStakingNodes[nodeID];
            LockedStakingNode memory node = nodePtr;

            // If nothing can be redeemed from this node, just move to the next one
            (, , uint256 maxRedeemableFromNode) = getRedeemableFromNode(node);
            if (maxRedeemableFromNode == 0) {
                lastNodeID = nodeID;
                nodeID = node.next;
                continue;
            }

            // The amount redeemed from this node can be fewer because of maxRedeemAmount bound
            // Find actual amount will be redeemed first
            uint256 willRedeemFromNode;
            bool breakLoop;
            if (redeemed.add(maxRedeemableFromNode) >= maxRedeemAmount) {
                willRedeemFromNode = maxRedeemAmount.sub(redeemed);
                breakLoop = true;
            } else {
                willRedeemFromNode = maxRedeemableFromNode;
                breakLoop = false;
            }
            redeemed = redeemed.add(willRedeemFromNode);

            // And after redeemed, if no more staking in this node, this node can be removed
            if (node.remainAmount == willRedeemFromNode) {
                // lastNodeID == 0 means current node is the first node
                // Deleting this node means update value in lockedStakingUsers
                if (lastNodeID == 0) {
                    ptr.start = node.next;
                } else {
                    lockedStakingNodes[lastNodeID].next = node.next;
                }

                delete lockedStakingNodes[nodeID];

                // In case of deleting the last node
                if (node.next == 0) {
                    ptr.last = lastNodeID;
                }

                if (breakLoop) {
                    break;
                }

                nodeID = node.next;
            } else {
                nodePtr.remainAmount = node.remainAmount.sub(willRedeemFromNode);

                if (breakLoop) {
                    break;
                }

                lastNodeID = nodeID;
                nodeID = node.next;
            }
        }

        return redeemed;
    }

    // Because unix time 0 1970-01-01 is Thursday, this offset makes the interval calculation start from every Monday
    uint256 private constant FOUR_DAYS = 4 days;

    function getRedeemableFromNode(LockedStakingNode memory node)
        private
        view
        returns (
            uint256 locked,
            uint256 unlocked,
            uint256 redeemable
        )
    {
        // In case of finding redeemable amount of future staking, treat this case as all staking is locked
        if (node.stakeTime >= block.timestamp) {
            return (node.initialStakeAmount, 0, 0);
        }

        // 0 unlockInterval means it can be redeemed immediately after staking
        if (node.unlockInterval == 0) {
            return (0, node.initialStakeAmount, node.remainAmount);
        }

        // Find how many unlock intervals have been passed
        // Special handling for 7 days unlock interval, every interval is start from Monday 00:00:00 UTC
        // The first interval can be fewer than 7 days
        // For example, if stakeTime is at Friday 00:00:00 UTC, then 3 days later 1 interval will be passed
        uint256 baseTime;
        if (node.unlockInterval == 7 days) {
            baseTime = uint256(node.stakeTime).sub(FOUR_DAYS).div(7 days).mul(7 days).add(FOUR_DAYS);
        } else {
            baseTime = uint256(node.stakeTime);
        }

        uint256 intervalPassed = block.timestamp.sub(baseTime).div(node.unlockInterval);
        if (intervalPassed == 0) {
            return (node.initialStakeAmount, 0, 0);
        }

        // The staking is fully unlocked, so the whole remain amount is redeemable
        if (intervalPassed >= node.division) {
            return (0, node.initialStakeAmount, node.remainAmount);
        }

        unlocked = node.initialStakeAmount.div(node.division).mul(intervalPassed);
        locked = node.initialStakeAmount.sub(unlocked);
        uint256 redeemed = node.initialStakeAmount.sub(node.remainAmount);

        // All unlocked staking are redeemed, so return 0
        if (redeemed >= unlocked) {
            return (locked, unlocked, 0);
        }

        return (locked, unlocked, unlocked.sub(redeemed));
    }

    function requestRedemption(IERC20 tokenAddr, uint256 amount) external override {
        address sender = _msgSender();
        address token = address(tokenAddr);
        require(stakeable[token], "Token is not stakeable");
        require(amount > 0, "Invalid amount");

        User storage ptr = users[token][sender];
        User memory user = ptr;

        uint256 fromFreeStaking = 0;
        uint256 fromLockedStaking = 0;
        if (user.freeStakingAmount >= amount) {
            // If user free staking can cover the amount, redeem from it first to save gas for list iteration
            fromFreeStaking = amount;
            ptr.freeStakingAmount = user.freeStakingAmount.sub(amount);
        } else {
            fromFreeStaking = user.freeStakingAmount;
            uint256 remaining = amount.sub(fromFreeStaking);
            fromLockedStaking = redeemFromLockedStaking(token, sender, remaining);
            require(remaining == fromLockedStaking, "Token Staked is not enough");
            ptr.freeStakingAmount = 0;
        }

        freeStakings[token] = freeStakings[token].sub(fromFreeStaking);
        freeRedemptions[token] = freeRedemptions[token].add(fromFreeStaking);
        lockedStakings[token] = lockedStakings[token].sub(fromLockedStaking);
        lockedRedemptions[token] = lockedRedemptions[token].add(fromLockedStaking);

        // Create a node to repesnt this redemption
        uint112 nodeID;
        {
            nodeID = nextNodeID++;
            redemptionNodes[nodeID] = RedemptionNode(fromLockedStaking, uint64(block.timestamp), 0, "", fromFreeStaking);
        }

        if (user.redeemStart == 0) {
            // If currently no other pending redemption, this node becomes first node
            ptr.redeemStart = nodeID;
        } else {
            // Append node to linked list
            redemptionNodes[user.redeemLast].next = nodeID;
        }

        ptr.redeemLast = nodeID;

        emit RequestRedemption(token, sender, amount);
    }

    function redeemToken(IERC20 tokenAddr) external override {
        address sender = _msgSender();
        address token = address(tokenAddr);
        require(stakeable[token], "Token is not stakeable");

        uint64 _redeemWaitPeriod = redeemWaitPeriod;
        uint256 freeStakingAmount = 0;
        uint256 lockedStakingAmount = 0;

        User storage ptr = users[token][sender];
        User memory user = ptr;
        uint112 nodeID = user.redeemStart;

        while (nodeID != 0) {
            RedemptionNode memory node = redemptionNodes[nodeID];

            // Wait period still not passed, and because this list preserve the redemption order, no need to check following nodes
            if ((node.requestTime + _redeemWaitPeriod) > block.timestamp) {
                break;
            }

            // Node can be removed to return gas
            delete redemptionNodes[nodeID];
            freeStakingAmount = freeStakingAmount.add(node.freeStakingAmount);
            lockedStakingAmount = lockedStakingAmount.add(node.lockedStakingAmount);
            nodeID = node.next;
        }

        uint256 totalAmount = freeStakingAmount.add(lockedStakingAmount);
        require(totalAmount > 0, "No token can be redeemed");

        // Tokens deposited for free staking and locked staking and managed separately
        freeRedemptions[token] = freeRedemptions[token].sub(freeStakingAmount);
        lockedRedemptions[token] = lockedRedemptions[token].sub(lockedStakingAmount);

        ptr.redeemStart = nodeID;

        if (nodeID == 0) {
            // All redemption requests are cleared, linked list become empty, also remove last value
            ptr.redeemLast = 0;
        }

        SafeERC20.safeTransfer(tokenAddr, sender, totalAmount);

        emit RedeemToken(token, sender, totalAmount);
    }

    function getPoolInfo(IERC20 tokenAddr)
        external
        view
        override
        returns (
            uint256 freeStaking,
            uint256 freeRedemption,
            uint256 lockedStaking,
            uint256 lockedRedemption,
            uint256 balance
        )
    {
        address token = address(tokenAddr);
        freeStaking = freeStakings[token];
        freeRedemption = freeRedemptions[token];
        lockedStaking = lockedStakings[token];
        lockedRedemption = lockedRedemptions[token];
        balance = tokenAddr.balanceOf(address(this));
    }

    /// @dev Remove this function after everyone change to use getUserStaking
    function getUserStaked(IERC20 tokenAddr, address userAddr) external view override returns (uint256) {
        address token = address(tokenAddr);
        uint256 amount = 0;
        uint64 nodeID = lockedStakingUsers[token][userAddr].start;

        while (nodeID != 0) {
            LockedStakingNode memory node = lockedStakingNodes[nodeID];
            amount = amount.add(node.remainAmount);
            nodeID = node.next;
        }

        return amount.add(users[token][userAddr].freeStakingAmount);
    }

    function getUserStaking(IERC20 tokenAddr, address userAddr)
        external
        view
        override
        returns (
            uint256 totalStaked,
            uint256 freeStaking,
            uint256 lockedStakingLocked,
            uint256 lockedStakingUnlocked,
            uint256 lockedStakingRedeemable
        )
    {
        address token = address(tokenAddr);
        LockedStakingUser memory user = lockedStakingUsers[token][userAddr];
        uint64 nodeID = user.start;
        while (nodeID != 0) {
            LockedStakingNode memory node = lockedStakingNodes[nodeID];
            (uint256 l, uint256 u, uint256 r) = getRedeemableFromNode(node);
            lockedStakingLocked = lockedStakingLocked.add(l);
            lockedStakingUnlocked = lockedStakingUnlocked.add(u);
            lockedStakingRedeemable = lockedStakingRedeemable.add(r);
            nodeID = node.next;
        }
        freeStaking = users[token][userAddr].freeStakingAmount;
        totalStaked = freeStaking.add(lockedStakingLocked).add(lockedStakingRedeemable);
    }

    function getUserStakingDetails(IERC20 tokenAddr, address userAddr) external view override returns (StakingInfo[] memory) {
        address token = address(tokenAddr);
        uint256 count;
        uint64 start = lockedStakingUsers[token][userAddr].start;
        uint64 nodeID = start;

        // Get the length of list
        while (nodeID != 0) {
            count++;
            nodeID = lockedStakingNodes[nodeID].next;
        }

        // Also add free staking as the first one, with 0 stakeTime and unlockInterval
        StakingInfo[] memory ret = new StakingInfo[](count + 1);
        uint256 freeStaking = users[token][userAddr].freeStakingAmount;
        ret[0] = StakingInfo(freeStaking, freeStaking, 0, 0, 1);

        nodeID = start;
        for (uint256 i = 0; i < count; i++) {
            LockedStakingNode memory n = lockedStakingNodes[nodeID];
            ret[i + 1] = StakingInfo(n.initialStakeAmount, n.remainAmount, n.stakeTime, n.unlockInterval, n.division);
            nodeID = n.next;
        }

        return ret;
    }

    function getUserRequestedToRedeem(IERC20 tokenAddr, address userAddr) external view override returns (uint256) {
        return sumRedemption(tokenAddr, userAddr, false);
    }

    function getUserCanRedeemNow(IERC20 tokenAddr, address userAddr) external view override returns (uint256) {
        return sumRedemption(tokenAddr, userAddr, true);
    }

    function sumRedemption(
        IERC20 tokenAddr,
        address userAddr,
        bool onlyCanRedeem
    ) private view returns (uint256) {
        uint64 _redeemWaitPeriod = redeemWaitPeriod;
        uint256 amount = 0;
        uint112 nodeID = users[address(tokenAddr)][userAddr].redeemStart;

        while (nodeID != 0) {
            RedemptionNode memory node = redemptionNodes[nodeID];

            if (onlyCanRedeem && ((node.requestTime + _redeemWaitPeriod) > block.timestamp)) {
                break;
            }

            amount = amount.add(node.freeStakingAmount).add(node.lockedStakingAmount);
            nodeID = node.next;
        }

        return amount;
    }

    function getUserRedemptionDetails(IERC20 tokenAddr, address userAddr) external view override returns (RedemptionInfo[] memory) {
        User memory user = users[address(tokenAddr)][userAddr];

        // Go through the linked list first to get node count
        // Because the count is only used in this view function, so not to save it in storage
        uint256 count;
        uint112 nodeID = user.redeemStart;

        while (nodeID != 0) {
            count++;
            nodeID = redemptionNodes[nodeID].next;
        }

        RedemptionInfo[] memory ret = new RedemptionInfo[](count);
        nodeID = user.redeemStart;

        for (uint256 i = 0; i < count; i++) {
            RedemptionNode memory n = redemptionNodes[nodeID];
            ret[i] = RedemptionInfo(n.freeStakingAmount.add(n.lockedStakingAmount), n.requestTime);
            nodeID = n.next;
        }

        return ret;
    }

    function deposit(IERC20 tokenAddr, uint256 amount) external override skipTransferCallback {
        // Deposit to this contract without staking, this is one way to receive token for locked staking
        SafeERC20.safeTransferFrom(tokenAddr, _msgSender(), address(this), amount);
    }

    modifier onlyLockedStakingAdder() {
        require(_msgSender() == _lockedStakingAdder, "Staking: caller is not the locked staking adder");
        _;
    }

    modifier skipTransferCallback() {
        directCalling = ENTERED;
        _;
        directCalling = NOT_ENTERED;
    }
}
