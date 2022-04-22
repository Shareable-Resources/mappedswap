# 1 Pool contract



## 1.1 Trade

### 1.1.1 Trade with zero Funding

- Prerequisites

New account and assigned zero Funding.

- Steps

| STEPS                      | EXPECT RESULTS                         | ACTUAL RESULTS | PASS | COMMENTS |
| -------------------------- | -------------------------------------- | -------------- | ---- | -------- |
| Login account              | Login successfully                     |                |      |          |
| Deposit 10000 USDM         | Deposit successfully                   |                |      |          |
| Bug ? ETH using 10000 USDM | USDM balance = 0<br />ETHM balance = ? |                |      |          |

### 1.1.2 Sell from long position to short position

- Prerequisites

Login account with 5 BTCM 

- Steps

| STEPS         | EXPECT RESULTS                                               | ACTUAL RESULTS | PASS | COMMENTS |
| ------------- | ------------------------------------------------------------ | -------------- | ---- | -------- |
| Login account | Login successfully                                           |                | Y    |          |
| Sell 6 BTCM   | Sell successfully<br />BTCM balanced = -1 BTCM<br />Balance of USDM increased |                | Y    |          |

### 1.1.3 Sell exact amount of token

- Prerequisites

Account with BTCM balance at least amount of X.

- Steps

| STEPS                     | EXPECT RESULTS                                               | ACTUAL RESULTS | PASS | COMMENTS |
| ------------------------- | ------------------------------------------------------------ | -------------- | ---- | -------- |
| Login account             | Login successfully                                           |                | Y    |          |
| Sell exact amount of BTCM | Sell successfully<br />BTCM balance decreased exact amount<br />USDM balance increased. |                | Y    |          |

### 1.1.4 Buy exact amount of token

- Prerequisites

Acount with sufficient balance of USDM for buying amount of X BTCM.

- Steps

| STEPS                    | EXPECT RESULTS                                               | ACTUAL RESULTS | PASS | COMMENTS |
| ------------------------ | ------------------------------------------------------------ | -------------- | ---- | -------- |
| Login account            | Login successfully                                           |                | Y    |          |
| Buy exact amount of BTCM | Buy successfully.<br />BTCM balance increased exact amount.<br />USDM balance decreased. |                | Y    |          |

## 1.2 Risk Level / Funding Available checking

### 1.2.1 Trade while risk level > stop out risk level

- Prerequisites

Prepared account with risk level > stop out risk level by increase risk level after trading.

The account should be stopout with only USDM balance and risk level is still less than risk level.

- Steps

| STEPS                                   | EXPECT RESULTS                                               | ACTUAL RESULTS | PASS | COMMENTS                                                     |
| --------------------------------------- | ------------------------------------------------------------ | -------------- | ---- | ------------------------------------------------------------ |
| Login account                           | Login successfully                                           |                | Y    |                                                              |
| Increase account risk level by trading. | After trading, current risk level at around 5%               |                | Y    |                                                              |
| Decrease stopout risk level to 4%       | Account is stopped out. <br />After stopping out, all positions except USDM will be closed. |                | Y    |                                                              |
| Continue to trading                     | Transaction fail.                                            |                | Y    | Rejected by contract because of risk level lower than stopout level. |

## 1.3 Funding checking

### 1.3.1 Open position with insufficient Funding

- Prerequisites

Prepare account with insuffient Funding

- Steps

| STEPS                             | EXPECT RESULTS     | ACTUAL RESULTS | PASS | COMMENTS     |
| --------------------------------- | ------------------ | -------------- | ---- | ------------ |
| Login account                     | Login successfully |                | Y    |              |
| Open position by buying 100 ETHM  | Transaction fail.  |                | Y    | Funding = 1u |
| Open position by selling 100 ETHM | Transaction fail.  |                | Y    | Funding = 1u |

### 1.3.2 Close position with insufficient Funding

Always allow to close positions toward zero.

- Prerequisites

Account with 100,000 Funding.

- Steps

| STEPS                                                        | EXPECT RESULTS                | ACTUAL RESULTS | PASS | COMMENTS                                    |
| ------------------------------------------------------------ | ----------------------------- | -------------- | ---- | ------------------------------------------- |
| Login account                                                | Login successfully            |                | Y    |                                             |
| Spend all Funding to Buy ETHM                                | Swap all USDM Funding to ETHM |                | Y    |                                             |
| Decrease account Funding from 100,000 to 80,000 in Agent system. | Liability > Funding           |                | Y    |                                             |
| Selling ETHM toward zero position.                           | Transaction sucess.           |                | Y    | Always allow to close position toward zero. |

## 1.4 Interest calculation

- Prerequisites



- Step

| STEPS                                   | EXPECT RESULTS                                               | ACTUAL RESULTS | PASS | COMMENTS |
| --------------------------------------- | ------------------------------------------------------------ | -------------- | ---- | -------- |
| Login account                           | Login successfully                                           |                | Y    |          |
| Make balance become negative by trading | Transaction success with negative balance                    |                | Y    |          |
| Wait an hour for interest calcuation    | Interest record generate a new record.<br />Balance of the token decrease amount of interest generate by last hour.<br />Interest = -balance * interest rate per hour |                | Y    |          |

## 1.5 Deposit

### 1.5.1 Deposit with registered account

- Prerequisites

Metamask account registered.

- Steps

| STEPS                    | EXPECT RESULTS                                       | ACTUAL RESULTS | PASS | COMMENTS |
| ------------------------ | ---------------------------------------------------- | -------------- | ---- | -------- |
| Login Dapp with metamask | Login successfully                                   |                | Y    |          |
| Deposit 1000 USDM        | Deposit successfully<br />USDM balance increase 1000 |                | Y    |          |
| Deposit 0.1 BTCM         | Deposit successfully<br />BTCM balance increase 0.1  |                | Y    |          |
| Deposit 1 ETHM           | Deposit successfully<br />ETHM balance increase 1    |                | Y    |          |

### 1.5.2 Deposit with not registered account

- Prerequisites

Metamask account not registered.

- Steps

| STEPS                    | EXPECT RESULTS     | ACTUAL RESULTS | PASS | COMMENTS                                                     |
| ------------------------ | ------------------ | -------------- | ---- | ------------------------------------------------------------ |
| Login Dapp with metamask | Login successfully |                | Y    |                                                              |
| Deposit 5 BTCM           | Deposit success    |                | Y    | Not registered  accounts can deposit and trading without funding. |

## 1.6 Withdrew

### 1.6.1 Withdraw with all positive balances

- Prerequisites

Logined account with all token balances > 0

USDM balance > 1000

- Steps

| STEPS                    | EXPECT RESULTS                                          | ACTUAL RESULTS | PASS | COMMENTS |
| ------------------------ | ------------------------------------------------------- | -------------- | ---- | -------- |
| Login Dapp with metamask | Login successfully                                      |                | Y    |          |
| Withdraw 1000 USDM       | Withdraw successfully.<br /> USDM balance deducted 1000 |                | Y    |          |

### 1.6.2 Withdraw with negative balances

- Prerequisites

Logined account with BTCM balance < 0

- Steps

| STEPS                    | EXPECT RESULTS     | ACTUAL RESULTS | PASS | COMMENTS |
| ------------------------ | ------------------ | -------------- | ---- | -------- |
| Login Dapp with metamask | Login successfully |                | Y    |          |
| Withdraw 10 USDM         | Withdraw fail.     |                | Y    |          |

### 1.6.3 Withdraw with insufficient balance

- Prerequisites

Logined account with all token balances > 0

- Steps

| STEPS                    | EXPECT RESULTS     | ACTUAL RESULTS | PASS | COMMENTS                           |
| ------------------------ | ------------------ | -------------- | ---- | ---------------------------------- |
| Login Dapp with metamask | Login successfully |                | Y    |                                    |
| Withdraw 1000 BTCM       | Withdraw fail.     |                | Y    | less than 1000 BTCM in the account |



## 1.7 Stopout

#### 1.7.1 Stop out by rising stopout risk level

- Prerequisites

New account with USDM=10,000, RISK_LEVEL = 60%

- Steps

| STEPS                           | EXPECT RESULTS                                               | ACTUAL RESULTS | PASS | COMMENTS      |
| ------------------------------- | ------------------------------------------------------------ | -------------- | ---- | ------------- |
| Login Dapp with metamask        | Login successfully                                           |                | Y    |               |
| Sell 10000u for BTCM            | USDM balance  = 0<br />BTCM balance ~= 0.25<br />Risk level > 0% |                | Y    |               |
| Update stopout risk level to 0% | All BTCM will be sold. <br />Swap to USDM and only USDM left.<br />Risk level > 0% |                | Y    | Wait about 2s |
| Swap 5000 USDM for BTCM         | Contract rejected the request <br />because of risk level > 0%(Stopout level) |                | Y    |               |



# 2 Token Contract

## 2.1 Transfer to pool contract address

- Prerequisites

With some balance in metamask.

- Steps

| STEPS                                                        | EXPECT RESULTS                                             | ACTUAL RESULTS | PASS | COMMENTS |
| ------------------------------------------------------------ | ---------------------------------------------------------- | -------------- | ---- | -------- |
| Added cusotmer using wallet address                          | Added account successfully                                 |                | Y    |          |
| Transfer 1000 USDM to Pool contract address directly in metamask | Transfer successfully                                      |                | Y    |          |
| Login DApp to check balance                                  | Login successfully and found balance of USDM increase 1000 |                | Y    |          |



# 3 Swap contract

## 3.1 Add liquidity



## 3.2 Draw liquidity

