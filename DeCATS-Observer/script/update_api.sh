#!/bin/sh
if [ $# -lt 1 ]; then
    echo "$(basename $0) <file name without path>"
    exit 1
fi

if [ !  -f ~/build/src/eurus-backend/doc/$1 ]; then
    echo "File not found"
    exit 1
fi
cp ~/build/src/eurus-backend/doc/$1 ~/eurus/api/
rm ~/eurus/api/EurusAPI.yaml
ln -s ~/eurus/api/$1 ~/eurus/api/EurusAPI.yaml
echo "Deployed and updated symbolic link"