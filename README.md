[![npm](https://img.shields.io/npm/dt/enqueuer.svg)]()[![Build Status](https://travis-ci.org/enqueuer-land/enqueuer.svg?branch=master)](https://travis-ci.org/enqueuer-land/enqueuer)
[![Maintainability](https://api.codeclimate.com/v1/badges/a4e5c9dbb8983b4b1915/maintainability)](https://codeclimate.com/github/enqueuer-land/enqueuer/maintainability) [![Greenkeeper badge](https://badges.greenkeeper.io/enqueuer-land/enqueuer.svg)](https://greenkeeper.io/)[![Known Vulnerabilities](https://snyk.io/test/npm/enqueuer/badge.svg)](https://snyk.io/test/npm/enqueuer)


![enqueuerlogo](https://raw.githubusercontent.com/enqueuer-land/enqueuer/master/docs/images/fullLogo1.png "Enqueuer Giant Logo")

Have you ever struggled with testing multi IPC protocol flows?
Want to ensure that a user journey which involves several steps with different protocols is working properly?
 Enqueuer is what you're looking for.
#### Enqueuer
It's ~~not just~~ an integration testing tool. It is a platform that provides the following capabilities:\
- Support for many protocols out of the box\
- Easily mock services to alleviate the headaches of functional and integration tests\
- Friendly for developers and non developers\
- Built in assertion library to verify response data coming from your services\
- Easily extensible through third party [plugins](http://github.com/enqueuer-land/plugins-list), including your own [custom ones](https://github.com/enqueuer-land/plugin-scaffold)\ 
- Built in CLI is easy to add to your team's existing CI pipelines\

----


##### Install it:
    $ npm install --global enqueuer
    
##### Run it:

    $ nqr configFile.yml
or

    $ nqr -a testFile.yml
    
##### Get help:

    $ nqr -h
    Usage: nqr [options]
    
    Take a look at the full documentation: http://enqueuer-land.github.io/enqueuer
    
    Options:
      -v, --version                             output the version number
      -q, --quiet                               disable logging
      -b, --verbosity <level>                   set verbosity (default: "warn")
      -o, --stdout-requisition-output           add stdout as requisition output
      -s, --store [store]                       add variables values to this session (default: [])
      -p, --protocols-description [protocol]    describe protocols
      -f, --formatters-description [formatter]  describe report formatters
      -t, --tests-list                          list available tests assertions
      -l, --add-plugin [plugin]                 add plugin (default: [])
      -c, --config-file <path>                  set configurationFile
      -a, --add-file <file>                     add file to be tested (default: [])
      -A, --add-file-and-ignore-others <file>   add file to be tested and ignore others (default: [])
      -h, --help                                output usage information
    
    Examples:
      $ nqr --config-file config-file.yml --verbosity error --store key=value
      $ enqueuer -c config-file.yml -a test-file.yml --add-file another-test-file.yml -b info
      $ enqueuer -a test-file.yml --store someKey=true --store someOtherKey=false
      $ nqr --protocols-description -s key=value
      $ nqr -p http
      $ nqr --formatters-description json

----

#### Requisition
This describes the test scenario. It tells what and how test your applications and services.
It's a collection of [publishers](#publisher), [subscriptions](#subscription) and other [requisitions](#requisition).
It supports multi-level test scenarios out of the box.
[Variable replacements](#variables) are available through the entire requisition.

**name**\
Optional, describes what the requisition is suppose to do

    name: requisition action

**timeout**\
Sets in milliseconds how long the requisition waits to expire. Defaults to 5000.
Set to zero or less than zero to run it endlessly

    timeout: 3000
    
**delay**\
Optional. Defaults to 0. Sets in milliseconds how long the test waits before starting.

    delay: 0

**iterations**\
Optional. Defaults to 1. Sets how many times this test will be executed

    iterations: 3

**publishers**\
Optional. List of [publishers](#publisher)

**subscriptions**\
Optional. List of [subscriptions](#subscription)

**requisitions**\
Optional. A list of child scenarios. List of [requisitions](#requisition).

**events**\
Available events are described [here](#event). A `requisition` object is available to access and change its attributes.  

----

#### Publisher

A publisher action is triggered by enqueuer itself. It **acts** whereas a [subscription](#subscription) **reacts**.
Every publisher has its own properties, depending on its protocol and implementation. But they all have these properties.

**name**\
Optional, describes what the publisher is supposed to do

    name: publisher action

**payload**\
Since a publisher usually publishes something, it's very likely you have to set a value here.
The message itself that will be send through this IPC protocol. Be it a string, a number, a boolean value or even whole objects.

    payload: value
    
**events**\
Available events are described [here](#event). A `publisher` object is available to access and change its attributes.  

----

#### Subscription
A subscription is an "under demand" event. It **reacts** whereas a [publisher](#publisher) **acts**.
This means that it is not triggered by enqueuer itself. 
Rather than that, enqueuer waits on an external event to be triggered and then it asserts against the message that was passed to the subscription.
Every subscription has its own properties, depending on its protocol and implementation. But they all have these properties. 

**name**\
Optional, describes what the subscription is supposed to do

    name: subscription action

**avoid**\
Identifies whether or not this subscription should not receive any message. Defaults to false.
If set and a message is received a failing test will be generated.
On the other hand, when it's false and no message is received in a given timeout. The subscription is valid.
    
    avoid: false

**timeout**\
Sets in milliseconds how long the subscription waits to expire. Defaults to 3000.
Set to zero or less than zero to run it endlessly

    timeout: 3000

**events**\
Available events are described [here](#event). A `subscription` object is available to access and change its attributes.  

----
#### Event

Events are hook methods executed by enqueuer when an action occurs on publishers, subscriptions or requisitions.
There are three events available:

**onInit**\
Available in requisitions, publishers and subscriptions. It gets executed as soon as the test is initialized

**onFinish**\
Available in requisitions, publishers and subscriptions. It gets executed when the test is about to finish

**onMessageReceived**\
Available in every subscription and in publishers that provide synchronous properties. 
It gets executed when the subscription or publisher receives a message.
An additional `message` object is available having all of attributes returned from the received message.

##### fields
Every event object has 3 properties:

**script**\
Javascript code snippet executed when the event is triggered.\
**store**\
Data to be persisted\
**assertions**\
Array of assertions. Run `$ nqr -t` to see available ones

##### examples

    onInit:
      script: |-
        variableIdentifier = 'string value'
    
      assertions:
        - expect: variableIdentifier
          toBeEqualTo: `string value`
    
    onMessageReceived:
      script: |-
        message += 3;
        console.log(`Message received plus 3 is: ${message}`);
    
      store:
        key: message
    
      assertions:
        - name: anyValue #optional
          expect: message
          toBeEqualTo: store.key
        - expect: message + 3
          toBeGreaterThan: 3

#### Configuration File
To save yourself some time, a configuration file may be used.
Configuration files tell enqueuer which tests will be executed, log-level, and which output test report files should be generated.
This file tells how enqueuer should be executed

**files**\
Requisition file names or glob. Enqueuer runs every file that matches an element value.

    files:
    - 1.yml
    - 2.yml
    - *.json

**parallel**\
Optional. Requisition should be executed in parallel mode

    parallel: true (false by default)

**log-level**\
Optional. Defines how information are logged in the console. Accepted values are: trace; debug; info; warning (default); error; and fatal.

    log-level: trace

**plugins**\
Optional. List of in plugins used by the test scenarios. You can [check them out](https://github.com/enqueuer-land/plugins-list#enqueuer-plugins) or [write your own](https://github.com/enqueuer-land/plugin-scaffold). 
    
    plugins:
    - enqueuer-plugin-amqp 
    - enqueuer-plugin-ws 
    - enqueuer-plugin-mqtt
    - enqueuer-plugin-html-report

**outputs**\
Once enqueuer runs every requisition, it compiles a summary and sends it to every publisher listed in output.
An important thing to note is that every available report publisher is available here.
You can run `$ nqr -p` to check available report publishers. \
Another important thing to note is the `format` value. By default a `json` summary is generated, but you can change it to whatever format you would like.
You can run `$ nqr -f` to check available formats or event [write your own](https://github.com/enqueuer-land/plugin-scaffold)
    
    outputs:
    - type: file
      format: json (default)
      filename: outputExamples/singleRunOutput.json
    - type: file
      format: yml
      filename: outputExamples/singleRunOutput.yml
    - type: standard-output (default)
      format: console

**store**\
Values defined here use the 'key: value' pattern and are available to every test scenario throughout the entire execution

    store:
      tcpKey: "tcp value" # Defines 'tcpKey' key and its value 'tcp value'. 
      
      'separated key': 6
      
      object: # You can even define whole objects here:
        first: first value
        second:
          nested: thing

##### example
[Here's](https://github.com/enqueuer-land/enqueuer/blob/master/conf/singleRun.yml) a complete example of a configuration file.

----

#### Variables
Providing power and flexibility, enqueuer allows you to use variables placeholder replacement.
That's why there is a `store` field and you'll see a lot of `<<` and `{{` being used in the examples files.
It works as simple as this:

    name: my name is <<variableKey>>

Every time enqueuer sees these kind of notations, it searches in its store for a key/value pair like:
    
    variableKey: `enqueuer`

Then, when enqueuer parses the original map, it gets translated to this:
    
    name: my name is enqueuer

##### set a variable
There are a few ways to set a value in the store.

###### configuration file
configuration file's store
###### command line
a command line argument `$ nqr --store key=value`
###### event's store
dynamically set it through an event's store

##### using it          
There are two ways of using them:
##### non js code snippet
The easiest one is to type `<<tcpKey>>` where you want it to be replaced in a test file.\
##### js code snippet
Using the `store` object. It's attributes are the keys and their values are their respective values. 
Therefore, you're free to use `store.tcpKey`, `console.log(store.tcpKey);` or `console.log(2 * store['separated key']);` and get them.
 
Check out [this test example](https://github.com/enqueuer-land/enqueuer/blob/master/examples/variables.yml) test to see it working.

----

#### Content File Injection
You are able to insert file content in a requisition/publisher/subscription field.

    fileContent: <<json://path/to/file.json>>

In the above example, enqueuer will read the file and parse its content as a object.
Other parsable values include:

    csv: <<csv://misc/file-content.csv>>
    tsv: <<tsv://misc/file-content.tsv>>
    json: <<json://misc/file-content.json>>
    yml: <<yaml://misc/file-content.yml>>
    
The tag `file`, on the other hand, reads the content as a regular string
    
    file: <<file://misc/file-content.yml>>

You can even read java script code and insert it into a `script` field in an event object. You have no limits.
Check out [this test example](https://github.com/enqueuer-land/enqueuer/blob/master/examples/file-placeholder.yml) test to get a full picture of it.

----

#### Enqueuer Flow

![enqueuerInstanceFlow](https://raw.githubusercontent.com/enqueuer-land/enqueuer/master/docs/images/nqrFlow.png "Enqueuer Instance Flow")

[![NPM](https://nodei.co/npm/enqueuer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/enqueuer/)
