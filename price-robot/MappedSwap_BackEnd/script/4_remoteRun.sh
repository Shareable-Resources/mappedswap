# ▼▼▼▼▼▼▼▼ To run ▼▼▼▼▼▼▼▼
# sh ./4_remoteRun.sh testnet
# or
# npm run remoteRun testnet
# ▼▼▼▼▼▼▼▼ To run in different enviroment ▼▼▼▼▼▼▼▼
# npm run remoteRun testnet
# npm run remoteRun dev
# ▼▼▼▼▼▼▼▼ Wrong run is unavaliable ▼▼▼▼▼▼▼▼
# npm run remoteRun 123
serverPath=''
# pemPath='~/.ssh/decats.pem' #pem must be provided
pemPath='' #pem must be provided
env=''
typeset -a envMap
typeset -a dbMap
# Add new environment below
envMap[0]="local"
envMap[1]="dev"
envMap[2]="testnet"
#---------------
join_by() {
    local d=${1-} f=${2-}
    if shift 2; then printf %s "$f" "${@/#/$d}"; fi
}

assignServerCert() {
    case $1 in
    dev)
        # serverPath='ubuntu@54.151.163.46'
        pemPath='~/.ssh/msDeCATS-Dev.pem'
        ;;
    testnet)
        pemPath='~/.ssh/msDeCATS-Testnet.pem'
        ;;
    local)
        pemPath='~'
        ;;
    esac
    echo "Server Path: ${serverPath}"
}

assignServerPath() {
    case $1 in
    dev)
        # serverPath='ubuntu@54.151.163.46'
        serverPath='ubuntu@13.229.211.216'
        ;;
    testnet)
        serverPath='ubuntu@54.169.228.231'
        ;;
    local)
        serverPath='~'
        ;;
    esac
    echo "Server Path: ${serverPath}"
}

runFromWebpack() {
    env=${1}
    assignServerCert ${env}
    assignServerPath ${env}
    cmdStr="ssh -i ${pemPath} ${serverPath} \"cd ./agent_system && npm run ${env} --\"YiGX3h##iw=gaTQz%-XTL&Zyq,qw_d2E\" --\"z?A:F$]@uLx*Z-&C\"\""
    echo $cmdStr
    ssh -i ${pemPath} ${serverPath} "cd ./agent_system && npm run ${env} --\"YiGX3h##iw=gaTQz%-XTL&Zyq,qw_d2E\" --\"z?A:F$]@uLx*Z-&C\""
}

# If no arguments supplied, ask the user to enter arguments
if [ $# -eq 0 ]; then
    echo "Please try the below arguments again"
    join_by , "${envMap[@]}"
else
    for e in "${!envMap[@]}"; do
        if [ "${envMap[$e]}" == "$1" ]; then
            echo "Found ${1} in envMap"
            runFromWebpack ${envMap[$e]}
        fi
    done
    if [ "$cmdStr" == "" ]; then
        echo "Cannot found ${1} in envMap, please try the below arguments again"
        join_by , "${envMap[@]}"
    fi
fi
