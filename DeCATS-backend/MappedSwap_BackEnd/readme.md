# Decats-backend

# Requirement

- vscode
- node 14.18.0
- prettier
- eslint
- npm
- postman

# Development

1. Get the projects from https://github.com/Mapped-Swap/DeCATS-backend
2. cd to MappedSwap_Backend folder
3. Put the config files in Mapped-Swap/DeCATS-backend/config, there will be [dev] and [local] environment by default
4. Open Terminal (#) in this path : Mapped-Swap/DeCATS-backend

```terminal
   node -v, to check node version :14.18.0
   npm install
```

If node js has not been installed, install node js 14.18.0

```
   # install node 14.18.0
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   nvm install 14.18.0
```

You may need to install git to perform npm install

```
   yum install git
```

Then run npm install

```
   # cd path_to_MappedSwap_BackEnd
   npm install
```

Compile contracts

```
   cd src/server/onlineDataFetcher/smartcontract/v3-core-main
   #ln -s /home/centos/.nvm/versions/node/v14.18.0/bin/node /usr/bin/node
   npm install
   npm run compile
```

Finally, return to MappedSwap_Backend and compile project.

```
   # cd path_to_MappedSwap_BackEnd
   npm run build
```

# Debugging

- **In the Debugger menu, there is few default program setup to run to program**
- **Prefix with [Local] will be using the local attributes XXXXXXXXXXConfig.json**
- **Prefix with [Dev] will be using the dev attributes XXXXXXXXXXConfig.json**
- **Prefix with [Testnet] will be using the testnet attributes XXXXXXXXXXConfig.json**
- **Prefix with [Mainnet] will be using the mainnet attributes XXXXXXXXXXConfig.json**
- **[Agent Server]** Agent Server, Run the agent API server with database config AgentServerConfig.json
- **[DApp Server]** DApp Service, Run the dApp API server with database config DAppServerConfig.json
- **[CronJob Server]** Cron Job, Run the agent API server with database config CronJobServerConfig.json
- **[Online Data Fetcher]** This service grab price information from uniswap pool, (USDC/WBTC) (USDC/WETH), and use the price to automatically update prices of(USDM/BTCM)(USDM/ETHM) in MappedSwap Pool
- **[Init DB]** This will initialize the database based on environment(Clear out all data and clean database), DO NOT run this function in dev/testnet/mainnet !!!!!!!!!!!!!!!!! This files will run src/script/CreateTable, which is using sequelize model to generate database

- **[EncryptTool]** Use to generate key, encrypt function
- **contain 4 functions, Encrypt, Decrypt, RecoverPubKeyFromPrivateKey and WalletAddressFromPublicKey**
- **use debugger to run or by terminal with command "npx ts-node {program path}/MappedSwap_BackEnd/src/foundation/tools/EncryptTool.ts"**

**For more information .vscode/launch.json to see what scripts will be run by debugger**

# Deployment

**In the project folders:**

1. Build the projects

```terminal
   npm run build
```

2. Deploy the projects to server, this only deploy dApp and agent server

```terminal
   npm run deploy dev
   npm run deploy testnet
   npm run deploy mainnet
```

3. Run the projects from local machine to deployed server (deprecated due to need key in password)

```terminal
   npm run remoteRun dev
   npm run remoteRun testnet
   npm run remoteRun mainnet
```

4. Use terminal to navigate to the server,
   Please put the pem in ~./ssh
   1. msDeCATS-Dev.pem
   2. ms-obs-Dev.pem
   3. msDeCATS-Testnet.pem
   4. ms-obs-Testnet.pem
   5. msDeCATS-Mainnet.pem
   6. ms-obs-Mainnet.pem

```terminal
   ssh -i ~/.ssh/decats.pem ubuntu@54.151.163.46
```

5. Use pm2 log to check server status

```terminal ubuntu@54.151.163.46 #
   pm2 log
```

# Build Process

1. **[npm run build]**

- Build all servers (by default, this command will run **[npm run tsc]**,**[npm run webpack]**,**[npm run cp:public]**)

2. **[npm run tsc]**

   - will compile all typescript files to js files and put in **[dist/tsc/build]** folder
   - it use the following tsconfig.json for compile process

   * tsconfig.json
   * src/server/agent/tsconfig.json
   * src/server/cronJob/tsconfig.json
   * src/server/dApp/tsconfig.json
   * src/server/onlineDataFetcher/tsconfig.json

3. **[npm run webpack]**

   - will bundle all dist/tsc/build server files into separate server bundle (Each server will be bundled into 1 js file, bundle.js) with separate enviroment folders
   - the bundled files will be put in dist/webpack/{env}
   - the bundled files will use all environments if arguments is not passed
   - if environment variable is passed to this command, e.g. **[npm run webpack local]**, it will only webpack the files with this enviroment (only webpack local environment in this example)
   - webpack config example:

   * webpack/agent/agent.local.js
   * webpack/agent/cronJob.local.js
   * webpack/agent/dApp.local.js
   * webpack/onlineDataFetcher/dApp.local.js
   * **[webpack/{serviceName}/{serviceName}.{env}.js]**

4. **[Run service (local)]**
   Make sure the below three folders exists

   1. config/local/xxxxx.json
   2. dist
   3. node_modules (**Which is build using package.json**)
   4. package.json
   5. package.lock.json

   - **In MappedSwap_BackEnd project folders**
   - ./node_modules/.bin/pm2 kill
   - ./node_modules/.bin/pm2 start ./dist/webpack/local/dApp/bundle.js --name dApp
   - ./node_modules/.bin/pm2 start ./dist/webpack/local/agent/bundle.js --name agent
   - ./node_modules/.bin/pm2 start ./dist/webpack/local/cronJob/bundle.js --name cronJob
   - ./node_modules/.bin/pm2 start ./dist/webpack/local/onlineDataFetcher/bundle.js --name onlineDataFetcher
   - ./node_modules/.bin/pm2 start ./dist/webpack/local/miningRewards/bundle.js --name miningRewards

5. **[Run service (dev)]**
   Make sure the below three folders exists

   1. config/dev/xxxxx.json
   2. dist
   3. node_modules (**Which is build using package.json**)
   4. package.json
   5. package.lock.json

   - **In MappedSwap_BackEnd project folders**
   - ./node_modules/.bin/pm2 kill
   - ./node_modules/.bin/pm2 start ./dist/webpack/dev/dApp/bundle.js --name dApp
   - ./node_modules/.bin/pm2 start ./dist/webpack/dev/agent/bundle.js --name agent
   - ./node_modules/.bin/pm2 start ./dist/webpack/dev/cronJob/bundle.js --name cronJob
   - ./node_modules/.bin/pm2 start ./dist/webpack/dev/onlineDataFetcher/bundle.js --name onlineDataFetcher
   - ./node_modules/.bin/pm2 start ./dist/webpack/dev/miningRewards/bundle.js --name miningRewards

6. **[Run service (testnet)]**
   Make sure the below three folders exists

   1. config/testnet
   2. dist
   3. node_modules (**Which is build using package.json**)
   4. package.json
   5. package.lock.json

   - **In MappedSwap_BackEnd project folders**
   - ./node_modules/.bin/pm2 kill
   - ./node_modules/.bin/pm2 start ./dist/webpack/testnet/dApp/bundle.js --name dApp
   - ./node_modules/.bin/pm2 start ./dist/webpack/testnet/agent/bundle.js --name agent
   - ./node_modules/.bin/pm2 start ./dist/webpack/testnet/cronJob/bundle.js --name cronJob
   - ./node_modules/.bin/pm2 start ./dist/webpack/testnet/onlineDataFetcher/bundle.js --name onlineDataFetcher
   - ./node_modules/.bin/pm2 start ./dist/webpack/testnet/miningRewards/bundle.js --name miningRewards

7. **[Run service (mainnet)]**
   Make sure the below three folders exists
   1. config/mainnet
   2. dist
   3. node_modules (**Which is build using package.json**)
   4. package.json
   5. package.lock.json
   - **In MappedSwap_BackEnd project folders**
   - ./node_modules/.bin/pm2 kill
   - ./node_modules/.bin/pm2 start ./dist/webpack/mainnet/dApp/bundle.js --name dApp
   - ./node_modules/.bin/pm2 start ./dist/webpack/mainnet/agent/bundle.js --name agent
   - ./node_modules/.bin/pm2 start ./dist/webpack/mainnet/cronJob/bundle.js --name cronJob
   - ./node_modules/.bin/pm2 start ./dist/webpack/mainnet/onlineDataFetcher/bundle.js --name onlineDataFetcher
   - ./node_modules/.bin/pm2 start ./dist/webpack/mainnet/miningRewards/bundle.js --name miningRewards

# How the service run

1. entry point -> index.ts
2. load config by files, if config files not found, stop
3. enter private key
4. if private key is correct, start the service

# Useful command:

1. Access to server

```terminal ubuntu
    ssh -i ~/.ssh/decats.pem ubuntu@54.151.163.46 Dev
    ssh -i ~/.ssh/decats.pem ubuntu@54.169.100.96 Testnet
```

# Status

# Agent.status

- 0 : Created
- 10 : Inactive
- 20 : Active

# AgentDailyReport.status

- 0 : Created
- 50 : Generated

# Balance.status

- 0 : Created

# BalanceHistory.status

- 0 : Created

# BalanceHistory.type

- 1 : Buy
- 2 : Sell
- 3 : Deposit
- 4 : Withdraw
- 5 : Interest

# Customer.status

- 0 : Created
- 10 : Inactive
- 20 : Active

# CustomerCreditUpdate.status

- 0 : Created
- 10 : Inactive
- 20 :Active

# InterestHistory.status

- 0 : Created

# PriceHistory.status

- 0 : Created

# Stopout.tx_status

- 0 : Created
- 1 : Accepted
- 2 : Confirmed
- 3 : Rejected

# Transaction.tx_status

- 0 : Created
- 1 : Accepted
- 2 : Confirmed
- 3 : Rejected

# Sqitch

- Download sqitch

  ```
     https://sqitch.org/download/macos/
     brew tap sqitchers/sqitch
     brew install sqitch --with-postgres-support --with-sqlite-support
  ```

- Add environment example
  **Please never git push any production env in this file**
  ```
     sqitch target add dev 'db:pg://christopher:\_PW0E,emS3+<xW>S^nZQ@13.228.21.221:5432/postgres'
     db:pg://dba@example.net/blanket
  ```
  **Please notice that sqitch.plan means init db from start, while sqitchSince20220309.plan is using existing db**

1. cd {Project}/DataBase
2. add specific change in all plan (USE THIS)
   ```
      sqitch add 20220228_Create_t_decats_testSqitch --note 'Test first sqitch' --all
   ```
3. Change 20220228_Create_t_decats_testSqitch.sql file under /DataBase/deploy accordingly
4. Deployment
   4.1 deploy all chagne
   ```
      sqitch deploy --target dev
      sqitch deploy --target testnet
      sqitch deploy --target mainnet
      sqitch deploy --target local
   ```
   4.2 deploy specific change
   ```
      sqitch deploy --target dev --to-change 20220228_Create_t_decats_testSqitch
   ```
5. Revert all change
   ```
      sqitch revert --target dev
   ```
6. Verify all change
   ```
      sqitch verify --target dev
   ```
