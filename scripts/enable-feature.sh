#!/usr/bin/env bash


if [ "$1"  == "list" ]; then
    ls -1d features/*
    exit 0;
fi
enablerPath="features/$1/enable.sh"
if [ -f $enablerPath ]; then
    source $enablerPath;
    npm run build;
    exit 0;
else
    echo "Feature \"$1\" is not available";
    exit 1;
fi