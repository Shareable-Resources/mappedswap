# Decats-backend

# Requirement

- vscode
- node 14.18.0
- prettier
- eslint
- npm
- postman

# Development

1. Get the projects from https://github.com/eurus-chain/DeCATS-backend
2. cd to MappedSwap_Backend folder
3. In terminal

```terminal
   node -v, to check node version :14.18.0
   npm install
```

# Debugging

- **In the Debugger menu, there is few default program setup to run to program**
- **[Local]** Agent Server, Run the agent API server with database config of **[local]** environment specify in src/config/AgentServerConfig.json
- **[Local]** DApp Server, Run the dApp API server with database config of **[local]** environment specify in src/config/DAppServerConfig.json
- **[Local]** Cron Job Server, Run the cron job API server with database config of **[local]** environment specify in src/config/CronJobServerConfig.json
- **[Dev]** Agent Server, Run the agent API server with database config of **[dev]** environment specify in src/config/AgentServerConfig.json
- **[Dev]** DApp Server, Run the dApp API server with database config of **[dev]** environment specify in src/config/DAppServerConfig.json
- **[Dev]** Cron Job Server, Run the cron job API server with database config of **[dev]** environment specify in src/config/CronJobServerConfig.json
- **[Local]** Init DB, init the database by the sequelize model specify in src/general/model/seqModel, this files will run src/script/CreateTable, which will force update database column definition as those defined in src/general/model/seqModel

**For more information .vscode/launch.json to see what scripts will be run by debugger**

# Deployment

**In the project folders:**

1. Build the projects

```terminal
   npm run build
```

2. Deploy the projects to server

```terminal
   npm run deploy dev
   npm run deploy testnet
```

3. Run the projects from local machine to deployed server

```terminal
   npm run remoteRun dev
   npm run remoteRun testnet
```

4. Use terminal to navigate to the server

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

   1. **[npm run webpack local]**
   2. **[npm run webpack dev]**
   3. **[npm run webpack testnet]**

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

4. **[npm run dev]**

   - will delete all pm2 process (if no arguments is passed)/ will delete one pm2 process (if argument is passed)
   - and run each bundle.js of different server from step (1) from **[dist/webpack/dev]** folders by pm2
   - **[Optional]** : You can pass serviceName as arguments to run only one service
   - e.g. **[npm run dev agent]** will only delete the running agent service and start agent service again

5. **[npm run local]**

   - will delete all pm2 process (if no arguments is passed)/ will delete one pm2 process (if argument is passed)
   - and run each bundle.js of different server from step (1) from **[dist/webpack/local]** folders by pm2
   - **[Optional]** : You can pass serviceName as arguments to run only one service
   - e.g. **[npm run local agent]** will only delete the running agent service and start agent service again

6. **[npm run testnet]**

   - will delete all pm2 process (if no arguments is passed)/ will delete one pm2 process (if argument is passed)
   - and run each bundle.js of different server from step (1) from **[dist/webpack/testnet]** folders by pm2
   - **[Optional]** : You can pass serviceName as arguments to run only one service
   - e.g. **[npm run testnet agent]** will only delete the running agent service and start agent service again

7. **[npm run deploy testnet]** or **[npm run deploy dev]**

   - {env} must be passed as arguments
   - **[dev]** or **[testnet]**

   1. **Description**
      - will use ssh command to copy package.json, package-lock.json and **[dist/webpack/{dev}]** to destination server
      - Please notice that you must have decats.pem put in **[~/.ssh]** in your local machine in order for this process to run
   2. **Steps**
      - remove the entire **[agent_system/dist]** folders in server
      - make folder **[agent_system/dist/webpack]** in server
      - copy package.json to **[agent_system]** in server
      - copy package-lock.json to **[agent_system]** in server
      - copy dist/webpack/{env} to **[agent_system/dist/webpack/{env}]** in server

8. **[npm run remoteRun testnet]** or **[npm run remoteRun dev]**

   - will use ssh command to run the deployed files in server
   - it will run **[npm run {env}]** in ubuntu@18.142.7.6

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
