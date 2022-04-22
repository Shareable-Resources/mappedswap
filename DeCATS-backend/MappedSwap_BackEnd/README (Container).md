# Mappedswap Backend Container

# Requirement

- Docker
- Git

# Building the Container

1. Clone the repository

```terminal
   git clone https://{gh_username}@github.com/Mapped-Swap/DeCATS-backend.git
```

2. Change to Backend Directory

```terminal
   cd /DeCATS-backend/MappedSwap_BackEnd
```

3. Copy the required configurations to `/MappedSwap_BackEnd/src/config`

```
   There should be 7 configuration files that is git ignored. You must have these configuration files to complete the build.

   .
   ├── src
   │   ├── config
   │     ├── AgentServerConfig.json
   │     ├── CronJobServerConfig.json
   │     ├── DAppServerConfig.json
   │     ├── DecatsServerConfig.json
   │     ├── FoundationConfig.json
   │     ├── MiningRewardsServerConfig.json
   │     └── OnlineDataFetcherConfig.json
```

4. Build the container

```terminal
   docker build -t mappedswap-backend .
```

# Running the Container

1. Check for Container Image

```terminal
   docker images
```

You should see under Repository an image called mappedswap-backend

2. Run the Container

```terminal
   docker run -p 8094:8094 -p 8095:8095 -p 8096:8096 -dit --name mappedswap-backend mappedswap-backend
```

3. Finally, check for the running container

```terminal
   docker ps
```

You should see a container named `mappedswap-backed` running
