#!/usr/bin/env bash

#Stores current directory
currentDirectory=$(pwd)
injectableFileName=$1
srcFolder=$2

#Finds injector directory
injectorDir=$(dirname "${injectableFileName}")

#Enter into injector directory
cd ${srcFolder}

#Finds every .ts file
typescriptFiles=$(find . -type f -regex ".*\.ts" )

#Checks if file has "@Injectable" decorator
injectableFiles=()
for file in ${typescriptFiles}
do
    if grep -q "@Injectable" ${file} ; then
        #echo ${file} "is injectable"
        injectableFiles+=";"${file}
    fi
done

#Creates injectable string
injectableString=$(echo ${injectableFiles} | sed 's/;/import "/g' | sed 's/\.ts/"\\\n/g')

#gets back to first directory
cd ${currentDirectory}

#inserts in injectable-files-list.ts
echo -e "//#Auto-Generated Code\n"${injectableString}  > $1


