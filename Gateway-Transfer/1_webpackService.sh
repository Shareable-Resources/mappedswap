# ▼▼▼▼▼▼▼▼ To webpack compiled js to bundle.js ▼▼▼▼▼▼▼▼
# sh ./1_webpackService.sh
# or
# npm run webpack
# ▼▼▼▼▼▼▼▼ To webpack compiled js to bundle.js ▼▼▼▼▼▼▼▼
# sh ./1_webpackService.sh agent
# sh ./1_webpackService.sh dApp
# sh ./1_webpackService.sh cronJob
# sh ./1_webpackService.sh onlineDataFetcher
# or
# npm run webpack agent
# ▼▼▼▼▼▼▼▼ Wrong service is unavaliable ▼▼▼▼▼▼▼▼
# sh ./1_webpackService.sh 123
typeset -a serviceMap
typeset -a envMap
srcPath='./webpack'
cmdPath="./node_modules/.bin/webpack"
cmdStr=""
# Add new environment below
envMap[0]="local"
envMap[1]="dev"
envMap[2]="testnet"
envMap[3]="mainnet"
# ------------------
# Add new service below
serviceMap[0]="agent"
serviceMap[1]="dApp"
serviceMap[2]="cronJob"
serviceMap[3]="onlineDataFetcher"
serviceMap[4]="miningRewards"
# -------------------
webpackFromNodeModules() {
  for s in "${!serviceMap[@]}"; do
    cmdStr="${cmdPath} --config ${srcPath}/webpack.${1}.js"
    echo ${cmdStr}
    ./node_modules/.bin/webpack --config "${srcPath}/webpack.${1}.js"
  done
}
join_by() {
  local d=${1-} f=${2-}
  if shift 2; then printf %s "$f" "${@/#/$d}"; fi
}

# If no arguments supplied, run all service from service map
if [ $# -eq 0 ]; then
  for e in "${!envMap[@]}"; do
    webpackFromNodeModules ${envMap[$e]}
  done
else
  for e in "${!envMap[@]}"; do
    if [ "${envMap[$e]}" == "$1" ]; then
      echo "Found ${1} in envMap"
      webpackFromNodeModules ${envMap[$e]}
    fi
  done
  if [ "$cmdStr" == "" ]; then
    echo "Cannot found ${1} in envMap, please try the below arguments again"
    join_by , "${envMap[@]}"
  fi
fi
