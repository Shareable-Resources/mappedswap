Please put config files under folder
/MappedSwap_BackEnd/config

By default, only below files are provided

1. dev
2. local

Other environment, please setup if neceesary

# How the service run

1. entry point -> index.ts
2. load config by files, if config files not found, stop
3. enter private key
4. if private key is correct, start the service
