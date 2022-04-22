

[TOC]

# Decentralise credit and trading services





## Swap

- Smart contract similar to uniswap to support 2 currency pairs
  - BTCL/USDL
  - ETHL/USDL
- Only authorized user can become LP (Liquid Provider of these two currency pairs)



## Pool

### Smart contract

使用Smart contract實現，無論是centralized或decentralized的用戶都可以使用。

### Balance

多貨幣結餘，USDL，BTCL及ETHL分別有對應的結餘。

### Credit

授權信用額度只用USDL計算，使用時可以轉為等值的BTCL和ETHL使用。

已經使用的信用額度直接從負數結餘中獲取，並全部轉換為USDL匯總計算。 

已使用信用額度 = - SUM( MIN(balance, 0) * exchange_rate_to_usdl )

未使用信用額度 = 授權信用額度 - 已使用信用額度

### Block Scan

通過Block scan獲取用戶的餘額的變化，並保存在Database及緩存在內存中。作為後續強平及報表時使用。

### Swap

- 利息在所有Balance發生變化前收取
  發生交易
  存款/取款
  強平
- 利率以每小時計算，不足一小時不計算利息
  紀錄上次收取利息的時間
  計算公式：credit的時長（小時） * used credit *  swap_rate

- 利率貨幣和使用credit的貨幣相同，每個貨幣單獨計算利息
  10000u -> 1u each hour
  1b -> 0.00001b each hour
  1e -> 0.00001e each hour

### Stopout

監控Block scan得到的用戶結餘數據，以及Decat swap的價格變化。

從上步得到的數據計算用戶的Equity，得出Risk Level =(equity + credit)/credit。

低於 50%時候處罰強平。

設定stopout最小觸發時間間隔，觸發一個stopout後，在最小時間間隔內不再觸發。



## Agent

### Dashbroad

Income pie chart

Fee and swap income bar chart

### Customers

Customer management
Assign credit

### Agents

Agent management

Set fee percentage and swap percenage for child agents.

Assign credit

### Report

Daily report.

Monthly report.









