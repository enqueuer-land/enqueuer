#!/usr/bin/env bash


if [ "$1"  == "list" ]; then
    cd features
    ls -1d */
    exit 0;
fi
enablerPath="../features/$1/enable.sh"
if [ -f $enablerPath ]; then
    source $enablerPath;
    npm run build;
    exit 0;
else
    echo "Feature \"$1\" is not available";
    exit 1;
fi