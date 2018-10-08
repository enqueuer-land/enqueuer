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

      $ nqr -p amqp
      publishers: 
          amqp: 
              alternativeNames: 
                  -
              library: 
                  name:      amqp
                  installed: true
                  version:   ^0.2.7
              documentation: 
                  messageOptions: 
                      optional:  true
                      reference: https://github.com/postwait/node-amqp#exchangepublishroutingkey-message-options-callbac
                  exchangeOptions: 
                      optional:  true
                      reference: https://github.com/postwait/node-amqp#connectionexchangename-options-opencallback
                  exchange: 
                      optional:    true
                      description: Routing key to have a message published in. If no value is given, it will be published in the 'default exchange'
                      example:     enqueuer.exchange
                  options: 
                      optional:    true
                      description: Connection options
                      host: 
                          optional:     true
                          description:  Host address
                          defaultValue: localhost
                      port: 
                          optional:     true
                          description:  Host port
                          defaultValue: 5672
                      reference:   https://github.com/postwait/node-amqp#connection-options-and-url
                  routingKey: 
                      description: Routing key to have a message published in
                      example:     enqueuer.integration.test.routing.key
      subscriptions: 
          amqp: 
              alternativeNames: 
                  -
              library: 
                  name:      amqp
                  installed: true
                  version:   ^0.2.7
              documentation: 
                  options: 
                      optional:    true
                      description: Connection options
                      host: 
                          optional:     true
                          description:  Host address
                          defaultValue: localhost
                      port: 
                          optional:     true
                          description:  Host port
                          defaultValue: 5672
                      reference:   https://github.com/postwait/node-amqp#connection-options-and-url
                  queueName: 
                      optional:     true
                      description:  Queue to be created while enqueuer is running. It lasts as long as enqueuer.
                      defaultValue: Randomly created name
                      example:      enqueuer.queue.name
                  exchange: 
                      optional:    true
                      description: Exchange name to have a message published in. If a value is set, a 'routingKey' has to be set as well.
                      example:     enqueuer.exchange
                  routingKey: 
                      optional:    true
                      description: Routing key to have a message published in. If a value is set, a 'exchange' has to be set as well.
                      example:     enqueuer.integration.#


##### And then install the ones you desire:
    
    $ npm install mqtt@^2.18.8 --no-optional
