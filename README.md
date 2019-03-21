[![npm](https://img.shields.io/npm/dt/enqueuer.svg)]()[![Build Status](https://travis-ci.org/enqueuer-land/enqueuer.svg?branch=master)](https://travis-ci.org/enqueuer-land/enqueuer)
[![Maintainability](https://api.codeclimate.com/v1/badges/a4e5c9dbb8983b4b1915/maintainability)](https://codeclimate.com/github/enqueuer-land/enqueuer/maintainability) [![Greenkeeper badge](https://badges.greenkeeper.io/enqueuer-land/enqueuer.svg)](https://greenkeeper.io/)[![Known Vulnerabilities](https://snyk.io/test/npm/enqueuer/badge.svg)](https://snyk.io/test/npm/enqueuer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)



![enqueuerlogo](https://raw.githubusercontent.com/enqueuer-land/enqueuer/master/docs/images/fullLogo1.png "Enqueuer Giant Logo")

----

Have you ever struggled with testing multi IPC protocol flows?
Want to ensure that a user journey which involves several steps with different protocols is working properly?
Depending services have become a pain?
Don't you worry anymore. Enqueuer is what you're looking for.

### Enqueuer
It's ~~not just~~ an integration testing tool. It is a platform that provides the following capabilities:  
- Support for many protocols out of the box  
- Easily mock numerous services to alleviate the headaches of functional and integration tests  
- Friendly for developers and non developers  
- Built in assertion library to verify response data coming from/going to your services  
- Easily extensible behavior through third party [plugins](http://github.com/enqueuer-land/plugins-list), including your own [custom ones](https://github.com/enqueuer-land/plugin-scaffold)   
- CLI is easy to add to your team's existing CI pipelines  
- Places tests front and center  

Welcome to the enqueuer world.

#### install it
    $ npm install --global enqueuer
    
#### create a test file
Something like:
    
    #enqueuer-repo-hit.yml
    publishers:
    -   type: http
        url: https://github.com/enqueuer-land/enqueuer
        method: GET
        onMessageReceived:
            assertions:
            -   expect: statusCode
                toBeEqualTo: 200

Pretty simple, hum? Small and concise, how it should be!
    
##### run it

    $ enqueuer enqueuer-repo-hit.yml

What if I want to mock a http server and hit it at the same time, you may ask. Not a big deal for enqueuer lovers:
    
    #http-self-test.yml
    publishers:
    -   type: http
        url: http://localhost:9085/readme-example
        method: POST
        payload: does enqueuer rock?
        onMessageReceived:
            script: statusCode *= 2
            assertions:
                -   expect: body
                    toBeEqualTo: `yes, it does`
                -   expect: statusCode
                    toBeLessThan: 300
    subscriptions:
    -   type: http
        endpoint: /readme-example
        port: 9085
        method: POST
        response:
            status: 200
            payload: yes, it does
        onMessageReceived:
            assertions:
            -   expect: message.body
                toContain: `enqueuer`
                
##### run this other one

    $ nqr http-self-test.yml

I told you it was simple.
Now go nuts!
It's all yours. Have fun.
Check [this out](https://github.com/enqueuer-land/enqueuer/blob/master/examples/), you'll find countless examples. 
Certainly one is what you need.    
    
#### if you need more

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
      $ nqr -t expect
      $ nqr -l my-enqueuer-plugin-name -p plugin-protocol
      $ nqr -p http
      $ nqr --formatters-description json

----

### Components
In order to accomplish more than [just hitting enqueuer's repo](#create_a_test_file) or doing a [quick self http hit](#run_this_other_one), there are a few things that you'll probably need to know.
Don't worry, it's not too much and, as mentioned earlier, there is a lot of examples [here](https://github.com/enqueuer-land/enqueuer/blob/master/examples/), just in case. 
There are only three important component concepts: [requisitions](#requisition), [publishers](#publisher) and [subscriptions](#subscription).
They work along with each other and are responsible for the full behavior of enqueuer.

#### requisition
Test scenario description. It tells what, when, and how test your applications and services.
Picture it as if it was a collection of [publishers](#publisher), [subscriptions](#subscription) and other [requisitions](#requisition). It helps because this is exactly what it is.
As the others components, it has some attributes. All of them are optionals. And it supports multi-level test scenarios out of the box. Yeap, go as recursive as you want.
You don't know some of these attributes values yet? Don't worry, just put a variable there and let enqueuer replace it with the value you set later. 
[Variable replacements](#variables) are available through the entire requisition.

**name**  
Describes what the requisition is suppose to do.
Defaults to requisition index.

    name: requisition action

**timeout**  
Defaults to 5000.
Sets in milliseconds how long the requisition waits to expire.
Set to zero or less than zero to run it endlessly.

    timeout: 3000
    
**delay**  
Defaults to 0. Sets in milliseconds how long the test waits before starting. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/requisition-delay-iteration.yml) to get the full idea.

    delay: 0

**iterations**  
Defaults to 1. Sets how many times this test will be executed. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/requisition-delay-iteration.yml) and [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/recursion.yml) to get the full idea.

    iterations: 3

**ignore**  
Defaults to false. Tells to enqueuer that this requisitions should be skipped. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/ignore.yml) to see it working.

    ignore: true
    
**parallel**  
Defaults to false. Immediate children requisitions should be executed in parallel mode.
Take a look at [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/parallel.yml) to see it working.

    parallel: true

**import**  
Allows requisition files to be reused. Want to reuse the same requisition multiple times? This is you you need.
Take a look at [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/import.yml) and [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/reuse.yml) to behold this feature.

    import: path/to/another/requisition/file

**publishers**  
List of [publishers](#publisher)
    
    publishers:
    - name: some publisher name
      type: http
    - type: tcp

**subscriptions**  
List of [subscriptions](#subscription)

    subscriptions:
    - name: some subscription name
      type: udp
    - name: another subscription name
      type: file


**requisitions**  
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
It publishes something, it writes, it enqueues, hits and endpoint... These kinds of actions.
Every publisher has its own properties, depending on its protocol and implementation, but usually, they all have these properties.

**name**  
Defaults to publisher index.
Describes what the publisher is supposed to do.

    name: publisher action

**type**  
Mandatory. Key tag to identify which publisher will be instantiated

    type: http

**payload**  
Since a publisher usually publishes something, it's very likely you have to set a value here.
The message itself that will be send through this IPC protocol. Be it a string, a number, a boolean value or even whole objects.

    payload: value
    
**ignore**  
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
It consumes something, it reads, it dequeues, gets hit... These kinds of actions.
This means that it is not triggered by enqueuer itself. 
Rather than that, enqueuer waits on an external event to be triggered and then it asserts against the message that was passed to the subscription.
Every subscription has its own properties, depending on its protocol and implementation. But they all, usually, have these properties. 

**name**  
Defaults to subscription index.
Describes what the subscription is supposed to do.

    name: subscription action
    
**type**  
Mandatory. Key tag to identify which subscription will be instantiated

    type: http

**avoid**  
Identifies whether or not this subscription should not receive any message. Defaults to false.
If set and a message is received a failing test will be generated.
Take a look at [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/avoid.yml) to see it working.
On the other hand, when it's false and no message is received in a given timeout. The subscription is valid.
    
    avoid: false

**timeout**  
Sets in milliseconds how long the subscription waits to expire. Defaults to 3000.
Set to zero or less than zero to run it endlessly.

    timeout: 3000
    
**ignore**  
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
This is where you'll write your tests. In its `assertions` field.
Depending on the event's owner, there may be a variable called `publisher`, `subscription` or `requisition`.
You're free to explore them however you want, even doing things like this:

    publisher.parent.subscriptions[0].timeout = 1000;
 
#### hooks

There are three hook events available:

**onInit**  
Available in requisitions, publishers and subscriptions. It gets executed as soon as the test is initialized.

**onFinish**  
Available in requisitions, publishers and subscriptions. It gets executed when the test is about to finish.
As available parameter, an `elapsedTime` variable is given, counting every milliseconds since the instantiation of this component. 

**onMessageReceived**  
Available in every subscription and in publishers that provide synchronous properties. 
It gets executed when the subscription or publisher receives a message.
A `message` object is available having all of attributes returned from the received message.
Depending on the protocol implementation, there'll be additional objects to this hook.
For instance, in the built-in http publisher implementation, there's a `statusCode`, `headers` and a `body` among others, and the subscription implementation has `body`, `query`, `params` and `headers `, among other variables.
`elapsedTime` is also available here, counting every milliseconds since the instantiation of this component.

#### fields
Every hook object has 3 properties:

**script**  
Javascript code snippet executed when the event is triggered.
Yeah, I mean it. See it [it](https://github.com/enqueuer-land/enqueuer/blob/master/examples/crypto-require.yml) by yourself.
But be careful, with great power comes great responsibility.

**store**  
Data to be persisted across requisitions.  

**assertions**  
Array of assertions.
Run `$ nqr -t` to see available ones.
Of course, just like almost everything else in enqueuer world, you can extend this available list using some plugin.
You can [check them out](https://github.com/enqueuer-land/plugins-list#enqueuer-plugins) or even [write your own](https://github.com/enqueuer-land/plugin-scaffold).

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

**files**  
Requisition file names or glob. Enqueuer runs every file that matches an element value.

    files:
    - 1.yml
    - 2.yml
    - *.json

**parallel**  
Defaults to false. Requisition files should be executed in parallel mode. The requisition file itself is still sequential, but the files are executes in parallel.

    parallel: true

**log-level**  
Defaults to warning. Defines how information are logged in the console. Accepted values are: trace; debug; info; warning (default); error; and fatal.

    log-level: trace

**max-report-level-print**  
Defaults to 1. The deepest level of report to be printed to the console.

    max-report-level-print: 2

**plugins**  
List of in plugins used by the test scenarios. You can [check them out](https://github.com/enqueuer-land/plugins-list#enqueuer-plugins) or [write your own](https://github.com/enqueuer-land/plugin-scaffold). 
    
    plugins:
    - enqueuer-plugin-amqp 
    - enqueuer-plugin-ws 
    - enqueuer-plugin-mqtt
    - enqueuer-plugin-html-report

**outputs**  
Once enqueuer runs every execution, it compiles a summary and sends it to every publisher listed in output.
An important thing to note is that every available report publisher is available here.
Yes, it means that you are able to send this report through `http`, `tcp`, etc. or through a [plugin one](https://github.com/enqueuer-land/plugins-list#enqueuer-plugins) or a [custom one](https://github.com/enqueuer-land/plugin-scaffold).
You can run `$ nqr -p` to check available report publishers installed. 
Another important thing to note is the `format` value. By default a `json` summary is generated, but you can change it to whatever format you would like, such as: [Xunit](https://github.com/williamsdevaccount/enqueuer-plugin-xunit-report), [html](https://github.com/enqueuer-land/enqueuer-plugin-html-report)
You can run `$ nqr -f` to check available installed formats or even [write your own](https://github.com/enqueuer-land/plugin-scaffold)
    
    outputs:
    - type: file
      format: json (default)
      filename: output/examples.json
    - type: file
      format: yml
      filename: output/examples.yml
    - type: standard-output (default)
      format: console

**store**  
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
##### event
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

### Requisition Flow

![enqueuerInstanceFlow](https://raw.githubusercontent.com/enqueuer-land/enqueuer/master/docs/images/nqrFlow.png "Enqueuer Instance Flow")

[![NPM](https://nodei.co/npm/enqueuer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/enqueuer/)


### Stacker
Looking for a GUI enqueuer client? Consider checking the official enqueuer GUI: [stacker](https://lopidio.github.io/stacker/). It may be what you want.

### Open source

#### Contributing
We, and by 'we' I really mean 'I', are very opened to pull requests in general.
As long as they make sense and add value to the product, you're free to go.
We mean it, do it. Even if it's a type fix in this README file. Go ahead.
Just make sure it's not breaking anything running `$ npm run all` and then submit it.
If you like it but don't want to waste time creating a PR, no problem either. Create an issue. 
Or, even easier, give it it a github star. It's cheap and it doesn't hurt anyone.

#### Feedback
We'd love to get your feedback!
If you have any comments, suggestions, etc. you can reach us [here](github.com/enqueuer-land/enqueuer).

#### license
MIT

