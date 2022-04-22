#! /usr/bin/bash
# ▼▼▼▼▼▼▼▼ To deploy ▼▼▼▼▼▼▼▼
# sh ./3_deploy.sh testnet
# or
# npm run deploy testnet
# ▼▼▼▼▼▼▼▼ To deploy in different enviroment ▼▼▼▼▼▼▼▼
# npm run deploy testnet
# npm run deploy dev
# ▼▼▼▼▼▼▼▼ Wrong deploy is unavaliable ▼▼▼▼▼▼▼▼
# npm run deploy 123
apiServerPath=''
apiPemPath=''
bgServerPath=''
bgPemPath=''
# pemPath='~/.ssh/decats.pem' #pem must be provided

env=''
typeset -a envMap
# Add new environment below
envMap[0]="local"
envMap[1]="dev"
envMap[2]="testnet"
envMap[3]="mainnet"
#---------------

join_by() {
    local d=${1-} f=${2-}
    if shift 2; then printf %s "$f" "${@/#/$d}"; fi
}

assignServerInfo() {
    case $1 in
    dev)
        apiServerPath='ubuntu@13.229.211.216'
        apiPemPath='~/.ssh/msDeCATS-Dev.pem'
        bgServerPath='ubuntu@13.228.78.179'
        bgPemPath='~/.ssh/ms-obs-Dev.pem'
        ;;
    testnet)
        apiServerPath='ubuntu@54.169.228.231'
        apiPemPath='~/.ssh/msDeCATS-Testnet.pem'
        bgServerPath='ubuntu@54.254.169.193'
        bgPemPath='~/.ssh/ms-obs-Testnet.pem'
        ;;
    mainnet)
        apiServerPath='ubuntu@52.77.105.46'
        apiPemPath='~/.ssh/msDeCATS-Mainnet.pem'
        bgServerPath='ubuntu@54.251.156.202'
        bgPemPath='~/.ssh/ms-obs-Mainnet.pem'
        ;;
    local)
        apiServerPath='~'
        ;;
    esac
    echo "CronJob Server Path: ${apiServerPath}  PEM : ${apiPemPath}"
}

deployFromWebpack() {
    env=${1}
    assignServerInfo ${env}
    # Deploy to MappedSwap API Server
    echo "Deploying to api server..."
    cmdStr="ssh -i ${apiPemPath} ${apiServerPath}
            \"rm -rfv agent_system/dist/webpack 
            && rm -rfv agent_system/dist/public 
            && mkdir -p agent_system/dist 
            && mkdir agent_system/dist/webpack/${env}
            \" 
            && scp -i ${apiPemPath} -r ../package-lock.json ${apiServerPath}:~/agent_system/package-lock.json 
            && scp -i ${apiPemPath} -r ../package.json ${apiServerPath}:~/agent_system/package.json 
            && scp -i ${apiPemPath} -pr ../dist/webpack/${env}/agent ${apiServerPath}:~/agent_system/dist/webpack/${env}/agent
            && scp -i ${apiPemPath} -pr ../dist/webpack/${env}/dApp ${apiServerPath}:~/agent_system/dist/webpack/${env}/dApp
           "
    echo ${cmdStr}
    ssh -i ${apiPemPath} ${apiServerPath} "rm -rfv agent_system/dist/webpack && rm -rfv agent_system/dist/public && mkdir -p agent_system/dist && mkdir agent_system/dist/webpack && mkdir agent_system/dist/webpack/${env} " && scp -i ${apiPemPath} -r ../package-lock.json ${apiServerPath}:~/agent_system/package-lock.json && scp -i ${apiPemPath} -r ../package.json ${apiServerPath}:~/agent_system/package.json && scp -i ${apiPemPath} -pr ../dist/webpack/${env}/agent ${apiServerPath}:~/agent_system/dist/webpack/${env}/agent && scp -i ${apiPemPath} -pr ../dist/webpack/${env}/dApp ${apiServerPath}:~/agent_system/dist/webpack/${env}/dApp && scp -i ${apiPemPath} -r ../dist/public ${apiServerPath}:~/agent_system/dist/public

    if [ ${env} -eq "dev" ]; then
        echo "Copying API documentation"
        scp -i ${apiPemPath} -r ../dist/public ${apiServerPath}:~/agent_system/dist/public
    fi

    # Deploy to MappedSwap Background Server
    echo "Deploying to background server..."
    cmdStr="ssh -i ${bgPemPath} ${bgServerPath}
           \"rm -rfv Decats/agent_system/dist/webpack
           && rm -rfv Decats/agent_system/dist/public
           && mkdir -p Decats/agent_system/dist
           && mkdir Decats/agent_system/dist/webpack
           && mkdir Decats/agent_system/dist/webpack/${env}
           \"
           && scp -i ${bgPemPath} -r ../package-lock.json ${bgServerPath}:~/Decats/agent_system/package-lock.json
           && scp -i ${bgPemPath} -r ../package.json ${bgServerPath}:~/Decats/agent_system/package.json
           && scp -i ${bgPemPath} -pr ../dist/webpack/${env}/cronJob ${bgServerPath}:~/Decats/agent_system/dist/webpack/${env}/cronJob
           && scp -i ${bgPemPath} -pr ../dist/webpack/${env}/onlineDataFetcher ${bgServerPath}:~/Decats/agent_system/dist/webpack/${env}/onlineDataFetcher
          "
    echo ${cmdStr}
    ssh -i ${bgPemPath} ${bgServerPath} "rm -rfv Decats/agent_system/dist/webpack && rm -rfv Decats/agent_system/dist/public && mkdir -p Decats/agent_system/dist && mkdir Decats/agent_system/dist/webpack && mkdir Decats/agent_system/dist/webpack/${env}" && scp -i ${bgPemPath} -r ../package-lock.json ${bgServerPath}:~/Decats/agent_system/package-lock.json && scp -i ${bgPemPath} -r ../package.json ${bgServerPath}:~/Decats/agent_system/package.json && scp -i ${bgPemPath} -pr ../dist/webpack/${env}/cronJob ${bgServerPath}:~/Decats/agent_system/dist/webpack/${env}/cronJob && scp -i ${bgPemPath} -pr ../dist/webpack/${env}/onlineDataFetcher ${bgServerPath}:~/Decats/agent_system/dist/webpack/${env}/onlineDataFetcher

}

# If no arguments supplied, ask the user to enter arguments
if [ $# -eq 0 ]; then
    echo "Please try the below arguments again"
    join_by , "${envMap[@]}"
else
    for e in "${!envMap[@]}"; do
        if [ "${envMap[$e]}" == "$1" ]; then
            echo "Found ${1} in envMap"
            deployFromWebpack ${envMap[$e]}
        fi
    done
    if [ "$cmdStr" == "" ]; then
        echo "Cannot found ${1} in envMap, please try the below arguments again"
        join_by , "${envMap[@]}"
    fi
fi
