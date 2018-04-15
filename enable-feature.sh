#!/usr/bin/env bash

enablerPath="./features/$1/enable.sh"
if [ -f $enablerPath ]; then
    source $enablerPath;
    npm run build;
    exit 0;
else
    echo "Feature \"$1\" is not available";
    exit 1;
fi