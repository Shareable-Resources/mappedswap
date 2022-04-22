#!/bin/sh

DIR=$(pwd)/$(dirname "$0")

sh ${DIR}/setup_truffle.sh

TRUFFLE_PATH=${DIR}/../smartcontract/node_modules/.bin/

export PATH=$PATH:$TRUFFLE_PATH
cd ${DIR}

echo "Downloading dependency packages"
go get -d ./...

echo "Building tools"
#go build  -o ${DIR}/../bin/release/extractAbi ../tool/extract_abi
go build  -o ${DIR}/../bin/release/extractBin ../tool/extract_bin


echo "Building go ethereum"

sh build_go_ethereum.sh $GOPATH

cd ${DIR}/../typescript
npm init -y

cd ${DIR}/../

make compile_sc
make genabi