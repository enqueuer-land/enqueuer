###### Install it:
    
    $ npm install enqueuer --global

After installation, you can use ```enqueuer``` or ```nqr``` interchangeably. They mean the same thing.
Adopting --no-optional flag, you download enqueuer with no additional dependencies. As raw as possible.
So you don't have to deal with a whole bunch of stuff you will not need.

###### If you need some help:

    $ nqr -h
    Usage: nqr [options] <config-file-path>
    
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
      -h, --help                               output usage information


###### Run it:

    $ nqr configFile.yml
or

    $ nqr -a testFile.yml

#### Configuration file
To save you sometime, a configuration file may be used.
They tell how **enqueuer** should proceed. Which tests will be executed, log-level, generated files.
You get the picture.
This file look like this: ![config-file](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-config.png "config-file.yml")

There are some examples
[here](https://github.com/lopidio/enqueuer/blob/develop/conf/singleRun.yml),
[here](https://github.com/lopidio/enqueuer/blob/develop/conf/daemonRun.yml),
[here](https://github.com/lopidio/enqueuer/blob/develop/src/inception-test/conf/beingTested.yml) and
[here](https://github.com/lopidio/enqueuer/blob/develop/src/inception-test/conf/tester.json).
If you want to know more about them, [click here](https://github.com/lopidio/enqueuer/blob/develop/docs/instructions/config-file.yml "config file description").

#### Installing new protocols
If installed using '--no-optional' flag, enqueuer is installed with just a few protocols.
But do not worry, you can add some protocols after installation.

##### To see available protocols

    $ nqr -p

##### And then install the ones you desire:
    
    $ npm install enqueuer-plugin-mqtt
