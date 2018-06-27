# enqueuer
[![npm version](https://badge.fury.io/js/enqueuer.svg)](https://badge.fury.io/js/enqueuer) [![Build Status](https://travis-ci.org/lopidio/enqueuer.svg?branch=develop)](https://travis-ci.org/lopidio/enqueuer)

![enqueuerlogo](https://github.com/lopidio/enqueuer/blob/develop/docs/logo/fullLogo1.png "Enqueuer Logo")

# summary
**Enqueuer** is an asynchronous messages testing tool.

## what it does?
Checks whether an event-driven-component acts as expected.
By "acts as expected" we mean, the event-driven-component, when triggered by an event:
  - publishes where it is suppose to publish;
  - publishes what it is suppose to publish; and
  - publishes faster than the its timeout.

There is no doubt in how important events are, therefore, test them becomes a high priority task.
When developing an event-driven-architecture, it gets hard to keep track of how every component exchange messages with each other. Sometimes it occurs through message brokers, sometimes it is a synchronous http post and sometimes it writes a file.\
In an event-driven world all events happen asynchronously.
As soon as we exit the boundary of a service, we enter a non-deterministic world.
What **enqueuer** proposes to do is to give you confidence that a single component or a group of components in the same flow act like it should act when it was designed.
It makes you be sure that everything works as expected.

## why is it useful?
It is meant to help your development process.
Although there are other ways of using it, the two main ways are:
  - using it while you are developing a new feature of your component, in some kind of TDDish way; and
  - adding it to your testing pipeline, so you'll be asserting that the event-driven-component still behaves properly in every commit.

## how it works?
-	receives a [runnable](/playground "Runnable examples") from some IPC mechanism defined in its [configuration](/conf/enqueuer.yml);
-	confirms the runnable reception;
	-	starts the runnable (publishing or waiting on an event);
	-	waits for events published by the event-driven-component;
-	executes hook script upon these received events;
-	reports back the [result](/outputExamples/).
    
### let me draw it for you
This is how your event-driven-component should acts when triggered by an *Input*:\
![2018-03-11 19_20_00](https://media.giphy.com/media/YWLDPktqvpBIBgzYEX/giphy.gif "Event-driven-component expected behavior")

What **enqueuer** does is to trigger *Input*, by itself, so the component-to-be-tested acts like it should.
Then, **enqueuer** collects component-to-be-tested outputs and checks if they are what they are supposed to be.
Quite simple, don't you think?

When **enqueuer** receives a runnable, it starts an event described in the requisitions inside it and awaits until all expected outputs are fulfilled or timed out.
Once it happens, **enqueuer** gathers them all and reports the result back.

##### Go ahead and try it:
    $ git clone https://github.com/lopidio/enqueuer.git
    $ cd enqueuer
    $ npm install
    $ npm run build
    $ enqueuer --config-file conf/enqueuer.yml --session-variables httpPayload=virgs

### how to use
    $ enqueuer --help
         Usage: enqueuer [options]
         Options:
           -V, --version             output the version number
           -v, --verbose             Activates verbose mode
           -l, --log-level <level>   Set log level
           -c, --config-file <path>  Set configurationFile
           -h, --help                output usage information

No big surprises, hum? As simple as `$enqueuer`.

## runnable
Generally, a runnable looks like [this](/playground "Requisition examples") and [these](/integrationTest "Others examples").
Bellow there is a definition of a **runnable** and a **requisition**:
#### **runnable**:
-	**runnableVersion**: string, it tells you which version of runnable should be ran. Ex.: "01.00.00".
-	**name**: string, identifies the runnable throughout its execution.
-	**initialDelay**: optional number in milliseconds, it tells you how long the requisition has to wait before running a runnable. Ex.: 2000.
-	**runnables**: array of other **runnables** or **requisitions**. Yes, it can get recursive.

#### **requisition**:
-	**timeout**: optional number in milliseconds, it tells you how long the requisition has to wait before being considered as an invalid one. Ex.: 2000.
-	**name**: string, identifies the requisition throughout its execution.
-	**subscriptions**: subscription array
    -	**subscription**, object
        -	**type**: string, it tells how to identify and instantiate the proper subscription. Ex.: "mqtt".
        -	**name**: string, identifies the subscription throughout its execution.
        -	**timeout**: optional number in milliseconds, how long the subscription has to wait to be considered as an invalid one. Ex.: 1000.
        -	**onMessageReceived**: js code, script executed when a message is received.
                Here, there is a special variable called **message** and it will have the value received in the 
            subscription and you can make assertions on the received payload. 
            Ex.: ```"test['some time has passed'] = new Date().getTime() + '' >= message"```.
            You can read more about meta-function code in the **meta-function** session.
-	**startEvent**: object
    -	**publisher**: object
        -	**type**: string, it tells how to identify and instantiate the proper publisher. Ex.: "mqtt".
        -	**name**: string, identifies the publisher throughout its execution.
        -	**payload**: object, what's is gonna be published. It may be whatever you want: string, number or even another [runnable](/src/inceptionTest/inceptionRequisition.json).
        -	**prePublishing**: js code, script executed just before message publication. 
                    There is a special variable called **publisher** and it will be the publisher attributes themselves.
                You can even redefine a new value for *publisher* attributes in run tume. 
                Like this: ```"publisher.payload=new Date().getTime();"``` or ```"publisher.type='mqtt'"```.
                You can make assertions if you want to. 
                Ex.: ```"test['typeMqtt'] = publisher.type=='mqtt';"```.
            You can read more about meta-function code in the **meta-function** session.			

## configuration file
So, by default, **enqueuer** reads [conf/enqueuer.yml](/conf/enqueuer.yml) file to configure its execution options.
Below, there is an explanation of each field of a configuration file.

      run-mode:
Specifies in which execution mode **enqueueuer** will run. There are two options, mutually exclusive:
- *daemon* (default): it will run indefinitely. Endlessly. As a service. When running in daemon mode, it will be waiting for runnables through those mechanisms listed in *configFile.run-mode.daemon*.

- *single-run*:  this is the one that has to be used when your goal is to integrate your pipeline. It runs every file that matches the fileNamePattern value sorted in a lexicographical order.
Once all of the matching files are ran, **enqueuer** ends its execution, compiles a summary and saves it in a file defined in *configFile.run-mode.single-run.output-file* and returns, as status code:
     - 0, if all runnables are valid; or
     - 1, if there is at least one invalid runnable.
    
```
outputs:
```

Accepts a list of publishing mechanisms. So, every time a new runnable is executed, **enqueuer** publishes through this its result with values like: schema validation, id, its errors list etc. I think some of these [examples](/outputExamples/) may give you an idea.

    log-level:

And last, but not least, log-level defines how execution information are logged in the standard output file descriptor.
Accepted values are: **trace**; **debug**; **info**; **warning**; **error**; and **fatal**.

### meta-functions
As mentioned previously in runnable chapter of this README file. 
While writing a meta function body field (*onMessageReceived, prePublishing*) you have special values like a variable called **test** and three special functions **persistEnqueuerVariable(name, value)**, **persistSessionVariable(name, value)** and **deleteEnqueuerVariable(name)**;
-	special variables
	-	**test**:
		To test something you can write: "test['label'] = booleanValue;".
		The boolean value will be evaluated in runtime and every test assertion will be taken in consideration in order to determine whether a runnable is valid.
		Ex.: ```"test['test label'] = true;"```.
	-	**special functions**:
	There are three special functions that can be called inside this code: *persistEnqueuerVariable(name, value)*, *persistSessionVariable(name, value)* and *deleteEnqueuerVariable(name)*.
	In order to retrieve an *enqueuerVariable* or a *sessionVariable* use double curly-brackets: "{{variableName}}". Ex.: ```console.log({{httpPort}});```
		-	**persistEnqueuerVariable**:
		*EnqueuerVariables* are persisted in the [configuration File](/conf/enqueuer.yml), therefore they are persisted through every **enqueuer** execution. You can persist a *enqueuerVariable* through this code like this: ```persistEnqueuerVariable("httpPort", 23076);```
		-	**deleteEnqueuerVariable**:
		To delete the a *enqueuerVariable* do this: ```deleteEnqueuerVariable("httpPort");```.
		-	**persistSessionVariable**:
		In the other hand, *sessionVariables* are kept in memory, which means that they will be persisted just while the current **enqueuer** process is executed. To persist a *sessionVariable*, your code has to have: ```persistSessionVariable("sessionVar", 100)```;

### when is a runnable result invalid?
A runnable is invalid when:
- At least one inner runnable is invalid; or
- At least one inner requisition is invalid:
    - It has timed out; or
    - Start event has failed; or
        - has been unable to connect; or
        - at least one test has been failed.
    - At least one subscription has failed:
        - has been unable to connect; or
        - has timed out; or
        - has not received any message; or
        - at least one test has failed.

The value '**valid**' in the root of report json file will be shown as false and there will be an error description justifying it.

 
### frequently asked question
1.	**Q**: Given that **enqueuer** is a tool that tests event-driven-components and it is also an event-driven-component, does it test itself?\
	**A**: I'm glad that you asked. As a matter of fact, yes, it does test itself, absolutely, [check it out.](/src/inceptionTest/inception.comp.ts "Inception Test")

#### currently supported IPCs
1. Amqp - Advanced Message Queuing Protocol
2. File
3. Http - Hypertext Transfer Protocol
4. Kafka
5. Mqtt - Message Queuing Telemetry Transport
6. Sqs - Amazon Simple Queue Service
7. StdOut - Process Standard output
8. Stomp - Simple (or Streaming) Text Orientated Messaging Protocol
9. Uds - Unix Domain Sockets