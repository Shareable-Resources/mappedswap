#!/bin/sh

set -e

# workspace root folder
dir=$(cd "$(dirname "$0")"; pwd)/$(basename "$0")
dir=$(dirname "$dir")
dir=$(dirname "$dir")

pushd $dir >> /dev/null

# compile smart contract
truffle compile --all

oldHash=`sed -nE "s/^.*hex\"(.+)\" \/\/ init code hash, do not change this comment/\1/p" ./contracts/libraries/swap/RaijinSwapLibrary.sol`
newHash=`node ./script/init-code-hash.js`

# change init code hash and compile again
if [ "$oldHash" != "$newHash" ];
then
    echo "*** Init code hash of RaijinSwapPair is changed ***"
    echo "old:"
    echo "$oldHash"
    echo "new:"
    echo "$newHash"
    echo "Going to update related source code and compile again"

    sed -i '' -E "s/hex\".+\" \/\/ init code hash, do not change this comment/hex\"$newHash\" \/\/ init code hash, do not change this comment/" ./contracts/libraries/swap/RaijinSwapLibrary.sol
    truffle compile --all
fi

echo ""
echo "*** Latest init code hash of RaijinSwapPair ***"
echo $newHash

# extract abi
node ./script/extract-abi.js

# generate go source code
mkdir -p ./build/golang/contract

for p in `basename ./build/abi/*.json`
do
    name=${p%.*}
    $GOPATH/pkg/mod/github.com/ethereum/go-ethereum@v1.10.6/build/bin/abigen --abi ./build/abi/$name.json --pkg contract --type $name > ./build/golang/contract/$name.go
done

popd >> /dev/null
