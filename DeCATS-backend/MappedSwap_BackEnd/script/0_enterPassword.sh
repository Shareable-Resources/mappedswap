#!/bin/bash
typeset -a serviceMap
# Add new service below
serviceMap[0]="agent"
serviceMap[1]="dApp"
serviceMap[2]="cronJob"
serviceMap[3]="onlineDataFetcher"
serviceMap[4]="miningRewards"

envMap[0]="local"
envMap[1]="dev"
envMap[2]="testnet"
envMap[3]="mainnet"
env=""
service=""
printLineByLine() {
    arr=("$@")
    ITER=0
    for each in "${arr[@]}"; do
        echo "(${ITER})" ${each}
        ((ITER++))
    done
}

runByEnv() {
    echo "Password :${password}"
    sh 5_runLocal.sh ${service} ${password}
}

enterPrivateKey() {
    echo "Starting service --- [${service}] in [${env}], Please enter private key"
    # Read Password
    echo Enter private key:
    read -s password
    # Run Command
    echo "Trying to start ${service} in ${env}"
    runByEnv
    exit
}

while true; do
    echo "---------------------------------"
    printLineByLine "${envMap[@]}"
    echo "---------------------------------"
    read -p "Enter one of the env you want to restart, Press (n) to exit:" yn
    case $yn in
    0 | 1 | 2)
        env="${envMap[$yn]}"
        echo "Env : ${env}"
        break
        ;;
    [Nn]*) exit ;;
    *) echo "Please enter number or (n) to exit" ;;
    esac
done

while true; do
    echo "---------------------------------"
    printLineByLine "${serviceMap[@]}"
    echo "---------------------------------"
    read -p "Enter one of the above service which you want to start, Press (n) to exit:" yn
    case $yn in
    0 | 1 | 2 | 3 | 4)
        service="${serviceMap[$yn]}"
        echo "Service : ${service}"
        enterPrivateKey
        break
        ;;
    [Nn]*) exit ;;
    *) echo "Please enter number or (n) to exit" ;;
    esac
done
