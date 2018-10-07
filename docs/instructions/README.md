###### Install it:
    
    $ npm install enqueuer --no-optional --global

After installation, you can use ```enqueuer``` or ```nqr``` interchangeably. They mean the same thing.
Adopting --no-optional flag, you download enqueuer with no additional dependencies. As raw as possible.
So you don't have to deal with a whole bunch of stuff you will not need.

###### If you need some help:

    $ nqr -h
    Usage: nqr [options] <confif-file-path>
    
    Options:
    
      -v, --version                           output the version number
      -q, --quiet                             disable logging
      -b, --verbosity <level>                 set verbosity [trace, debug, info, warn, error, fatal]
      -c, --config-file <path>                set configurationFile
      -s, --store [store]                     add variables values to this session (default: )
      -p, --protocols-description [protocol]  describe protocols
      -h, --help                              output usage information


###### Run it:

    $ nqr configFile.yml

#### Configuration file
A configuration file must be used always. I said ALWAYS. I mean it.
They tell how **enqueuer** should proceed. Which tests will be executed, log-level, generated files.
You get the picture.
This file look like this: ![config-file](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-config.png "config-file.yml")

There are some examples
[here](https://github.com/lopidio/enqueuer/blob/develop/enqueuer.yml),
[here](https://github.com/lopidio/enqueuer/blob/develop/src/inceptionTest/beingTested.yml ) and
[here](https://github.com/lopidio/enqueuer/blob/develop/src/inceptionTest/tester.yml).
If you want to know more about them, [click here](https://github.com/lopidio/enqueuer/blob/develop/docs/instructions/config-file.yml "config file description").

#### Installing new protocols
If installed using '--no-optional' flag, enqueuer is installed with just a few protocols.
But do not worry, you can add some protocols after installation.

##### To see available protocols

    $ nqr -p
    protocols: 
        publishers:    amqp, file, http, kafka, mqtt, sqs, stdout, stomp, tcp, udp, uds, zeromq
        subscriptions: amqp, file, http, kafka, mqtt, sqs, stdin, stomp, tcp, udp, uds, zeromq
    

##### To see deeper details:

    $ nqr -p mqtt
    mqtt: 
        alternativeNames: 
            -
        library: 
            name:      mqtt
            installed: true
            version:   ^2.18.8

##### And then install the ones you desire:
    
    $ npm install mqtt@^2.18.8 --no-optional
