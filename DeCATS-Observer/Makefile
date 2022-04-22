CONTRACT_DIR = smartcontract/build/contracts
SRC = $(CONTRACT_DIR)/*.json
SRC_FILE = $(wildcard $(SRC))
#ARCH = env GOOS=linux GOARCH=amd64 CGO_ENABLED=1
OUTPUT_FOLDER = bin/release
RUN_FOLDER = $(HOME)/eurus/bin

TAGS = dev

-include tag.mak

.PHONY: force deploy

genabi: $(SRC_FILE) 
	mkdir -p smartcontract/build/typescript
	typescript/node_modules/.bin/typechain --target web3-v1 --out-dir smartcontract/build/typescript  'smartcontract/build/contracts/*.json'

#Setup development environment
setup: 
	sh script/setup.sh

compile_sc:
	cd smartcontract; truffle compile

$(SRC_FILE): force
	echo "Generate GO smart contract $@"
	mkdir -p smartcontract/build/golang/contract
	sh script/generate_go_smart_contract.sh "$@" smartcontract/build/golang/contract
	
deploy:
	-bash script/deploy.sh $(filter-out $@,$(MAKECMDGOALS))

run:
	-bash script/run.sh $(filter-out $@,$(MAKECMDGOALS))

stop:
	-bash script/stop_observer.sh $(filter-out $@,$(MAKECMDGOALS))

serverlist:
	tmux list-session

build: decatsObserver


decatsObserver:
	$(ARCH) go build -tags $(TAGS) -o $(OUTPUT_FOLDER)/decatsObserver ./asset_service/decats_observer

# Usage, in terminal, type make truffle HASH=0x8e136fa5d3eb61f3a1c67f50d25af916876a8dd356a15aa0f0f8109ff71b6302
truffle:
	cd smartcontract; truffle debug $(HASH) --network besu
%:
	@:
