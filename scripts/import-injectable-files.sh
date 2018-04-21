#!/usr/bin/env bash

#Stores current directory
currentDirectory=$(pwd)

#Finds injector directory
injectorDir=$(find ../ -type f -regex ".*injectable-files-list.ts" | sed 's|injectable-files-list\.ts||')
#echo ${injectorDir} "is the injectable-files-list.ts directory"

#Enter into injector directory
cd ${injectorDir}

#Finds every .ts file
typescriptFiles=$(find .. -type f -regex ".*\.ts" | grep -v "\.test\." )

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
sed -i '' '/\/\/\#Auto-Generated Code/,$d' injectable-files-list.ts

#Creates injectable string
injectableString=$(echo ${injectableFiles} | sed 's/;/import "/g' | sed 's/\.ts/"\\\n/g')

#inserts in injectable-files-list.ts
echo -e "//#Auto-Generated Code\n"${injectableString} >> injectable-files-list.ts

#gets back to first directory
cd ${currentDirectory}

