#! /usr/bin/bash
# ▼▼▼▼▼▼▼▼ To compile typescript for all services ▼▼▼▼▼▼▼▼
# sh ./0_tscServer.sh
# or
# npm run tsc
# ▼▼▼▼▼▼▼▼ To compile typescript for one service ▼▼▼▼▼▼▼▼
# sh ./0_tscServer.sh agent
# sh ./0_tscServer.sh dApp
# sh ./0_tscServer.sh cronJob
# sh ./0_tscServer.sh onlineDataFetcher
# or
# npm run tsc agent
# ▼▼▼▼▼▼▼▼ Wrong service is unavaliable ▼▼▼▼▼▼▼▼
# sh ./0_tscServer.sh 123
typeset -a serviceMap
srcPath='../src/server/'
cmdPath="../node_modules/.bin/tsc"
cmdStr=""
# Add new service below
serviceMap[0]="agent"
serviceMap[1]="dApp"
serviceMap[2]="cronJob"
serviceMap[3]="onlineDataFetcher"
# ------------------------------
tscFromNodeModules() {
  cmdStr="${cmdPath} -p ${srcPath}${1}"
  echo ${cmdStr}
  ../node_modules/.bin/tsc -p ${srcPath}${1}
}
join_by() {
  local d=${1-} f=${2-}
  if shift 2; then printf %s "$f" "${@/#/$d}"; fi
}

# If no arguments supplied, run all service from service map
if [ $# -eq 0 ]; then
  for s in "${!serviceMap[@]}"; do
    tscFromNodeModules ${serviceMap[$s]}
  done
else
  for s in "${!serviceMap[@]}"; do
    if [ "${serviceMap[$s]}" == "$1" ]; then
      echo "Found ${1} in serviceMap"
      tscFromNodeModules ${serviceMap[$s]}

    fi
  done
  if [ "$cmdStr" == "" ]; then
    echo "Cannot found ${1} in serviceMap, please try the below arguments again"
    join_by , "${serviceMap[@]}"
    echo ""
  fi
fi

# Otherwise run service based on name, the name must exist in the arrayMap
