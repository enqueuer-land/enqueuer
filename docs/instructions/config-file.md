----

## Configuration file

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
