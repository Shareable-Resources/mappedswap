#!/bin/sh


CURR_PATH=$(pwd)/$(dirname "$0")

if [ $# -lt 2 ]; then
    echo "Usage: `basename $0` <input json path> <output file path>"
    exit 0
fi

if [ ! -f "$1" ]; then
    echo "Input file not found"
    exit 1
fi

INPUT_FILE_NAME=$(basename $1)
STRUCT_NAME=`echo "$INPUT_FILE_NAME" |  rev | cut -d. -f2 | rev`

mkdir -p $CURR_PATH/../smartcontract/build/abi $CURR_PATH/../smartcontract/build/bin

$CURR_PATH/../bin/release/extractBin -f=$CURR_PATH/../smartcontract/build/contracts/ -abi=$CURR_PATH/../smartcontract/build/abi/ -bin=$CURR_PATH/../smartcontract/build/bin/ |  $GOPATH/pkg/mod/github.com/ethereum/go-ethereum@v1.10.6/build/bin/abigen  --abi=$CURR_PATH/../smartcontract/build/abi/$STRUCT_NAME.abi --bin=$CURR_PATH/../smartcontract/build/bin/$STRUCT_NAME.bin --pkg=contract --type $STRUCT_NAME > $2/$STRUCT_NAME.go
# $CURR_PATH/../bin/release/extractAbi --file "$1"  |  $GOPATH/pkg/mod/github.com/ethereum/go-ethereum@v1.10.1/build/bin/abigen  --abi - --pkg contract --type $STRUCT_NAME > $2/$STRUCT_NAME.go
#$GOPATH/pkg/mod/github.com/ethereum/go-ethereum@v1.10.1/build/bin/abigen  --abi=$CURR_PATH/../smartcontract/build/abi/$STRUCT_NAME.abi --bin=$CURR_PATH/../smartcontract/build/bin/$STRUCT_NAME.bin --pkg=contract --type $STRUCT_NAME > $2/$STRUCT_NAME.go