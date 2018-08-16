###Running it
First of all, you can use ```enqueuer``` or ```nqr``` interchangeably. They mean the same thing.

######Install it:
    
    $ npm install enqueuer -g

######If you need some help:

    $ nqr -h
        Usage: nqr -c <confif-file-path>
        Options:
            -v, --version             output the version number
            -q, --quiet               Disable logging
            -l, --log-level <level>   Set log level
            -c, --config-file <path>  Set configurationFile
            -s, --store [store]       Add variables values to this session (default: )
            -h, --help                output usage information

######Run it:

    $ nqr -c configFile.yml
    
A config file looks like ![config-file](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-config.png "config-file.yml")
and has to be used with **enqueuer**. ALWAYS.

If you want to know more about these config files, ![click here](https://github.com/lopidio/enqueuer/blob/develop/docs/instructions/config "config file descriptions").