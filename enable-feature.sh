#!/usr/bin/env bash

enablerPath="./features/$1/enable.sh"
source $enablerPath;
npm run build