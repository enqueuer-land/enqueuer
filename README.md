[![npm](https://img.shields.io/npm/dt/enqueuer.svg)]()[![Build Status](https://travis-ci.org/enqueuer-land/enqueuer.svg?branch=master)](https://travis-ci.org/enqueuer-land/enqueuer)
[![Maintainability](https://api.codeclimate.com/v1/badges/a4e5c9dbb8983b4b1915/maintainability)](https://codeclimate.com/github/enqueuer-land/enqueuer/maintainability) [![Greenkeeper badge](https://badges.greenkeeper.io/enqueuer-land/enqueuer.svg)](https://greenkeeper.io/)[![Known Vulnerabilities](https://snyk.io/test/npm/enqueuer/badge.svg)](https://snyk.io/test/npm/enqueuer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)



![enqueuerlogo](https://raw.githubusercontent.com/enqueuer-land/enqueuer/master/docs/images/fullLogo1.png "Enqueuer Giant Logo")

----

Have you ever struggled with testing multi IPC protocol flows?
Want to ensure that a user journey which involves several steps with different protocols is working properly?
Dependencies messages have become a pain?
Don't you worry anymore. Enqueuer is what you're looking for.

### Enqueuer
It's ~~not just~~ an integration testing tool. It is a platform that provides the following capabilities:\
- Support for many protocols out of the box\
- Easily mock numerous services to alleviate the headaches of functional and integration tests\
- Friendly for developers and non developers\
- Built in assertion library to verify response data coming from/going to your services\
- Easily extensible behavior through third party [plugins](http://github.com/enqueuer-land/plugins-list), including your own [custom ones](https://github.com/enqueuer-land/plugin-scaffold)\ 
- Built in CLI is easy to add to your team's existing CI pipelines\

#### install it
    $ npm install --global enqueuer
    
#### run it

    $ nqr configFile.yml
or

    $ nqr -a testFile.yml
    
#### get help

    $ nqr -h
    Usage: nqr [options]
    
    Take a look at the full documentation: http://enqueuer-land.github.io/enqueuer
    
    Options:
      -v, --version                             output the version number
      -b, --verbosity <level>                   set verbosity (default: "warn")
      -c, --config-file <path>                  set configurationFile
      -e, --parsers-list [parser]               list available object parsers
      -f, --formatters-description [formatter]  describe report formatters
      -o, --stdout-requisition-output           add stdout as requisition output
      -m, --max-report-level-print <level>      set max report level print
      -p, --protocols-description [protocol]    describe protocols
      -t, --tests-list                          list available tests assertions
      -s, --store [store]                       add variables values to this session (default: [])
      -l, --add-plugin [plugin]                 add plugin (default: [])
      -a, --add-file <file>                     add file to be tested (default: [])
      -A, --add-file-and-ignore-others <file>   add file to be tested and ignore others (default: [])
      -h, --help                                output usage information
    
    Examples:
      $ nqr --config-file config-file.yml --verbosity error --store key=value
      $ enqueuer -c config-file.yml test-file.yml --add-file another-test-file.yml -b info
      $ enqueuer test-file.yml --store someKey=true --store someOtherKey=false
      $ nqr --protocols-description -s key=value
      $ nqr -l my-enqueuer-plugin-name -p plugin-protocol
      $ nqr -p http
      $ nqr --formatters-description json

----

### Components
There are only three important component concepts: [requisitions](#requisition), [publishers](#publisher) and [subscriptions](#subscription).
They work along with each other and are responsible for the full behavior of enqueuer.

#### requisition
Test scenario description. It tells what and how test your applications and services.
It's a collection of [publishers](#publisher), [subscriptions](#subscription) and other [requisitions](#requisition).
It supports multi-level test scenarios out of the box.
[Variable replacements](#variables) are available through the entire requisition.

**name**\
Describes what the requisition is suppose to do.
Defaults to requisition index.

    name: requisition action

**timeout**\
Defaults to 5000.
Sets in milliseconds how long the requisition waits to expire.
Set to zero or less than zero to run it endlessly.

    timeout: 3000
    
**delay**\
Defaults to 0. Sets in milliseconds how long the test waits before starting. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/requisition-delay-iteration.yml) to get the full idea.

    delay: 0

**iterations**\
Defaults to 1. Sets how many times this test will be executed. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/requisition-delay-iteration.yml) and [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/recursion.yml) to get the full idea.

    iterations: 3

**ignore**\
Defaults to false. Tells to enqueuer that this requisitions should be skipped. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/ignore.yml) to see it working.

    ignore: true

**publishers**\
List of [publishers](#publisher)
    
    publishers:
    - name: some publisher name
      type: http
    - type: tcp

**subscriptions**\
List of [subscriptions](#subscription)

    subscriptions:
    - name: some subscription name
      type: udp
    - name: another subscription name
      type: file


**requisitions**\
A list of child scenarios. List of [requisitions](#requisition).
Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/recursion.yml) example, it may help.

    requisitions:
    - name: some requisition name
      iterations: 2
    - name: another requisition name
      delay: 200

##### events
Available events are described [here](#event). A `requisition` object is available to access and change its attributes.

    name: my name
    onInit:
      script: requisition.delay = 3000;
      assertions:
      - expectToBeDefined: requisition.name
    onFinish:  
      assertions:
      - expectToBeDefined: requisition.name

#### publisher

A publisher action is triggered by enqueuer itself. It **acts** whereas a [subscription](#subscription) **reacts**.
Every publisher has its own properties, depending on its protocol and implementation. But, usually, they all have these properties.

**name**\
Defaults to publisher index.
Describes what the publisher is supposed to do.

    name: publisher action

**type**\
Key tag to identify which publisher will be instantiated

    type: http

**payload**\
Since a publisher usually publishes something, it's very likely you have to set a value here.
The message itself that will be send through this IPC protocol. Be it a string, a number, a boolean value or even whole objects.

    payload: value
    
**ignore**\
Defaults to false. Tells to enqueuer that this publisher should be skipped. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/ignore.yml) to see it working.

    ignore: true    
    
##### events
Available events are described [here](#event). A `publisher` object is available to access and change its attributes.
Depending on the protocol and its implementation, such as `http` and `tcp`, there may exist a `onMessageReceived` event and a special object given `message`. 
On the other hand, an asynchronous protocol, like: `udp` and `amqp`, usually does not provide it. 

    onInit:
      script: publisher.ignore = false
      assertions:
      - expectToBeDefined: publisher.type
    onMessageReceived: #Provided in synchronous protocols  
      assertions:
      - expectToBeDefined: message
    onFinish:  
      assertions:
      - expectToBeDefined: publisher.type
  
#### subscription
A subscription is an "under demand" event. It **reacts** whereas a [publisher](#publisher) **acts**.
This means that it is not triggered by enqueuer itself. 
Rather than that, enqueuer waits on an external event to be triggered and then it asserts against the message that was passed to the subscription.
Every subscription has its own properties, depending on its protocol and implementation. But they all, usually, have these properties. 

**name**\
Defaults to subscription index.
Describes what the subscription is supposed to do.

    name: subscription action
    
**type**\
Key tag to identify which subscription will be instantiated

    type: http

**avoid**\
Identifies whether or not this subscription should not receive any message. Defaults to false.
If set and a message is received a failing test will be generated.
Take a look at [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/avoid.yml) to see it working.
On the other hand, when it's false and no message is received in a given timeout. The subscription is valid.
    
    avoid: false

**timeout**\
Sets in milliseconds how long the subscription waits to expire. Defaults to 3000.
Set to zero or less than zero to run it endlessly.

    timeout: 3000
    
**ignore**\
Defaults to false. Tells to enqueuer that this subscription should be skipped. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/ignore.yml) to see it working.

    ignore: true    

##### events
Available events are described [here](#event). A `subscription` object is available to access and change its attributes.  

    onInit:
      script: subscription.avoid = false;
      assertions:
      - expectToBeDefined: subscription.type
    onMessageReceived:  
      assertions:
      - expectToBeDefined: message
    onFinish:  
      assertions:
      - expectToBeDefined: subscription.type
      
----

### Event

Events are hook methods executed by enqueuer when an action occurs on publishers, subscriptions or requisitions.
There are three events available:

**onInit**\
Available in requisitions, publishers and subscriptions. It gets executed as soon as the test is initialized.

**onFinish**\
Available in requisitions, publishers and subscriptions. It gets executed when the test is about to finish.

**onMessageReceived**\
Available in every subscription and in publishers that provide synchronous properties. 
It gets executed when the subscription or publisher receives a message.
An additional `message` object is available having all of attributes returned from the received message.

#### fields
Every event object has 3 properties:

**script**\
Javascript code snippet executed when the event is triggered.\
**store**\
Data to be persisted\
**assertions**\
Array of assertions. Run `$ nqr -t` to see available ones.

    onInit:
      script: variableIdentifier = 'string value'
    
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

#### example
Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/hooks.yml) test file to see it in practice.

----

### Configuration File
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
Requisition should be executed in parallel mode

    parallel: true (false by default)

**log-level**\
Defines how information are logged in the console. Accepted values are: trace; debug; info; warning (default); error; and fatal.

    log-level: trace

**max-report-level-print**/
The deepest level of report to be printed to the console. Defaults to 2 (enqueuer + filename); 

    max-report-level-print: 2

**plugins**\
List of in plugins used by the test scenarios. You can [check them out](https://github.com/enqueuer-land/plugins-list#enqueuer-plugins) or [write your own](https://github.com/enqueuer-land/plugin-scaffold). 
    
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
      filename: output/examples.json
    - type: file
      format: yml
      filename: output/examples.yml
    - type: standard-output (default)
      format: console

**store**\
Values defined here use the 'key: value' pattern and are available to every test scenario throughout the entire execution

    store:
      variableKey: "my value" # Defines 'variableKey' key and its value 'my value'. 
      
      'separated key': 6
      
      object: # You can even define whole objects here:
        first: first value
        second:
          nested: thing

#### example
[Here's](https://github.com/enqueuer-land/enqueuer/blob/master/conf/config-example.yml) a complete example of a configuration file.

----

### Variables
Providing power and flexibility, enqueuer allows you to use variables placeholder replacement.
That's why there is a `store` field and you'll see a lot of `<<` and `{{` being used in the examples files.
It works as simple as this:

    name: my name is <<variableKey>>

Every time enqueuer sees these kind of notations, it searches in its store for a key/value pair like:
    
    variableKey: `enqueuer`

Then, when enqueuer parses the original map, it gets translated to this:
    
    name: my name is enqueuer

#### default values
By default, every ENV_VAR set is loaded automatically to the store. Check [this example](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/examples/store.yml#L11).

#### setting a variable
There are a few ways to set a value in the store.

##### configuration file
Configuration file's store as you can see [here](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/conf/singleRun.yml#L27)
##### command line
A command line argument `$ nqr --store key=value -s anotherVariable=true `
##### event.
Dynamically set it through an event. 
Be it in its [script](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/examples/store.yml#L5) field or straight through its store [field](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/examples/store.yml#L3). 

#### using it          
There are two ways of using them:
##### non js code snippet
The easiest one is to type `<<variableKey>>` or `{{variableKey}}` where you want it to be replaced in a test file, as you can see [here](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/examples/store.yml#L8)
##### js code snippet
Using the `store` object. It's attributes are the keys and their values are their respective values. 
Therefore, you're free to use `store.variableKey`, `console.log(store.variableKey);` or `console.log(2 * store['separated key']);` and get them.
Like [this](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/examples/store.yml#L5) one.

#### example 
Check out [this test example](https://github.com/enqueuer-land/enqueuer/blob/master/examples/variables.yml) test to see it working.

----

### Content File Injection
You are able to inject file content into a requisition/publisher/subscription field.

    file: <<file://misc/file-content.yml>>
    
Other than that, enqueuer can read it parse its content as an object using this familiar syntax: `<<tag://path/to/file?query=value&other=true>>`.

    requisition:
        json: <<json://misc/file-content.json>>
        yml: <<yml://misc/file-content.yml>>
        csv: <<csv://misc/file-content.csv?header=true&delimiter=;>>
        file: <<file://misc/file-content.yml>>
    
Once the object is parsed, your free to use it as a regular object in any event
    
    onInit:
        script: console.log(requisition.yml.deep.field);
    onFinish:
        assertions:
        -   expect: json.first
            toBeEqualTo: csv[0].first 

It get's event better. 
Due its fantastic plugin architecture design, you can extend its default modules and use any of [these](https://github.com/enqueuer-land/plugins-list#enqueuer-plugins) plugins or event [write your own](https://github.com/enqueuer-land/plugin-scaffold) to parse however you want.    
Run `$ nqr -e` to see available ones.
    
#### example 
Check out [this test example](https://github.com/enqueuer-land/enqueuer/blob/master/examples/file-placeholder.yml) test to get a full picture of it.

----

### Enqueuer Flow

![enqueuerInstanceFlow](https://raw.githubusercontent.com/enqueuer-land/enqueuer/master/docs/images/nqrFlow.png "Enqueuer Instance Flow")

[![NPM](https://nodei.co/npm/enqueuer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/enqueuer/)
