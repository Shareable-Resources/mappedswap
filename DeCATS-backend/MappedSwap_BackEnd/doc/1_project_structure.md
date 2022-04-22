# [ MappedSwap-API ] Project structure

All source code related to MappedSwap will be put in MappedSwap/src

# src/server

Inside MappedSwap/src/server, there will be multiple micro-services locate in server folders

### **API Server**

these services will be called from front-end and put in API server

- agent
- dApp

### **Background Server**

these services will only running from background put in Background server

- cronJob
- miningRewards
- onlineDataFetcher
- profitDailyReport

# src/general

All sequelize model entity and database model class will place here

## src/general/dbModel

**[ONLY CREATE DATABASE MODEL or DATABASE ENUM(such as type or status) here]**

define class for types and instance,

If you need another model with different column names, please create it on each micro-service(src/server/xxxxxxx)

## src/general/seqModel

define sequelize entity model which will be use for sequelize to map those tables in database

## src/general/sequelize/index.ts

all entity model will be place here, if the model is not included in here, sequelize is not able to use those model to map

Basically, each services will only contains those models that it concerns.

**i.e.**

1. src/general/sequelize/index.js will contains all entity models since it can be use to initialize all database table
2. src/server/profitDailyReport/sequelize/index.ts will only contains report related models

# src/foundation

All fundamental shared class, super class, helper, logger, middleware, e.g., will be put in here

**DO NOT PUT MICRO-SERVICE RELATED CODES IN HERE, THIS FOLDER SHOULD ONLY CONTAINS FUNDAMENTAL CODE**

# src/public

files in here will be copied to dist/public

### src/public/index.html contains api documentation which will be generated through npm run build based on doc/api.json

# src/abi

The json files in here would be used for calling contract and use to compile into typescript files in src/@types

# src/@types

Compiled abi files in ts format, can be used in calling contract function by web3
