#!/bin/sh
RUN_FOLDER=/home/ubuntu/eurus/bin/
# For local test
#RUN_FOLDER=$HOME/Documents/GitHub/src/eurus-backend/
PW=abcd1234

adddate() {
  while IFS= read -r line; do
    printf '%s %s\n' "$(date)" "$line"
  done
}

if [ $# -eq 0 ] || [ "$#" = "" ]; then
  echo 'Please input sh run.sh { all | config | auth | user | approval | withdraw | deposit | blockchain | restart | sign | userObs | kyc | sweep | merchantAdmin }'
  exit 1
fi

runMerchantAdmin() {
  cd $RUN_FOLDER
  tmux new-session -d -s merchantAdminServer
  tmux new-window -t merchantAdminServer -n merchantAdminServer_Win "bash"
  tmux pipe-pane -t "merchantAdminServer:merchantAdminServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/MerchantAdminServer.log"
  tmux send-keys -t merchantAdminServer "./merchantAdminServer --config ../config/MerchantAdminServerConfig.json" ENTER
  tmux send-keys -t merchantAdminServer ${PW} ENTER
}

if [ $1 = "config" ]; then
  tmux kill-window -t configServer
  cd $RUN_FOLDER
  tmux new-session -d -s configServer
  tmux new-window -t configServer -n configServer_Win "bash"
  tmux pipe-pane -t "configServer:configServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/ConfigServer.log"
  tmux send-keys -t configServer "./configServer --config ../config/ConfigServerConfig.json" ENTER
  tmux send-keys -t configServer ${PW} ENTER
  sleep 5
  exit 0

elif [ $1 = "sign" ]; then
  tmux kill-window -t signServer
  cd $RUN_FOLDER
  tmux new-session -d -s signServer
  tmux new-window -t signServer -n signServer_Win "bash"
  tmux pipe-pane -t "signServer:signServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/SignServer.log"
  tmux send-keys -t signServer "./signServer --config ../config/SignServerConfig.json" ENTER
  tmux send-keys -t signServer ${PW} ENTER
  exit 0

elif [ $1 = "restart" ]; then
  tmux kill-window -t restart
  tmux new-session -d -s restart
  tmux new-window -t restart -n restart_Win "bash"
  tmux pipe-pane -t "restart:restart_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/restart.log"
  tmux send-keys -t restart "sh $HOME/build/src/eurus-backend/script/restart.sh" ENTER
  sleep 5
  exit 0

elif [ $1 = "background" ]; then
  sh ./script/setup_crontab.sh
#  tmux kill-session -t background
#  cd $RUN_FOLDER
#  tmux new-session -d -s background
#  tmux new-window -t background -n background_Win "bash"
#  tmux pipe-pane -t "background:background_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/Background.log"
#  tmux send-keys -t background "sh $HOME/build/src/eurus-backend/script/setup_crontab.sh" ENTER
  exit 0

elif [ $1 = "walletBackground" ]; then
  sh ./script/setup_crontab.sh
#  tmux kill-session -t background
#  cd $RUN_FOLDER
#  tmux new-session -d -s background
#  tmux new-window -t background -n background_Win "bash"
#  tmux pipe-pane -t "background:background_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/Background.log"
#  tmux send-keys -t background "sh $HOME/build/src/eurus-backend/script/setup_crontab.sh" ENTER
  exit 0

elif [ $1 = "auth" ]; then
  tmux kill-window -t authServer
  cd $RUN_FOLDER
  tmux new-session -d -s authServer
  tmux new-window -t authServer -n authServer_Win "bash"
  tmux pipe-pane -t "authServer:authServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/AuthServer.log"
  tmux send-keys -t authServer "./authServer --config ../config/AuthServerConfig.json" ENTER
  tmux send-keys -t authServer ${PW} ENTER
  sleep 5
  exit 0

elif [ $1 = "user" ]; then
  tmux kill-window -t userServer
  cd $RUN_FOLDER
  tmux new-session -d -s userServer
  tmux new-window -t userServer -n userServer_Win "bash"
  tmux pipe-pane -t "userServer:userServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/UserServer.log"
  tmux send-keys -t userServer "./userServer --config ../config/UserServerConfig.json" ENTER
  tmux send-keys -t userServer ${PW} ENTER
  sleep 5
  exit 0

elif [ $1 = "kyc" ]; then
  tmux kill-window -t kycServer
  cd $RUN_FOLDER
  tmux new-session -d -s kycServer
  tmux new-window -t kycServer -n kycServer_Win "bash"
  tmux pipe-pane -t "kycServer:kycServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/KYCServer.log"
  tmux send-keys -t kycServer "./kycServer --config ../config/KYCServerConfig.json" ENTER
  tmux send-keys -t kycServer ${PW} ENTER
  sleep 5
  exit 0

elif [ $1 = "sweep" ]; then
  tmux kill-window -t sweepServer
  cd $RUN_FOLDER
  tmux new-session -d -s sweepServer
  tmux new-window -t sweepServer -n sweepServer_Win "bash"
  tmux pipe-pane -t "sweepServer:sweepServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/SweepServer.log"
  tmux send-keys -t sweepServer "./sweepServer --config ../config/SweepServerConfig.json" ENTER
  tmux send-keys -t sweepServer ${PW} ENTER
  sleep 5
  exit 0

elif [ $1 = "userObs" ]; then
  tmux kill-window -t userObserver
  cd $RUN_FOLDER
  tmux new-session -d -s userObserver
  tmux new-window -t userObserver -n userObserver_Win "bash"
  tmux pipe-pane -t "userObserver:userObserver_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/UserObserver.log"
  tmux send-keys -t userObserver "./userObserver --config ../config/UserObserverConfig.json" ENTER
  tmux send-keys -t userObserver ${PW} ENTER
  exit 0

elif [ $1 = "blockchain" ]; then
  cd $RUN_FOLDER
  if [ -z "$2" ];then
    for i in $(seq 1 1); do
      tmux kill-session -t blockChainIndexer_"$i"
    done
  else
    tmux kill-session -t blockChainIndexer_"$2"
  fi
  if [ -z "$2" ];then
    
      tmux new-session -d -s blockChainIndexer_"$i"
      tmux new-window -t blockChainIndexer_"$i" -n blockChainIndexer_"$i"_Win "bash"
      tmux pipe-pane -t "blockChainIndexer_"$i":blockChainIndexer_"$i"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/BlockChainIndexer_"$i".log"
      tmux send-keys -t blockChainIndexer_"$i" "./blockChainIndexer --config ../config/BlockChainIndexerConfig_"$i".json" ENTER
      tmux send-keys -t blockChainIndexer_"$i" ${PW} ENTER
    echo "blockChainIndexer started"
  else
    tmux new-session -d -s blockChainIndexer_"$2"
    tmux new-window -t blockChainIndexer_"$2" -n blockChainIndexer_"$2"_Win "bash"
    tmux pipe-pane -t "blockChainIndexer_"$2":blockChainIndexer_"$2"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/BlockChainIndexer_"$2".log"
    tmux send-keys -t blockChainIndexer_"$2" "$RUN_FOLDER./blockChainIndexer --config ../config/BlockChainIndexerConfig_"$2".json" ENTER
    tmux send-keys -t blockChainIndexer_"$2" ${PW} ENTER
    echo "blockChainIndexer_$2 started"
  fi
  exit 0

elif [ $1 = "withdraw" ]; then
  if [ -z "$2" ];then
    for i in $(seq 1 7); do
      tmux kill-window -t withdrawObserver_"$i"
    done
  else
    tmux kill-window -t withdrawObserver_"$2"
  fi
  cd $RUN_FOLDER
    if [ -z "$2" ];then
      for i in $(seq 1 7); do
        tmux new-session -d -s withdrawObserver_"$i"
        tmux new-window -t withdrawObserver_"$i" -n withdrawObserver_"$i"_Win "bash"
        tmux pipe-pane -t "withdrawObserver_"$i":withdrawObserver_"$i"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/WithdrawObserver_"$i".log"
        tmux send-keys -t withdrawObserver_"$i" "./withdrawObserver --config ../config/WithdrawObserverConfig_"$i".json" ENTER
        tmux send-keys -t withdrawObserver_"$i" ${PW} ENTER
      done
       echo "7 withdrawObserver started"
    else
      
      tmux new-session -d -s withdrawObserver_"$2"
      tmux new-window -t withdrawObserver_"$2" -n withdrawObserver_"$2"_Win "bash"
      tmux pipe-pane -t "withdrawObserver_"$2":withdrawObserver_"$2"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/WithdrawObserver_"$2".log"
      tmux send-keys -t withdrawObserver_"$2" "$RUN_FOLDER./withdrawObserver --config ../config/WithdrawObserverConfig_"$2".json" ENTER
      tmux send-keys -t withdrawObserver_"$2" ${PW} ENTER
      echo "withdrawObserver_$2 started"
    fi
 

  exit 0

elif [ $1 = "deposit" ]; then
 if [ -z "$2" ];then
  for i in $(seq 1 7); do
    tmux kill-window -t depositObserver_"$i"
    done
  else
     tmux kill-window -t depositObserver_"$2"
  fi
  
  cd $RUN_FOLDER
  if [ -z "$2" ];then
    for i in $(seq 1 7); do
      tmux new-session -d -s depositObserver_"$i"
      tmux new-window -t depositObserver_"$i" -n depositObserver_"$i"_Win "bash"
      tmux pipe-pane -t "depositObserver_"$i":depositObserver_"$i"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/DepositObserver_"$i".log"
      tmux send-keys -t depositObserver_"$i" "./depositObserver --config ../config/DepositObserverConfig_"$i".json" ENTER
      tmux send-keys -t depositObserver_"$i" ${PW} ENTER
    done
      echo "7 depositObserver started"
  else
    
    tmux new-session -d -s depositObserver_"$2"
    tmux new-window -t depositObserver_"$2" -n depositObserver_"$2"_Win "bash"
    tmux pipe-pane -t "depositObserver_"$2":depositObserver_"$2"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/DepositObserver_"$2".log"
    tmux send-keys -t depositObserver_"$2" "$RUN_FOLDER./depositObserver --config ../config/DepositObserverConfig_"$2".json" ENTER
    tmux send-keys -t depositObserver_"$2" ${PW} ENTER
    echo "depositObserver_$2 started"
  fi
  exit 0

elif [ $1 = "approval" ]; then
  if [ -z "$2" ];then
    for i in $(seq 1 4); do
      tmux kill-window -t approvalObserver_"$i"
    done
  else
    tmux kill-window -t approvalObserver_"$2"
  fi

  cd $RUN_FOLDER
  if [ -z "$2" ];then
    for i in $(seq 1 4); do
      tmux new-session -d -s approvalObserver_"$i"
      tmux new-window -t approvalObserver_"$i" -n approvalObserver_"$i"_Win "bash"
      tmux pipe-pane -t "approvalObserver_"$i":approvalObserver_"$i"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/ApprovalObserver_"$i".log"
      tmux send-keys -t approvalObserver_"$i" "./approvalObserver --config ../config/ApprovalObserver_"$i".json" ENTER
      tmux send-keys -t approvalObserver_"$i" ${PW} ENTER
    done
    echo "4 approvalObserver started"
  else
    
    tmux new-session -d -s approvalObserver_"$2"
    tmux new-window -t approvalObserver_"$2" -n approvalObserver_"$i"_Win "bash"
    tmux pipe-pane -t "approvalObserver_"$2":approvalObserver_"$2"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/ApprovalObserver_"$2".log"
    tmux send-keys -t approvalObserver_"$2" "$RUN_FOLDER./approvalObserver --config ../config/ApprovalObserver_"$2".json" ENTER
    tmux send-keys -t approvalObserver_"$2" ${PW} ENTER
   echo "approvalObserver_$2 started"
  fi
  exit 0
elif [ $1 = "merchantAdmin" ]; then
  runMerchantAdmin

elif [ $1 = "all" ]; then
  tmux kill-window -t configServer
  tmux kill-window -t authServer
  tmux kill-window -t userServer
  tmux kill-window -t restart
  tmux kill-window -t signServer
  tmux kill-window -t userObserver
  tmux kill-window -t sweepServer
  tmux kill-window -t kycServer

  #kill-session
  for i in $(seq 1 7); do
    tmux kill-window -t withdrawObserver_"$i"
    tmux kill-window -t depositObserver_"$i"
  done

  for i in $(seq 1 4); do
    tmux kill-window -t approvalObserver_"$i"
  done

  for i in $(seq 1 2); do
    tmux kill-session -t blockChainIndexer_"$i"
  done
  #kill-session end

  cd $RUN_FOLDER
  tmux new-session -d -s configServer
  tmux new-window -t configServer -n configServer_Win "bash"
  tmux pipe-pane -t "configServer:configServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/ConfigServer.log"
  tmux send-keys -t configServer "./configServer --config ../config/ConfigServerConfig.json" ENTER
  tmux send-keys -t configServer ${PW} ENTER
  echo "configServer started, wait for 5 seconds cooldown time"
  sleep 5

  cd $RUN_FOLDER
  tmux new-session -d -s authServer
  tmux new-window -t authServer -n authServer_Win "bash"
  tmux pipe-pane -t "authServer:authServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/AuthServer.log"
  tmux send-keys -t authServer "./authServer --config ../config/AuthServerConfig.json" ENTER
  tmux send-keys -t authServer ${PW} ENTER
  sleep 5

  cd $RUN_FOLDER
  tmux new-session -d -s userServer
  tmux new-window -t userServer -n userServer_Win "bash"
  tmux pipe-pane -t "userServer:userServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/UserServer.log"
  tmux send-keys -t userServer "./userServer --config ../config/UserServerConfig.json" ENTER
  tmux send-keys -t userServer ${PW} ENTER
  sleep 5

  tmux kill-window -t userObserver
  cd $RUN_FOLDER
  tmux new-session -d -s userObserver
  tmux new-window -t userObserver -n userObserver_Win "bash"
  tmux pipe-pane -t "userObserver:userObserver_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/UserObserver.log"
  tmux send-keys -t userObserver "./userObserver --config ../config/UserObserverConfig.json" ENTER
  tmux send-keys -t userObserver ${PW} ENTER

  #asset_service start
  sh ./script/setup_crontab.sh
#  cd $RUN_FOLDER
#  tmux new-session -d -s background
#  tmux new-window -t background -n background_Win "bash"
#  tmux pipe-pane -t "background:background_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/Background.log"
#  tmux send-keys -t background "sh $HOME/build/src/eurus-backend/script/setup_crontab.sh" ENTER

  cd $RUN_FOLDER
  for i in $(seq 1 4); do
    tmux new-session -d -s approvalObserver_"$i"
    tmux new-window -t approvalObserver_"$i" -n approvalObserver_"$i"_Win "bash"
    tmux pipe-pane -t "approvalObserver_"$i":approvalObserver_"$i"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/ApprovalObserver_"$i".log"
    tmux send-keys -t approvalObserver_"$i" "./approvalObserver --config ../config/ApprovalObserver_"$i".json" ENTER
    tmux send-keys -t approvalObserver_"$i" ${PW} ENTER
  done
  echo "4 approvalObserver started"

  cd $RUN_FOLDER
  for i in $(seq 1 7); do
    tmux new-session -d -s depositObserver_"$i"
    tmux new-window -t depositObserver_"$i" -n depositObserver_"$i"_Win "bash"
    tmux pipe-pane -t "depositObserver_"$i":depositObserver_"$i"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/DepositObserver_"$i".log"
    tmux send-keys -t depositObserver_"$i" "./depositObserver --config ../config/DepositObserverConfig_"$i".json" ENTER
    tmux send-keys -t depositObserver_"$i" ${PW} ENTER
  done
  echo "7 depositObserver started"

  cd $RUN_FOLDER
  for i in $(seq 1 7); do
    tmux new-session -d -s withdrawObserver_"$i"
    tmux new-window -t withdrawObserver_"$i" -n withdrawObserver_"$i"_Win "bash"
    tmux pipe-pane -t "withdrawObserver_"$i":withdrawObserver_"$i"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/WithdrawObserver_"$i".log"
    tmux send-keys -t withdrawObserver_"$i" "./withdrawObserver --config ../config/WithdrawObserverConfig_"$i".json" ENTER
    tmux send-keys -t withdrawObserver_"$i" ${PW} ENTER
  done
  echo "7 withdrawObserver started"

  cd $RUN_FOLDER
  for i in $(seq 1 2); do
    tmux new-session -d -s blockChainIndexer_"$i"
    tmux new-window -t blockChainIndexer_"$i" -n blockChainIndexer_"$i"_Win "bash"
    tmux pipe-pane -t "blockChainIndexer_"$i":blockChainIndexer_"$i"_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/BlockChainIndexer_"$i".log"
    tmux send-keys -t blockChainIndexer_"$i" "./blockChainIndexer --config ../config/BlockChainIndexerConfig_"$i".json" ENTER
    tmux send-keys -t blockChainIndexer_"$i" ${PW} ENTER
  done

  cd $RUN_FOLDER
  tmux new-session -d -s signServer
  tmux new-window -t signServer -n signServer_Win "bash"
  tmux pipe-pane -t "signServer:signServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/SignServer.log"
  tmux send-keys -t signServer "./signServer --config ../config/SignServerConfig.json" ENTER
  tmux send-keys -t signServer ${PW} ENTER

  cd $RUN_FOLDER
  tmux new-session -d -s sweepServer
  tmux new-window -t sweepServer -n sweepServer_Win "bash"
  tmux pipe-pane -t "sweepServer:sweepServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/SweepServer.log"
  tmux send-keys -t sweepServer "./sweepServer --config ../config/SweepServerConfig.json" ENTER
  tmux send-keys -t sweepServer ${PW} ENTER
  runMerchantAdmin

  cd $RUN_FOLDER
  tmux new-session -d -s kycServer
  tmux new-window -t kycServer -n kycServer_Win "bash"
  tmux pipe-pane -t "kycServer:kycServer_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/KYCServer.log"
  tmux send-keys -t kycServer "./kycServer --config ../config/KYCServerConfig.json" ENTER
  tmux send-keys -t kycServer ${PW} ENTER
  sleep 5
  
  tmux new-session -d -s restart
  tmux new-window -t restart -n restart_Win "bash"
  tmux pipe-pane -t "restart:restart_Win" "cat | ( while read line; do echo  $(date)  $"line"; done; ) >> ../errorLog/Restart.log"
  tmux send-keys -t restart "sh $HOME/build/src/eurus-backend/script/restart.sh" ENTER
else
  echo "Invalid argument"
  exit 1
fi
exit 0
