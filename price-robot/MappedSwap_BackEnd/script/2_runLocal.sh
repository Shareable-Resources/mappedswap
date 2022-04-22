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
# ---------------------
runFromDist() {
  cmdStr="${cmdPath} ${srcPath}/${env}/${1}/bundle.js --name ${1} -- 'YiGX3h##iw=gaTQz%-XTL&Zyq,qw_d2E' 'z?A:F$]@uLx*Z-&C'"
  echo "[Running service] ${1}"
  echo ${cmdStr}
  ../node_modules/.bin/pm2 start ${srcPath}/${env}/${1}/bundle.js --name ${1} -- "YiGX3h##iw=gaTQz%-XTL&Zyq,qw_d2E" "z?A:F$]@uLx*Z-&C"
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
    runFromDist ${serviceMap[$s]}
  done
else
  for s in "${!serviceMap[@]}"; do
    if [ "${serviceMap[$s]}" == "$1" ]; then
      echo "Found ${1} in serviceMap"
      deleteService ${serviceMap[$s]}
      runFromDist ${serviceMap[$s]}
    fi
  done
  if [ "$cmdStr" == "" ]; then
    echo "Cannot found ${1} in serviceMap, please try the below arguments again"
    join_by , "${serviceMap[@]}"
    echo ""
  fi
fi

# Otherwise run service based on name, the name must exist in the arrayMap
