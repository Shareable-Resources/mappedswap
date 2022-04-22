# Decats-backend

# Requirement

- vscode
- node 14.17.3
- prettier
- eslint
- npm
- postman

# Development

1. Get the projects from https://github.com/eurus-chain/DeCATS-backend
2. cd to DecatsBackEnd folder
3. In terminal

```terminal
   node -v, to check node version :14.17.3
   npm install
```

# Debugging

- **In the Debugger menu, there is few default program setup to run to program**
- **[Local]** Agent Server, Run the agent API server with database config of **[local]** environment specify in src/server/agent/config/AgentServerConfig.json
- **[Local]** DApp Server, Run the dApp API server with database config of **[local]** environment specify in src/server/dApp/config/DAppServerConfig.json
- **[Local]** Cron Job Server, Run the cron job API server with database config of **[local]** environment specify in src/server/cronJob/config/CronJobServerConfig.json
- **[Dev]** Agent Server, Run the agent API server with database config of **[dev]** environment specify in src/server/agent/config/AgentServerConfig.json
- **[Dev]** DApp Server, Run the dApp API server with database config of **[dev]** environment specify in src/server/dApp/config/DAppServerConfig.json
- **[Dev]** Cron Job Server, Run the cron job API server with database config of **[dev]** environment specify in src/server/cronJob/config/CronJobServerConfig.json
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
   npm run deploy
```

3. Run the projects from local machine to deployed server

```terminal
   npm run deployRun
```

4. Use terminal to navigate to the server

```terminal
   ssh -i ~/.ssh/decats.pem ubuntu@18.142.7.6
```

5. Use pm2 log to check server status

```terminal ubuntu@18.142.7.6#
   pm2 log
```

# Build Process

1. **[npm run build]**

- Build all servers (by default, this command will run **[npm run tscAll]**,**[npm run webpackDev]**,**[npm run cpPublic]**)

2. **[npm run tscAll]**

   - will compile all typescript files to js files and put in **[dist/tsc/build]** folder
   - it use the following tsconfig.json for compile process

   * tsconfig.json
   * src/server/agent/tsconfig.json
   * src/server/cronJob/tsconfig.json
   * src/server/dApp/tsconfig.json

3. **[npm run webpackDev]**

   - will bundle all dist/tsc/build server files into separate server bundle (Each server will be bundled into 1 js file, bundle.js)
   - the bundled files will be put in dist/webpack/dev
   - the bundled files will be using **[dev]** environment
   - it use the following webpack.js for bundle process

   * webpack/agent/webpack.agent.config.dev.js
   * webpack/agent/webpack.cronJob.config.dev.js
   * webpack/agent/webpack.dApp.config.dev.js

4. **[npm run webpackLocal]**

   - will bundle all dist/tsc/build server files into separate server bundle (Each server will be bundled into 1 js file, bundle.js)
   - the bundled files will be put in dist/webpack/local
   - it use the following webpack.js for bundle process
   - the bundled files will be using **[local]** environment

   * webpack/agent/webpack.agent.config.local.js
   * webpack/agent/webpack.cronJob.config.local.js
   * webpack/agent/webpack.dApp.config.local.js

5. **[npm run dev]**

   - will kill all pm2 process
   - and run each bundle.js of different server from step (1) from **[dist/webpack/dev]** folders by pm2

6. **[npm run local]**

   - will kill all pm2 process
   - and run each bundle.js of different server from step (1) from **[dist/webpack/local]** folders by pm2

7. **[npm run deploy]**

   1. **Description**
      - will use ssh command to copy package.json, package-lock.json and **[dist/webpack/dev]** to ubuntu@18.142.7.6
      - Please notice that you must have decats.pem put in **[~/.ssj]** in your local machine in order for this process to run
   2. **Steps**
      - remove the entire **[agent_system/dist]** folders in ubuntu@18.142.7.6
      - make folder **[agent_system/dist/webpack]** in ubuntu@18.142.7.6
      - copy package.json to **[agent_system]** in ubuntu@18.142.7.6
      - copy package-lock.json to **[agent_system]** in ubuntu@18.142.7.6
      - copy dist/webpack/dev to **[agent_system/dist/webpack/dev]** in ubuntu@18.142.7.6

8. **[npm run deployRun]**

   - will use ssh command to run the deployed files in ubuntu@18.142.7.6
   - it will run **[npm run dev]** in ubuntu@18.142.7.6

# Useful command:

1. Access to server

```terminal ubuntu
    ssh -i ~/.ssh/decats.pem ubuntu@18.142.7.6
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
