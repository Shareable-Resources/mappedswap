# TL; DR 

## Deposit

Deposit USDM / BTCM / ETHM to Pool via standard ERC20 transfer

Make transaction to **USDM / BTCM / ETHM contract**

`transfer(address recipient, uint256 amount)`

| Parameter | Remarks                          |
|-----------|----------------------------------|
| recipient | Input Pool contract address here |
| amount    | Amount to deposit                |

### Deposit for Other Address

Above function deposit for sender themself, if you need help others to deposit, use this

This will be useful when doing cross-chain transfer

`transfer(address recipient, uint256 amount, bytes data)`

| Parameter | Remarks                                             |
|-----------|-----------------------------------------------------|
| recipient | Input Pool contract address here                    |
| amount    | Amount to deposit                                   |
| data      | The real recipient address, left-pad it to 32 bytes |

#### Sample code of deposit USDM for `0xC0C0A...` by `0x39EB6...`

```
let web3 = new Web3(
    new HDWalletProvider(
        {
            privateKeys: ["xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"],
            providerOrUrl: "http://13.228.169.25:8545"
        }));

let myAddr = "0x39EB6463871040f75C89C67ec1dFCB141C3da1cf";
let tokenAddr = "0xD53723143C531f206ea449b4e3881AA42F986B4d";
let poolAddr = "0xf95f04Ae0bFd3F288a8fd8289B2bC64bDae472Ac";
let recipientAddr = "0xC0C0A43D2819eFca5a2774F9Efcb1F60Ff9873D9";

let contract = new web3.eth.Contract(MappedSwapToken.abi, tokenAddr);
await contract.methods
    .transfer(poolAddr, new web3.utils.BN("1000000000"), web3.utils.padLeft(recipientAddr, 64))
    .send({ from: myAddr });
```

## Withdraw

Withdraw USDM / BTCM / ETHM from Pool to sender

Make transaction to Pool contract

Require balance of any supported tokens are non-negative (i.e. not owing any tokens)

`withdraw(string tokenName, uint256 amount)`

| Parameter | Remarks                           |
|-----------|-----------------------------------|
| tokenName | Must be either USDM / BTCM / ETHM |
| amount    | Amount to withdraw                |

## Trading

Parameters are similar to Uniswap

Make transaction to Pool contract

### Buy Exact Amount of Token

`buy(address customer, string pairName, string tokenNameBuy, uint256 amountBuy, uint256 amountSellMax, uint256 deadline)`

| Parameter     | Remarks                                           |
|---------------|---------------------------------------------------|
| customer      | Currently must be same as sender                  |
| pairName      | In `tokenA/tokenB` format, one of it must be USDM |
| tokenNameBuy  | USDM / BTCM / ETHM                                |
| amountBuy     | Exact amount to buy                               |
| amountSellMax | Maximum amount to sell                            |
| deadline      | Time in second when this trade should be valid    |

### Sell Exact Amount of Token

`sell(address customer, string pairName, string tokenNameSell, uint256 amountSell, uint256 amountBuyMin, uint256 deadline)`

| Parameter     | Remarks                                           |
|---------------|---------------------------------------------------|
| customer      | Currently must be same as sender                  |
| pairName      | In `tokenA/tokenB` format, one of it must be USDM |
| tokenNameSell | USDM / BTCM / ETHM                                |
| amountSell    | Exact amount to sell                              |
| amountBuyMin  | Minimum amount to buy                             |
| deadline      | Time in second when this trade should be valid    |

---

# **The readme below is outdated, some information are not correct now (may update it later)**

Schedule

https://docs.google.com/spreadsheets/d/1drFuUs0D__ayFLf6i36f49yZ-qqX9qgYaauVd9YvOQA/edit?usp=sharing

---

# DeCATS Contracts

## Mapped Swap Token (ERC20)

### Proxy Contract

Proxy contract must be deployed for later upgrades

### Token Contract

| Symbol | Name        | Decimals | Remarks                                                     |
|--------|-------------|----------|-------------------------------------------------------------|
| USDM   | USD Mapped Token | 6        | Same settings as USDC                                       |
| BTCM   | BTC Mapped Token | 18       | **Different from WBTC**                                     |
| ETHM   | ETH Mapped Token | 18       | Same settings as ETH                                        |
| *-*    | *Credit*    | *6*      | *Not really a token, but has 1-to-1 relationship with USDM* |

### Deposit to Pool Contract

There are 2 ways to deposit **via token contract**
- `transfer(address recipient, uint256 amount)`
- `transferFrom(address sender, address recipient, uint256 amount)`
  - Standard ERC20 transfer functions, if recipient is pool contract address, callback function will be run to increase balance of sender

---

## Swap Contract

Base on Uniswap and add ability to restrict users becoming LP in selected pools

### Swap Pairs should be Created at First
  - BTCM/USDM
  - ETHM/USDM

### Restricted Tokens
  - If a token is restricted, only addresses with below role can create pair / add liquidity to pools that consist of that token
  - Everyone are still able to swap using this pool
  - `isTokenRestricted(address token)`
  - `setTokenRestrictStatus(address token, bool restricted)` **(require ROUTER_MOD_ROLE)**
  - Current restricted tokens
    - USDM
    - BTCM
    - ETHM

### Access Control

- Router moderator role (`ROUTER_MOD_ROLE`)
  - Address with this role can create pair / add liquidity to pools that consist of restricted tokens
  - `getRouterModerators()`
  - `grantRouterModerator(address addr)` **(require owner)**
  - `revokeRouterModerator(address addr)` **(require owner)**

### Proxy Contract

Proxy contract must be deployed for later upgrades

---

## Credit Pool Contract

### Proxy Contract

Proxy contract must be deployed for later upgrades

### Storage

- Customers (address=>**customer_info**)
  - Balance of token
  - Credit in USDM
  - Stopout risk level
  - Status (enable/disable)
  - Last interest calculate time
- Tokens (token_name=>**token_info**)
  - Token address
  - **interest_rate_history**
- Curreny pairs (currency_pair_name=>**currency_pair_info**)
  - token0 name
  - token1 name
- Manipulate addresses
  - Address for updating customer credit / risk level / status (Agent system)
  - Address for approving allowance
  - Address for managing token and currency pairs
- Swap rounter contract address
- Owner address

### Methods

#### Agent System-related Functions *IPoolAgent* **(require AGENT_ROLE)**
  - Add customer
    - **Call this to initialize customer info first (may change to not required in future)**
    - `addCustomer(address customer, uint256 credit, int256 riskLevel)`
  - Update customer info
    - These functions revert if attempt to update same value
      - Update credit
        - **Credit decimals is 6, so for 100K credit, set it to 100,000,000,000**
        - `updateCustomerCredit(address customer, uint256 credit)`
      - Update risk level
        - **Risk level decimals is 6, so for 50%(=0.5) risk level, set it to 500,000**
        - `updateCustomerRiskLevel(address customer, int256 riskLevel)`
      - Update enable status
        - `updateCustomerEnableStatus(address customer, bool enabled)`
      - Update all 3 values at once
        - `updateCustomerDetails(address customer, uint256 credit, int256 riskLevel, bool enabled)`

#### Token and Pair-related Functions *IPoolManager* **(require MANAGER_ROLE)**
  - Managing token
    - **Use symbol as token name, for example USDM, BTCM**
    - **Interest rate decimals is 9, so for 0.01%(=0.0001) interest rate (per hour), set it to 100000**
    - Interest rate will be effective from the next time interval (so should be hourly)
      - `addToken(string tokenName, address tokenAddr, uint256 interestRate)`
      - `updateTokenInterestRate(string tokenName, uint256 newInterestRate)`
      - `updateTokenEffectiveDecimal(string tokenName, uint256 newEffectiveDecimal)`
      - `removeToken(string tokenName)`
  - Managing pair
    - **Pair name must in the format TokenA/TokenB, order is unimportant**
      - **USDM/BTCM and BTCM/USDM are considered as same pair**
    - **Add the corresponding tokens first, otherwise the functions revert**
      - `addPair(string tokenAName, string tokenBName)`
      - `updatePairEnableStatus(string pairName, bool newEnableStatus)`
      - `removePair(string pairName)`

#### Allowance-related Functions *IPoolApprover* **(require APPROVER_ROLE)**
  - Currently every L Token allowance are set to uint256 max, this function may be needed in future
  - `updateAllowance(string tokenName, uint256 newAllowance)`

#### Trade-related Functions *IPoolCustomer, IPoolBackend*
  - (For deposit please refer to L Tokens)

  - Withdraw
    - The account must not use any credit, i.e. any balance of tokens >= 0
    - Must not withdraw more than the account has
    - Withdraw to sender's address, may be used by decentralized user
      - `withdraw(string tokenName, uint256 amount)`
    - Withdraw to specific address, may be used by centralized user **(require either BACKEND_ROLE or withdraw to sender themself)**
      - `withdrawTo(address toCustomer, string tokenName, uint256 amount)`

  - Buy/Sell
    - Must trade against USDM
    - Pair name can be in any order, both BTCM/USDM or USDM/BTCM are acceptable
    - Just before trading, settle interests first
  
    - **After a trade, checking is performed, if fail to pass it, the transaction will be reverted**
      ```
      if (risk Level < customer risk level threshold) {
          // Fail
      }

      if (used credit <= customer maximum available credit) {
          // OK
      } else {
          if (transaction is reducing position of BTCM/ETHM towards 0) {
              // OK
          } else {
              // Fail
          }
      }
      ```

    - Buy exact amount of token, providing maximum amount of other token want to sell
      - `buy(address customer, string pairName, string tokenNameBuy, uint256 amountBuy, uint256 amountSellMax, uint256 deadline)`
    - Sell exact amount of token, providing minimum amount of other token want to buy
      - `sell(address customer, string pairName, string tokenNameSell, uint256 amountSell, uint256 amountBuyMin, uint256 deadline)`

|                           |                    | TOKEN0 | DIRECTION | TOKEN1 | CREDIT CALCULATION                                 |
| ------------------------- | ------------------ | :----: | :-------: | :----: | -------------------------------------------------- |
|                           | BTCM/USDM          |  BTCM  |           |  USDM  | eg. BTCM = -20 USDM = -20000                       |
| Buy exact amount of USDM  | Maximum pay ? BTCM |   ?    |    >>     | 10000  | BTCM = -20 + MAX(?) <br />USDM= -10000             |
| Sell exact amount of BTCM | Minimum get ? USDM |   10   |    >>     |   ?    | BTCM = -30 <br />USDM = -20000 + MIN(?)            |
| Sell exact amount of USDM | Minimum get ? BTCM |   ?    |    <<     | 10000  | BTCM = -20 + MIN(?) <br />USDM = -30000            |
| Buy exact amount of BTCM  | Maximum pay ? USDM |   10   |    <<     |   ?    | BTCM = -10 <br />USDM = -20000 - MAX(?)            |

Verfiy sufficient credit by calcuating estimated used credit will changed after the transaction. (Estimate credit using maximum sent or minimum received)

  - Stopout **(require BACKEND_ROLE)**
    - If customer's current risk level < its threshold, reduce all tokens' position (except USDM) to 0 through buy/sell, so all the loans go to USDM
    - After stopout, user credit may be not used up, but because risk level is low, it can't buy/sell/withdraw anymore unless deposit enough tokens to raise back risk level
    - `stopout(address customer)`

#### Access Control-related Functions *IPoolOwner* **(require OWNER_ROLE)**
  - Underlying functions are just OpenZeppelin access control
  - **When initializing the contract, owner is also granted all other roles**
  - Agent
    - `grantAgent(address agentAddr)`
    - `revokeAgent(address agentAddr)`
  - Approver
    - `grantApprover(address approverAddr)`
    - `revokeApprover(address approverAddr)`
  - Backend
    - `grantBackend(address backendAddr)`
    - `revokeBackend(address backendAddr)`
  - Manager
    - `grantManager(address managerAddr)`
    - `revokeManager(address managerAddr)`

### Getters

- Get **customer_info** by addess
  - `getCustomerInfo(address customer)`
    - Interest is calculated in following formula

      <img src="https://render.githubusercontent.com/render/math?math=\LARGE \sum_{t=T_{last%2B1}}^{T_{current}}(\frac{P \times r_{t}}{10^9})_{\text{round to 6 d.p.}}">

      where <img src="https://render.githubusercontent.com/render/math?math=\Large T"> is every time interval interest will increase

      <img src="https://render.githubusercontent.com/render/math?math=\Large T_n = \lfloor \frac{\text{Unix time}}{3600} \rfloor \times 3600">

      <img src="https://render.githubusercontent.com/render/math?math=\Large T_{last}"> is included in return value of the call

- Get **token_info** by name

- Get **currency_pair_info** by name
  - `getTokenInfo(string tokenName)`
    - Get the address of token, and current interest rate
  - `getTokenInterestHistory(string tokenName, int256 limit)`
    - Get the latest `limit` changes of interest rate history, input 0 or negative number to get all
  - `getAllTokens()`
    - Return the list of tokens which added into pool contract

- Get unrealized interest

  - Token
  - Hours
  - interest rate
  - interest

- Get currency pair by name

  - token0 reserve
  - token1 reserve
  - price0CumulativeLast
  - price1CumulativeLast
  - blockTimestampLast

### Events
  - Customer Info Update
    - Triggered by successfully updated customer's info
    - `UpdateCredit(address indexed customer, uint256 oldCredit, uint256 newCredit)`
    - `UpdateRiskLevel(address indexed customer, int256 oldRiskLevel, int256 newRiskLevel)`
    - `UpdateEnableStatus(address indexed customer, bool oldEnableStatus, bool newEnableStatus)`

  - Token/Pair Info Update
    - Triggered by manager update token or pair info
    - Note that interest rate can be updated many times shortly, so the old effective time is included for reference
    - `UpdateTokenInterestRate(string tokenName, uint256 oldInterestRate, uint256 oldEffectiveTime, uint256 newInterestRate, uint256 newEffectiveTime)`
    - `UpdateTokenEffectiveDecimal(string tokenName, uint256 oldEffectiveDecimal, uint256 newEffectiveDecimal)`
    - `UpdatePairEnableStatus(string pairName, bool oldEnableStatus, bool newEnableStatus)`

  - Increase Balance (Deposit)
    - Triggered by someone transfer token to pool through L Token contracts
    - `IncreaseBalance(address indexed customer, string tokenName, uint256 amount, int256 newBalance)`

  - Withdraw
    - Triggered by someone withdraw, because withdraw requires customer not using any credit, at the same time no Interest event is emitted
    - `Withdraw(address indexed customer, string tokenName, uint256 amount, int256 newBalance)`

  - Interest
    - Triggered by actions which need to settle interests before really do the things
    - Even if the customer does not use any credit, this event is still emitted, in this case interests are 0
    - **Because interest is calculated in per hour basis, multiple buy/sell transactions within same hour produce at most 1 Interest event**
    - `Interest(address indexed customer, uint256 beginTime, uint256 endTime, string[] tokenNames, int256[] realizedBalances, uint256[] interests)`

  - Buy/Sell
    - Triggered by successful buy/sell transaction (including buy/sell during stopout)
    - `Buy(address indexed customer, string pairName, string tokenNameBuy, uint256 amountBuy, int256 newBalanceBuy, uint256 amountSell, int256 newBalanceSell)`
    - `Sell(address indexed customer, string pairName, string tokenNameSell, uint256 amountSell, int256 newBalanceSell, uint256 amountBuy, int256 newBalanceBuy)`

  - Stopout
    - Triggered by stopout method is successfully called
    - **Current customer risk level must be < risk level threshold to continue stopout action**
    - `Stopout(address indexed customer, int256 stopoutEquity, uint256 stopoutCredit, int256 finalBalance)`

## Deployment Steps

- Follow steps in `migrations` folder
- Step 1 to 7 are basic steps to deploy, initialize with default tokens, pairs
- Step 8 to 10 only work in dev/test environments
  - In production, please use suitable way to mint tokens, then create liquidity pools and initialize users to use trade features
  - Production is also supposed to have finer access control settings

### Roles Required
**Only owner can grant roles to other address**
  - Owner
    - By default the address who deployed contract and call initialize()
    - In future may add transfer owner feature
  - Manager
    - For adding tokens and pairs into Pool use
    - Also needed for update token interest rate
  - Agent
    - Agent can update customers' info
  - Backend
    - Used by back-end service, for example stopout
  - Selected LP
    - **Set and used in router**
    - When adding/removing liquidity, if either one token is restricted, only selected LP can continue the prcess
    - **This check against `to` parameter of liquidity functions, not `msg.sender`**
    - **Everyone can deploy swap pair contracts (by calling factory), but only selected LP can add liquidity to it**
