###### Install it:
    
    $ npm install enqueuer -g

After installation, you can use ```enqueuer``` or ```nqr``` interchangeably. They mean the same thing.

###### If you need some help:

    $ nqr -h
    Usage: nqr [options] <confif-file-path>
    
    Options:
    
      -v, --version                    output the version number
      -q, --quiet                      disable logging
      -b, --verbosity <level>          set verbosity [trace, debug, info, warn, error, fatal]
      -c, --config-file <path>         set configurationFile
      -s, --store [store]              add variables values to this session (default: )
      -l, --list-available-libraries   list available libraries
      -i, --install-library <library>  install library (default: )
      -h, --help                       output usage information

###### Run it:

    $ nqr -c configFile.yml

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
By default, enqueuer is installed with few protocols. So you don't have to deal with a whole bunch of unnecessary stuff.
Don't worry, you can add some protocols after installation.

##### To see the available ones:

    $ nqr -l
    Available dependencies: amqp; kafka-node; mqtt; aws-sdk; stomp-client; zeromq

##### To install one(s):

    $ nqr -i amqp -i mqtt
    Installing dependencies
    Installing amqp@^0.2.7 dependency
    Installing mqtt@^2.18.8 dependency
    amqp installed
    mqtt installed
    Dependencies were installed
