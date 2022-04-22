**[In script folders]** run the first command
**[In project root folder(where package.json locate)]** run the command in ()

# 0_tscService.sh

# tsc all service

- sh 0_tscService.sh **[(npm run tsc )]**

# tsc one service

- sh 0_tscService.sh agent **[(npm run tsc agent)]**
- sh 0_tscService.sh dApp **[(npm run tsc dApp)]**
- sh 0_tscService.sh cronJob **[(npm run tsc cronJob)]**
- sh 0_tscService.sh onlineDataFetcher **[(npm run tsc onlineDataFetcher)]**

# 1_webpackService.sh

# webpack all service in all enviroments

- sh 1_webpackService.sh **[(npm run webpack )]**

# webpack one service in one enviroment

- sh 1_webpackService.sh local **[(npm run tsc local)]**
- sh 1_webpackService.sh dev **[(npm run tsc dev)]**
- sh 1_webpackService.sh testnet **[(npm run tsc testnet)]**

# 2_runLocal.sh

# webpack all service in local enviroments

- sh 2_runLocal.sh **[(npm run local)]**

# webpack one service in local enviroment

- sh 2_runLocal.sh agent **[(npm run local agent)]**
- sh 2_runLocal.sh dApp **[(npm run local dApp)]**
- sh 2_runLocal.sh cronJob **[(npm run local cronJob)]**
- sh 2_runLocal.sh onlineDataFetcher **[(npm run local onlineDataFetcher)]**

# 2_runDev.sh

# webpack all service in dev enviroments

- sh 2_runDev.sh **[(npm run dev)]**

# webpack one service in dev enviroment

- sh 2_runDev.sh agent **[(npm run dev agent)]**
- sh 2_runDev.sh dApp **[(npm run dev dApp)]**
- sh 2_runDev.sh cronJob **[(npm run dev cronJob)]**
- sh 2_runDev.sh onlineDataFetcher **[(npm run dev onlineDataFetcher)]**

# 2_runTestnet.sh

# webpack all service in dev enviroments

- sh 2_runTestnet.sh **[(npm run testnet)]**

# webpack one service in dev enviroment

- sh 2_runTestnet.sh agent **[(npm run testnet agent)]**
- sh 2_runTestnet.sh dApp **[(npm run testnet dApp)]**
- sh 2_runTestnet.sh cronJob **[(npm run testnet cronJob)]**
- sh 2_runTestnet.sh onlineDataFetcher **[(npm run testnet onlineDataFetcher)]**

# 3_deploy.sh

# deploy to dev server

- sh 3_deploy.sh dev **[(npm run deploy dev)]**

# deploy to testnet server

- sh 3_deploy.sh testnet **[(npm run deploy testnet)]**

# 4_remoteRun.sh

# Remote run dev server

- sh 4_remoteRun.sh dev **[(npm run remoteRun dev)]**

# Remote run testnet server

- sh 4_remoteRun.sh testnet **[(npm run remoteRun testnet)]**
