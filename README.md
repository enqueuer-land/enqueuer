# enqueuer
[![npm version](https://badge.fury.io/js/enqueuer.svg)](https://badge.fury.io/js/enqueuer) [![Build Status](https://travis-ci.org/lopidio/enqueuer.svg?branch=develop)](https://travis-ci.org/lopidio/enqueuer)
[![Maintainability](https://api.codeclimate.com/v1/badges/a4e5c9dbb8983b4b1915/maintainability)](https://codeclimate.com/github/lopidio/enqueuer/maintainability) [![Greenkeeper badge](https://badges.greenkeeper.io/lopidio/enqueuer.svg)](https://greenkeeper.io/)

![enqueuerlogo](https://github.com/lopidio/enqueuer/blob/develop/docs/images/fullLogo1.png "Enqueuer Logo")

Have you ever wonder how to test multi IPC protocol flows?
Enqueuer is what you're looking for.

#### What it does
It is a microservice integration testing tool that supports a range of protocols (add your own [here](http://github.com/enqueuer-land/plugins-list)) and provides the following capabilities:
1. Initiates requests
1. Mock depending services
1. Assert against payload and message content
1. Easily extendable through [plugins architecture](http://github.com/enqueuer-land/plugins-list) 
1. CLI easily added to CI pipelines

##### Install it:
    $ npm install enqueuer
    
##### Run it:

    $ nqr configFile.yml
or

    $ nqr -a testFile.yml
    
###### Get some help:

    $ nqr -h
    Usage: nqr [options]
    
    Take a look at the full documentation: http://enqueuer.github.io/enqueuer
    
    Options:
    
      -v, --version                            output the version number
      -q, --quiet                              disable logging
      -b, --verbosity <level>                  set verbosity [trace, debug, info, warn, error, fatal]
      -c, --config-file <path>                 set configurationFile
      -o, --stdout-requisition-output          add stdout as requisition output
      -s, --store [store]                      add variables values to this session (default: [])
      -l, --add-plugin <plugin>                add plugin (default: [])
      -a, --add-file <file>                    add file to be tested (default: [])
      -A, --add-file-and-ignore-others <file>  add file to be tested and ignore others (default: [])
      -p, --protocols-description              describe protocols
      -f, --formatters-description             describe report formatters
      -t, --tests-list                         list available tests assertions
      -h, --help                               output usage information

----

## Configuration file

To save you sometime, a configuration file may be used.
They tell how **enqueuer** should proceed. Which tests will be executed, log-level, generated files.
You get the picture.
This file tells how enqueuer should be executed

    $ nqr [configuration-file.yml]

###### files
Requisition files name or glob
Enqueuer runs every file that matches an element value.

    files:
    - 1.yml
    - 2.yml
    - *.json

###### parallel
Whether requisition files are executed parallely 

    parallel: true (false by default)

###### log-level
Optional. Defines how information are logged in the console. Accepted values are: trace; debug; info; warning (default); error; and fatal.

    log-level: trace (warning)

###### plugins
Optional. List of in plugins module. You can check them [here](https://github.com/enqueuer-land/plugins-list#enqueuer-plugins) or write your own. 
    
    plugins:
    - enqueuer-plugin-amqp 
    - enqueuer-plugin-ws 
    - enqueuer-plugin-mqtt 

###### outputs
Once enqueuer runs every requisition, it compiles a summary and send it to every element listed through its defined 'type' value.
An important thing to note is that every available publisher is available here.
You can run `$ nqr -p` to check available ones. \
Another important thing to note is the 'format' value. By default a 'json' summary is generated, but you can change it to whatever format you want to.
You can run `$ nqr -f` to check available ones.
    
    outputs:
    - type: file
      format: json (default)
      filename: outputExamples/singleRunOutput.json
    - type: file
      format: yml
      filename: outputExamples/singleRunOutput.yml
    - type: standard-output (default)
      format: console

###### store
Values defined here, using 'key: value' pattern, are available to every throughout the entire execution

    store:
      tcpKey: "tcp value" # Defines 'tcpKey' key and its value 'tcp value'. 
      
      # there are two ways of using it:
      #   Non js code snippet: the easiest one is to type <<tcpKey>> where you want it to be replaced in a test file.
      #   js code snippet: simply store.tcpKey. So, you're able to use 'console.log(store.tcpKey)' and get 'tcp value' printed out in the console.
    
      'separated key': separated value
      
      object: # You can even define whole objects here:
        first: first value
        second:
          nested: thing

##### Example
[Here's](conf/singleRun.yml) an example of how it looks like.
