#! /usr/bin/bash
# ▼▼▼▼▼▼▼▼ To run service in (local) enviroment in the running machine ▼▼▼▼▼▼▼▼
# sh ./2_runLocal.sh
# or
# npm run local
# ▼▼▼▼▼▼▼▼ To run service in (local) enviroment in the running machine ▼▼▼▼▼▼▼▼
# sh ./2_runLocal.sh agent
# sh ./2_runLocal.sh dApp
# sh ./2_runLocal.sh cronJob
# sh ./2_runLocal.sh onlineDataFetcher
# or
# npm run local agent
# ▼▼▼▼▼▼▼▼ Wrong service is unavaliable ▼▼▼▼▼▼▼▼
# sh ./2_runLocal.sh 123
typeset -a serviceMap
env="local"
srcPath='../dist/webpack'
cmdPath="../node_modules/.bin/pm2 start"
cmdStr=""
# Add new service below
serviceMap[0]="agent"
serviceMap[1]="dApp"
serviceMap[2]="cronJob"
serviceMap[3]="onlineDataFetcher"
serviceMap[4]="miningRewards"
# ---------------------
runFromDist() {
    serviceName="$1"
    key="$2"
    echo "serviceName :${serviceName}"
    cmdStr="${cmdPath} ${srcPath}/${env}/${serviceName}/bundle.js --name ${serviceName}"
    echo ${cmdStr}
    ../node_modules/.bin/pm2 start ${srcPath}/${env}/${serviceName}/bundle.js --name ${serviceName}
    pidInArrayStr="$(../node_modules/.bin/pm2 id ${serviceName})"
    charStart=${pidInArrayStr//[/}
    charEnd=${charStart//]/}
    pid=${charEnd// /}
    echo "pid ${pid}"
    echo "key ${key}"
    ../node_modules/.bin/pm2 send ${pid} ${key}
    echo "../node_modules/.bin/pm2 send ${pid} ${key}"
    echo "${serviceName}"
    logs="$(../node_modules/.bin/pm2 logs ${serviceName} --lines 1 --out --nostream)"
    lastLine="${logs##*$'\n'}"
    while [[ $lastLine == *"Fail Encryption"* ]]; do
        read -p "Please enter correct password again : " yn
        ../node_modules/.bin/pm2 send ${pid} ${yn}
        echo "../node_modules/.bin/pm2 send ${pid} ${yn}"
        logs="$(../node_modules/.bin/pm2 logs ${1} --lines 1 --out --nostream)"
        lastLine="${logs##*$'\n'}"
        echo ${lastLine}
    done
}

strindex() {
    x="${1%%$2*}"
    [[ "$x" = "$1" ]] && echo -1 || echo "${#x}"
}

deleteService() {
    cmdStr="${deleteCmdPath} ${1}"
    echo "[Delete service] ${1}"
    echo ${cmdStr}
    ../node_modules/.bin/pm2 delete ${1}
}

join_by() {
    local d=${1-} f=${2-}
    if shift 2; then printf %s "$f" "${@/#/$d}"; fi
}

# If no arguments supplied, run all service from service map
if [ $# -eq 0 ]; then
    for s in "${!serviceMap[@]}"; do
        deleteService ${serviceMap[$s]}
        runFromDist ${serviceMap[$s]} $2
    done
else
    for s in "${!serviceMap[@]}"; do
        if [ "${serviceMap[$s]}" == "$1" ]; then
            echo "Found ${1} in serviceMap"
            deleteService ${serviceMap[$s]}
            runFromDist ${serviceMap[$s]} $2
        fi
    done
    if [ "$cmdStr" == "" ]; then
        echo "Cannot found ${1} in serviceMap, please try the below arguments again"
        join_by , "${serviceMap[@]}"
        echo ""
    fi
fi

# Otherwise run service based on name, the name must exist in the arrayMap
