# **enqueuer**
[![npm version](https://badge.fury.io/js/enqueuer.svg)](https://badge.fury.io/js/enqueuer) [![Build Status](https://travis-ci.org/lopidio/enqueuer.svg?branch=develop)](https://travis-ci.org/lopidio/enqueuer)

![enqueuerlogo](https://github.com/lopidio/enqueuer/blob/develop/docs/logo/fullLogo1.png "Enqueuer Logo")

## **TL;DR**
When your e-commerce http endpoint is hit, you have to send an information to a credit card processing API through MQTT, notify a marketing content provider through Rest/Http request, push a notification to the user with SQS, store data in a database and enqueue an AMQP message to a metric system.
Now, you have three options:
1. Write no test at all;
2. Write a component test for each one of these cases separately, mocking them all, handling with new dependencies, figure out details and deal with debugging them when they fail; or
3. Use **enqueuer** and have it all tested right out of the box.
![Report Example](https://github.com/lopidio/enqueuer/blob/develop/docs//mqttOutputExample.png "Report Example")

# summary
- [Motivation](#motivation)
- [What it does?](#what-it-does)
- [Why is it useful?](#why-is-it-useful)
- [How it works?](#how-it-works)
    - [Let me draw it for you](#let-me-draw-it-for-you)
- [How to use](#how-to-use)
    - [Go ahead and try it](#go-ahead-and-try-it)
- [Currently supported IPC protocols](#currently-supported-ipc-protocols)
- [Runnable](#runnable)
    - [When is a runnable result invalid](#when-is-a-runnable-result-invalid)
    - [Meta-Functions](#meta-functions)
- [Configuration file](#configuration-file)
    - [run-mode](#run-mode)
    - [outputs](#outputs)
    - [log-level](#log-level)
    - [variables](#variables)
- [~~Not so~~ frequently asked question](#not-so-frequently-asked-question)

[Take a look if you prefer to read it in portuguese](/README-PT_BR.md);

## motivation
It's not unusual, when developing reactive architectures, to have business flows full of several IPC protocols.
In many of these flows, be it because it's easy, or because it's the one the suits better, RESTful architectures based on HTTP requisitions are chosen.
However, there are cases that others IPC protocols are more appropriated, such as: amqp; mqtt; sqs etc..
Sometimes, it's natural that when triggered by a some kind of IPC protocol, the component outputs messages in others IPC protocol.
When it comes to multiprotocol flows, there is a need for a tool able to test, speed up the development process and be integrated to the CI server.
This is the concept behind **enqueuer**: a multi IPC protocol systems testing tool.  

## what it does?
Checks whether a flow acts as expected when trigger by some sort of event.
By "acts as expected" we mean:
  - publishes where it is suppose to publish;
  - publishes what it is suppose to publish; and
  - publishes faster than the its timeout.

## why is it useful?
It is meant to help your development process.
Although there are other ways of using it, the two main ways are:
  - using it while you are developing a new feature of your component, in some kind of TDDish way; and
  - adding it to your testing pipeline, so you'll be asserting that the event-driven-component still behaves properly in every commit.

## how it works?
1.	receives a [runnable](/playground "Runnable examples");
2.	starts the test by publishing or waiting on an event;
3.	waits up until every subscription is fulfilled or its timeout;
4.	executes hook tests upon these echanged messages;
5.	reports back the [final result](/outputExamples/).
    
#### let me draw it for you
This is how your event-driven-component acts when triggered by an *Input*:\
![2018-03-11 19_20_00](https://media.giphy.com/media/YWLDPktqvpBIBgzYEX/giphy.gif "Event-driven-component expected behavior")

**enqueuer** triggers the *Input*, so the component-to-be-tested acts.
Then, **enqueuer** collects outputs and checks if they are what they are supposed to be.
Quite simple, don't you think?

### how to use
    $ enqueuer --help
         Usage: enqueuer [options]
         Options:
           -V, --version             output the version number
           -v, --verbose             Activates verbose mode
           -l, --log-level <level>   Set log level
           -c, --config-file <path>  Set configurationFile
           -h, --help                output usage information

##### go ahead and try it:
    $ git clone https://github.com/lopidio/enqueuer.git
    $ cd enqueuer
    $ npm install
    $ npm run build
    $ enqueuer --config-file conf/enqueuer.yml --session-variables httpPayload=virgs

No big surprises, hum? As simple as `$enqueuer`.

#### currently supported IPC protocols
1. **Amqp**   - Advanced Message Queuing Protocol
2. **File**
3. **Http**   - Hypertext Transfer Protocol
4. **Kafka**
5. **Mqtt**   - Message Queuing Telemetry Transport
6. **Sqs**    - Amazon Simple Queue Service
7. **StdOut** - Process Standard output
8. **Stomp**  - Simple (or Streaming) Text Orientated Messaging Protocol
9. **Uds**    - Unix Domain Sockets

## runnable
Generally, a runnable looks like [this](/playground "Requisition examples") and [these](/integrationTest "Others examples").
Bellow there is a definition of a **runnable** and a **requisition**:
#### **runnable**:
-	**runnableVersion**: string, it tells you which version of runnable should be ran. Ex.: "01.00.00".
-	**name**: string, identifies the runnable throughout its execution.
-	**initialDelay**: optional number in milliseconds, it tells you how long the runnable has to wait before running a runnable. Ex.: 2000.
-	**runnables**: array of other **runnables** or **requisitions**. Yes, it can get recursive.

#### **requisition**:
-	**timeout**: optional number in milliseconds, it tells you how long the requisition has to wait before being considered as an invalid one. Ex.: 2000.
-	**name**: string, identifies the requisition throughout its execution.
-	**subscriptions**: subscription array
    -	**subscription**
        -	**type**: string, it tells how to identify and instantiate the proper subscription. Ex.: "mqtt", "kafka", "amqp" etc..
        -	**name**: string, identifies the subscription throughout its execution.
        -	**timeout**: optional number in milliseconds, how long the subscription has to wait to be considered as an invalid one. Ex.: 1000.
        -	**onMessageReceived**: optional js code, script executed when a message is received.
                There is a special variable **message** it is what was received by subscription and it's possible to make assertions over this. 
                Ex.: ```"test['some time has passed'] = new Date().getTime() + '' >= message"```.
                You can read more about meta-function code in the [**meta-Functions**](#meta-functions) session.
-	**startEvent**: object
    -	**publisher**: object
        -	**type**: string, it tells how to identify and instantiate the proper publisher. Ex.: "mqtt", "kafka", "amqp" etc..
        -	**name**: string, identifies the publisher throughout its execution.
        -	**payload**: object, what's is gonna be published. It may be whatever you want, even another [runnable](/src/inceptionTest/inceptionRunnable.enq).
        -	**prePublishing**: optional js code, script executed just before message publication. 
                There is a special variable called **publisher** and it will be the publisher attributes themselves.
                You can even redefine a new value for *publisher* attributes in run tume. 
                Like this: ```"publisher.payload=new Date().getTime();"``` or ```"publisher.type='mqtt'"```.
                As previously said, you can make assertions as well, you can read more about meta-function code in the [**meta-Functions**](#meta-functions) session.			
        -	**onMessageReceived**: optional js code, script executed when the protocol (generally a synchronous one) provides a return when a message is published.
                There is a special variable **message** it is what was received by subscription and it' possible to make assertions over this. 
                As previously said, you can make assertions as well, you can read more about meta-function code in the [**meta-Functions**](#meta-functions) session.

#### when is a runnable result invalid?
A runnable is invalid when:
- At least one nested runnable is invalid; or
- At least one inner requisition is invalid:
    - It has timed out; or
    - Start event has failed; or
        - has been unable to start; or
        - at least one test has been failed.
    - At least one subscription has failed:
        - has been unable to connect; or
        - has timed out; or
        - has not received any message; or
        - at least one test has failed.

The value '**valid**' in the root of report json file will be shown as **false** in the [report](/outputExamples/).

#### meta-functions
While writing a meta function body field (*onMessageReceived, prePublishing*) there is a variable called **test**:
-	**test**:
    To test something you can write: "test['label'] = booleanExpression;".
    The boolean value will be evaluated in runtime and every test assertion will be taken in consideration in order to determine whether a runnable is valid.
    Ex.: ```"test['test label'] = true;"```.
    These assertions results will be shown in [report](/outputExamples/).
-	**special functions**:
There will be three special functions **persistEnqueuerVariable(name, value)**, **persistSessionVariable(name, value)** and **deleteEnqueuerVariable(name)**
	There are three special functions that can be called inside this code: *persistEnqueuerVariable(name, value)*, *persistSessionVariable(name, value)* and *deleteEnqueuerVariable(name)*.
	In order to retrieve an *enqueuerVariable* or a *sessionVariable* use double curly-brackets: "{{variableName}}". Ex.: ```console.log({{httpPort}});```
		-	**persistEnqueuerVariable**:
		*EnqueuerVariables* are persisted in the [configuration File](/conf/enqueuer.yml), therefore they are persisted through every **enqueuer** execution. You can persist a *enqueuerVariable* through this code like this: ```persistEnqueuerVariable("httpPort", 23076);```
		-	**deleteEnqueuerVariable**:
		To delete the a *enqueuerVariable* do this: ```deleteEnqueuerVariable("httpPort");```.
		-	**persistSessionVariable**:
		In the other hand, *sessionVariables* are kept in memory, which means that they will be persisted just while the current **enqueuer** process is executed. To persist a *sessionVariable*, your code has to have: ```persistSessionVariable("sessionVar", 100)```;
 
 
## configuration file
By default, **enqueuer** reads [conf/enqueuer.yml](/conf/enqueuer.yml) file to configure its execution options.
Below, there is an explanation of each field of a configuration file.

#####run-mode:
Specifies in which execution mode **enqueueuer** will run. There are two options, mutually exclusive:
- *daemon* (default): it will run indefinitely. Endlessly. As a service. When running in daemon mode, it will be waiting for runnables through those mechanisms listed in *configFile.run-mode.daemon*.

- *single-run*:  this is the one that has to be used when your goal is to integrate your pipeline. It runs every file that matches the fileNamePattern value sorted in a lexicographical order.
Once all of the matching files are ran, **enqueuer** ends its execution, compiles a summary and saves it in a file defined in *configFile.run-mode.single-run.output-file* and returns, as status code:
     - 0, if all runnables are valid; or
     - 1, if there is at least one invalid runnable.
    
##### outputs:
Accepts a list of publishing mechanisms. So, every time a new runnable is executed, **enqueuer** publishes through this its result with values like: schema validation, id, its errors list etc. I think some of these [examples](/outputExamples/) may give you an idea.

##### log-level:
And last, but not least, log-level defines how execution information are logged in the standard output file descriptor.
Accepted values are: **trace**; **debug**; **info**; **warning**; **error**; and **fatal**.

##### variables:
Variables persisted across different **enqueuer** executions will be stored here. 

### ~~Not so~~ frequently asked question
1.	**Q**: Given that **enqueuer** is a tool that tests event-driven-components and it is also an event-driven-component, does it test itself?\
	**A**: I'm glad that you asked. As a matter of fact, yes, it does test itself, absolutely, [check it out.](/src/inceptionTest/inception.comp.ts "Inception Test")
