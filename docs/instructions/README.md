<<<<<<< HEAD
###Running it
######Install it:
    
    $ npm install enqueuer -g

After installation, you can use ```enqueuer``` or ```nqr``` interchangeably. They mean the same thing.

######If you need some help:
=======
### Running it
First of all, you can use ```enqueuer``` or ```nqr``` interchangeably. They mean the same thing.

###### Install it:
    
    $ npm install enqueuer -g

###### If you need some help:
>>>>>>> 471f9ad21c9b60c8cee8090abd054ee6613f6c4a

    $ nqr -h
        Usage: nqr -c <confif-file-path>
        Options:
            -v, --version             output the version number
            -q, --quiet               Disable logging
            -l, --log-level <level>   Set log level
            -c, --config-file <path>  Set configurationFile
            -s, --store [store]       Add variables values to this session (default: )
            -h, --help                output usage information

###### Run it:

    $ nqr -c configFile.yml

<<<<<<< HEAD
####Configuration file
A configuration file must be used always. I said ALWAYS. I mean it.
They tell how **enqueuer** should proceed. Which tests will be executed, log-level, generated files.
You get the picture.
This file look like this: ![config-file](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-config.png "config-file.yml")

There are some examples
[here](https://github.com/lopidio/enqueuer/blob/develop/enqueuer.yml),
[here](https://github.com/lopidio/enqueuer/blob/develop/src/inceptionTest/beingTested.yml ) and
[here](https://github.com/lopidio/enqueuer/blob/develop/src/inceptionTest/tester.yml).
If you want to know more about them, [click here](https://github.com/lopidio/enqueuer/blob/develop/docs/instructions/config-file.yml "config file description").
=======
If you want to know more about these config files, [click here](https://github.com/lopidio/enqueuer/blob/develop/docs/instructions/config "config file descriptions").
>>>>>>> 471f9ad21c9b60c8cee8090abd054ee6613f6c4a
