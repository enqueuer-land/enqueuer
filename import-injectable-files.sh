#!/usr/bin/env bash

#Stores current directory
currentDirectory=$(pwd)

#Finds injector directory
injectorDir=$(find . -type f -regex ".*injector.ts" | sed 's|injector\.ts||')
#echo ${injectorDir} "is the injector.ts directory"

#Enter into injector directory
cd ${injectorDir}

#Finds every .ts file
typescriptFiles=$(find .. -type f -regex ".*\.ts" )

#Checks if file has "@Injectable" decorator
injectableFiles=()
for file in ${typescriptFiles}
do
    if grep -q "@Injectable" ${file} ; then
        #echo ${file} "is injectable"
        injectableFiles+=";"${file}
    fi
done

#Remove existent injectable string
sed -i '' '/\/\/\#Auto-Generated Code/,$d' injector.ts

#Creates injectable string
injectableString=$(echo ${injectableFiles} | sed 's/;/import "/g' | sed 's/\.ts/"\\\n/g')

#inserts in injector.ts
echo -e "//#Auto-Generated Code\n"${injectableString} >> injector.ts

#gets back to first directory
cd ${currentDirectory}

