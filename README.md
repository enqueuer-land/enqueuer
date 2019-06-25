[![npm](https://img.shields.io/npm/dt/enqueuer.svg)]()
[![Build Status](https://travis-ci.org/enqueuer-land/enqueuer.svg?branch=master)](https://travis-ci.org/enqueuer-land/enqueuer)
[![Greenkeeper badge](https://badges.greenkeeper.io/enqueuer-land/enqueuer.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/npm/enqueuer/badge.svg)](https://snyk.io/test/npm/enqueuer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)



![enqueuerlogo](https://raw.githubusercontent.com/enqueuer-land/enqueuer/master/docs/images/fullLogo1.png "Enqueuer Giant Logo")

Want to ensure that a user journey which involves several steps with different protocols is working properly?
Have you ever struggled with testing multi protocol flows?
Depending services have become a pain?
Don't you worry anymore. Enqueuer is what you're looking for.

### What it is

It's ~~not just~~ an integration testing tool. It is a platform that provides the following capabilities:  
- Support for many protocols out of the box  
- Chainable message flows
- Easily mock numerous services to alleviate the headaches of functional and integration tests  
- Friendly for developers and non developers  
- Built in assertion library to verify response data coming from/going to your services  
- Easily extensible behavior through third party [plugins](http://github.com/enqueuer-land/plugins-list), including your own [custom ones](https://github.com/enqueuer-land/plugin-scaffold)   
- CLI is easy to add to your team's existing CI pipelines  
- Act and react on your system under test  
- Place tests front and center  

Welcome to the enqueuer world.

#### install it
First things first, let's get the enqueuer installed on your machine.

    $ npm install --global enqueuer
    
Alright, it's time to create a requisition file.
Something like:
    
    #enqueuer-repo-hit.yml
    publishers:
    -   type: http
        url: https://github.com/enqueuer-land/enqueuer
        onResponseReceived:
            assertions:
            -   expect: statusCode
                toBeEqualTo: 200

Pretty simple, hum? Small and concise, how it should be!
Run it:

    $ enqueuer enqueuer-repo-hit.yml

What if I want to mock a http server and hit it at the same time, you may ask. Not a big deal for enqueuer lovers:
    
    name: readme self-test
    publishers:
    -   type: http
        url: http://localhost:9085/readme-example
        method: POST
        payload: does enqueuer rock?
        onResponseReceived:
            script: doubleStatus = statusCode * 2
            assertions:
                -   expect: body
                    toBeEqualTo: `mock response`
                -   expect: doubleStatus
                    toBeGreaterThan: 300
    subscriptions:
    -   type: http
        name: mock endpoint
        endpoint: /readme-example
        port: 9085
        method: POST
        response:
            status: 200
            payload: mock response
        onMessageReceived:
            assertions:
            -   expect: body
                toContain: `enqueuer`
            -   name: failing test
                expectToBeTruthy: false
                
Note that the second subscription assertion is a failing one. By running this example, we get this:

    $ nqr http-self-test.yml
       [FAIL]      readme self-test                                                   6 tests passing of 7 (85.71%) ran in 37ms
       [FAIL] enqueuer                                                                6 tests passing of 7 (85.71%) ran in 42ms
                   enqueuer › readme self-test › mock endpoint › failing test
                               Expecting 'false' to be true. Received: false

I told you it was simple.
Now, let's say you want to mix different protocols to test a bit more complex flow.
How about publishing an amqp message and making sure that, once a service consumes that message an endpoint of your is hit?
In order to achieve that, we have to make use of a [plugin](#plugins), given that amqp support is provided by a plugin.
In this scenario, we're talking about the [amqp plugin](https://github.com/enqueuer-land/enqueuer-plugin-amqp).
Once we get this [plugin installed](#plugin_installation) we are able to create and run files like this:

    publishers:
    -   type: amqp
        payload: 123456
        exchange: enqueuer.exchange
        routingKey: enqueuer.readme.routing.key
    subscriptions:
    -   type: http
        endpoint: /polyglot-flow
        port: 8080
        method: GET
        response:
            status: 200
            payload: polyglot message
        onMessageReceived:
            assertions:
            -   expect: body
                toContain: 123456

Now go nuts!
It's all yours. Have fun.
If you want more examples about `http`, consider looking at [this test](https://github.com/enqueuer-land/enqueuer/blob/master/examples/http-more-examples.yml). 
Check [this out](https://github.com/enqueuer-land/enqueuer/blob/master/examples/), you'll find countless examples. 
Certainly one is what you need.    
    
#### if you need more

    $ nqr -h
    Usage: nqr [options] <test-file> [other-test-files...]
    
    Take a look at the full documentation: https://enqueuer.com
    
    Options:
      -v, --version                             output the version number
      -b, --verbosity <level>                   set verbosity (default: "warn")
      -c, --config-file <path>                  set configurationFile
      -e, --parsers-list [parser]               list available object parsers
      -f, --formatters-description [formatter]  describe report formatters
      -o, --stdout-requisition-output           add stdout as requisition output
      -m, --max-report-level-print <level>      set max report level print
      -p, --protocols-description [protocol]    describe protocols
      -t, --tests-list [expectedField]          list available tests assertions
      -u, --loaded-modules-list                 list loaded modules
      -i, --show-passing-tests                  show passing tests
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
In order to accomplish more than just hitting enqueuer's repo or doing a quick self http hit, there are a few things that you'll probably need to know.
Don't worry, it's not too much and, as mentioned earlier, there is a lot of examples [here](https://github.com/enqueuer-land/enqueuer/blob/master/examples/), just in case. 
There are only three important component concepts: [requisitions](#requisition), [publishers](#publisher) and [subscriptions](#subscription).
They work along with each other and are responsible for the full behavior of enqueuer.

#### requisition
Test scenario description. It tells what, when, and how test your applications and services.
Picture it as if it was a collection of [publishers](#publisher), [subscriptions](#subscription) and other [requisitions](#requisition).
It helps because this is exactly what it is.
As the others components, it has some attributes. All of them are optionals. And it supports multi-level test scenarios out of the box. Yeap, go as recursive as you want.
Every test file is a requisition.
You don't know some of these attributes values yet? Don't worry, just put a variable there and let enqueuer replace it with the value you set later. 
[Variable replacements](#variables) are available through the entire requisition.

##### requisition attributes
These are the requisition attributes:

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
Defaults to 0. Sets in milliseconds how long the test waits before starting. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/requisition-delay-iterations.yml) to get the full idea.

    delay: 0

**iterations**  
Defaults to 1. Sets how many times this test will be executed. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/requisition-delay-iterations.yml) and [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/recursion.yml) to get the full idea.

    iterations: 3

**ignore**  
Defaults to false. Tells to enqueuer that this requisitions should be skipped. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/ignore.yml) to see it working.

    ignore: true
    
**parallel**  
Defaults to false. Immediate children requisitions should be executed in parallel mode.
Take a look at [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/parallel-requisition.yml) to see it working.

    parallel: true

**import**  
Allows requisition to be dynamically defined, be it by loading an external file or creating dynamically by other requisitions. Want to reuse the same requisition multiple times? This is you you need.
Take a look at [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/import.yml) to behold this feature.

    import: path/to/another/requisition/file

**publishers**  
List of [publishers](#publisher). They're executed simultaneously, therefore, the order is **irrelevant**.
    
    publishers:
    - name: some publisher name
      type: http
    - type: tcp

**subscriptions**  
List of [subscriptions](#subscription). They're executed simultaneously, therefore, the order is **irrelevant**.

    subscriptions:
    - name: some subscription name
      type: udp
    - name: another subscription name
      type: file


**requisitions**  
A list of child scenarios. List of [requisitions](#requisition). 
By default, they're executed **sequentially**, therefore, the order is *relevant*.
Unless the *parallel* attribute is set to true, what makes them get executed **simultaneously**, 
Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/recursion.yml) example, it may help.

    requisitions:
    - name: some requisition name
      iterations: 2
    - name: another requisition name
      delay: 200

##### events
Available events are described [here](#event). A `this` object is available to access and change requisition attributes.

    name: my name
    onInit:
      script: this.delay = 3000;
      assertions:
      - expectToBeDefined: this.name
    onFinish:  
      assertions:
      - expectToBeDefined: this.name

#### publisher

A publisher action is triggered by enqueuer itself. It **acts** whereas a [subscription](#subscription) **reacts**.
It publishes something, it writes, it enqueues, hits and endpoint... These kinds of actions.
It's worth noting that it always **creates** a message. 
That's the reason why there's an implicitly created test in **onFinish** hook verifying if the message got published.

##### publisher attributes
Every publisher has its own properties, depending on its protocol and implementation.
The built-in [`http` publisher](https://github.com/enqueuer-land/enqueuer/blob/master/examples/http.yml) implementation, for instance, demands a `url`, a `method`, and a `payload`, if the method is not a `GET`.
On the other hand, the built-in [`tcp` publisher](https://github.com/enqueuer-land/enqueuer/blob/master/examples/tcp.yml) implementation requires a `serverAddress` and a `port`. 
These are the publisher attributes:

**name**  
Defaults to publisher index.
Describes what the publisher is supposed to do.

    name: publisher action

**type**  
Mandatory. Key tag to identify which publisher will be instantiated

    type: http

**payload**  
Since a publisher usually publishes something, it's very likely you have to set a value here.
The message itself that will be send through this protocol. Be it a string, a number, a boolean value or even whole objects.

    payload: value
    
**ignore**  
Defaults to false. Tells to enqueuer that this publisher should be skipped. Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/ignore.yml) to see it working.

    ignore: true
    
##### events
Available events are described [here](#event). A `this` object is available to access and change publisher attributes.
Depending on the protocol and its implementation, such as `http` and `tcp`, there may exist special events, such as `onMessageReceived` event and a special object given `message`. 
On the other hand, an asynchronous protocol, like: `udp` and `amqp`, usually do not provide it. 

    onInit:
      script: this.ignore = false
      assertions:
      - expectToBeDefined: this.type
    onMessageReceived: #Provided in synchronous protocols  
      assertions:
      - expectToBeDefined: message
    onFinish:  
      assertions:
      - expectToBeDefined: this.type
  
#### subscription
A subscription is an "under demand" event. It **reacts** whereas a [publisher](#publisher) **acts**.
It consumes something, it reads, it dequeues, gets hit... These kinds of actions.
This means that it is not triggered by enqueuer itself. 
Rather than that, enqueuer waits on an external event to be triggered and then it asserts against the message that was passed to the subscription.
It's worth noting that it always **receives** a message. 
That's the reason why there's an implicitly created test in **onFinish** hook verifying if a message got received.

##### subscription attributes
Every subscription has its own properties, depending on its protocol and implementation.
The built-in [`http` subscription](https://github.com/enqueuer-land/enqueuer/blob/master/examples/http.yml) implementation, for instance, demands an `endpoint`, a `method`, and a `port`, if the method is not a GET.
On the other hand, the built-in [`tcp` subscription](https://github.com/enqueuer-land/enqueuer/blob/master/examples/tcp.yml) implementation requires only a `port`. 
 
These are the subscription attributes:

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
Available events are described [here](#event). A `this` object is available to access and change subscription attributes.  

    onInit:
      script: this.avoid = false;
      assertions:
      - expectToBeDefined: this.type
    onMessageReceived:  
      assertions:
      - expectToBeDefined: message
    onFinish:  
      assertions:
      - expectToBeDefined: this.type
      
----

### Event

Events are hook methods executed by enqueuer when an action occurs on publishers, subscriptions or requisitions.
This is where you'll write your tests. In its `assertions` field.
There will be a variable called `this` and, depending on the event's owner, it has an alias `publisher`, `subscription` or `requisition`.
You're free to explore them however you want, even doing things like this:

    publisher.parent.subscriptions[0].timeout = 1000;
 
#### hooks

By default, there are three hook events available:

**onInit**  
Available in requisitions, publishers and subscriptions. It gets executed as soon as the component is initialized.
As available parameter, an `elapsedTime` variable is given, counting every milliseconds since the instantiation of this component.

**onFinish**  
Available in requisitions, publishers and subscriptions. It gets executed when the component is about to finish.
As available parameter, an `elapsedTime` variable is given, counting every milliseconds since the instantiation of this component. 

**custom**
Depending on the protocol implementation/library/author's mood, the publisher/subscription may have additional hooks.
Such as `onError`, `onResponseReceived`, `onFileNotFound` and `onRedirect`... 
[Http-proxy subscription test file](https://github.com/enqueuer-land/enqueuer/blob/master/examples/http-proxy.yml) is an excellent example, check it out.

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
Consider looking at [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/assertions.yml) test example.
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

#### event example
Check [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/hooks.yml) test file to see it in practice.

----

### Requisition Flow
Now that you know what are requisitions, publishers, subscriptions and events. How about seeing how they interact with each other in a fancier way?

![enqueuerInstanceFlow](https://raw.githubusercontent.com/enqueuer-land/enqueuer/master/docs/images/nqrFlow.png "Enqueuer Instance Flow")

----

### Configuration File
To save yourself some time, a configuration file may be used.
Configuration files tell enqueuer which tests will be executed, log-level, and which output test report files should be generated.
This file tells how enqueuer should be executed.
To run enqueuer with the configuration:

    $ nqr -c path/to/configuration/file.yml
or
    
    $ nqr --config-file path/to/configuration/file.yml

#### attributes
These are the configuration file attributes:

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
List of in [plugins](#plugins) used by the test scenarios. You can [check them out](https://github.com/enqueuer-land/plugins-list#enqueuer-plugins) or [write your own](https://github.com/enqueuer-land/plugin-scaffold). 
    
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
    
By default, every ENV_VAR set is loaded automatically to the store. Check [this example](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/examples/store.yml#L11).

#### set a variable
There are a few ways to set a value in the store.

##### configuration file
Configuration file store object. Set it as you wish, as you can see [here](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/conf/singleRun.yml#L27)

##### command line
A command line argument using the `key=value` format. This way: 
    
    $ nqr --store key=value -s anotherVariable=true

##### event
Dynamically set it through any [event](#event). 
Be it in its [script](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/examples/store.yml#L5) field or straight through its store [field](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/examples/store.yml#L3).
Both ways work:

    onInit:
        script: store.key = 123;
        store:
            anotherKey: `another Value` 

#### use a variable          
There are two ways two use a variable:

##### non js code snippet
The easiest one is to type `<<variableKey>>` or `{{variableKey}}` where you want it to be replaced in a test file, as you can see [here](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/examples/store.yml#L8)

##### js code snippet
Using the `store` object. It's attributes are the keys and their values are their respective values. 
Therefore, you're free to use `store.variableKey`, `console.log(store.variableKey);` or `console.log(2 * store['separated key']);` and get them.
Like [this](https://github.com/enqueuer-land/enqueuer/blob/64198b944849df2cb5bd23cbfb6d0a224d6b5167/examples/store.yml#L5) one.

#### variables example 
Check out [this test example](https://github.com/enqueuer-land/enqueuer/blob/master/examples/variables.yml) test to see it working.

----

### Content File Injection
You are able to inject file content into a requisition/publisher/subscription field.

    file: <<file://path/to/file.txt>>
    
Other than that, enqueuer can read it and parse its content as an object using this familiar syntax: `<<tag://path/to/file?query=value&other=true>>`.

    requisition:
        json: <<json://path/to/file.json>>
        yml: <<yml://path/to/file.yml>>
        csv: <<csv://path/to/file.csv?header=true&delimiter=;>>
        file: <<file://path/to/file.txt>>
    
Once the object is parsed, your free to use it as a regular object in any event
    
    onInit:
        script: console.log(requisition.yml.deep.field);
    onFinish:
        assertions:
        -   expect: json.key
            toBeEqualTo: csv[0].key

It get's event better. 
Due its fantastic plugin architecture design, you can extend its default modules and use any of [these](https://github.com/enqueuer-land/plugins-list#enqueuer-plugins) plugins or event [write your own](https://github.com/enqueuer-land/plugin-scaffold) to parse however you want.
The built-in modules for object parsers are: `json`, `yml`, `csv` and `file`. 
Run `$ nqr -e` to see available ones.

#### example 
Check out [this test example](https://github.com/enqueuer-land/enqueuer/blob/master/examples/file-placeholder.yml) test to get a full picture of it.

----

### Plugins
You're probably aware by now but it doesn't hurt do emphasize it: enqueuer provides an amazingly powerful plugin extensible architecture.
It has [several plugins available](https://github.com/enqueuer-land/plugins-list#enqueuer-plugins), but if none of them pleases you, you're free to [create your own](https://github.com/enqueuer-land/plugin-scaffold).
Albeit you don't have to share the one you created, we encourage you to do so. Then go ahead and publish yours to npm and add it to our [plugins list](https://github.com/enqueuer-land/plugins-list#enqueuer-plugins).  

#### plugin types
So far, you're able to extend enqueuer default behavior in four ways. Using a protocol plugin, an object parser plugin, an asserter plugin and using a report formatter plugin.

##### protocol
A protocol plugin enables you to use a different publisher/subscription types. 
Run `$ nqr -p [protocol-name]` to get the full available list:

    publishers: 
    -   name:                  custom
    -   name:                  file
    -   name:                  http
        messageReceivedParams: statusCode, statusMessage, body
    -   name:                  stdout
    -   name:                  tcp
    -   ...
    subscriptions: 
    -   name:                  custom
    -   name:                  file
        messageReceivedParams: content, name, size, modified, created
    -   name:                  http
        messageReceivedParams: headers, params, query, body
    -   name:                  stdin
    -   name:                  tcp
        messageReceivedParams: payload, stream
    -   ...

Each one listed above has a respective example in [the examples folder](https://github.com/enqueuer-land/enqueuer/blob/master/examples).
[This one](https://github.com/enqueuer-land/enqueuer-plugin-amqp), for instance, provides support for amqp protocol, so you can create this publisher and subscription:
    
    publishers:
    -   type: amqp
        payload: enqueuermaniac
        exchange: enqueuer.exchange
        routingKey: enqueuer.integration.test.routing.key
    subscriptions:
    -   type: amqp
        exchange: enqueuer.exchange
        routingKey: enqueuer.integration.test.routing.#
        onMessageReceived:
            assertions:
            -   expect: payload
                toBeEqualTo: `enqueuermaniac`

##### object parser
An object parser plugin enables you to read and parse files as you wish.
[This test example](https://github.com/enqueuer-land/enqueuer/blob/master/examples/file-placeholder.yml) demonstrates how to use it,
Run `$ nqr -e [object-parser-name]` to check available ones:

    parsers: 
    - yml, yaml
    - json
    - file
    - csv

[This one](https://github.com/enqueuer-land/enqueuer-plugin-xml-parser), for example, provides the ability to read xml files and inject their values like this:

    xmlContent: <<xml://path/to/xml/file.xml>>

##### asserter
An asserter plugin provides you a nicely way to use different assertions than these built-in ones.

    asserters: 
    -   expect: 
            required:    true
            type:        string, array
            description: actual value
        not: 
            required:    false
            type:        null
            description: negates
        toContain: 
            required:    true
            type:        string, any
            description: element

Looking at the asserter above, we can create assertions like these:
    
    assertions:
    -   expect: [`a`, 1, true]
        not:
        toContain: `b`
    -   expect: [`a`, 1, true]
        toContain: 1

Run `$ nqr -t` to get the full available list.
Consider looking at [this](https://github.com/enqueuer-land/enqueuer/blob/master/examples/assertions.yml) test example.
##### report formatter
A report formatter plugin gives you the ability to export enqueuer reports the way you want.
Run `$ nqr -f [formatter-name]` to list available report formatters:

    formatters: 
    - console, stdout
    - json
    - yml, yaml

Consider looking at the example of [configuration file](https://github.com/enqueuer-land/enqueuer/blob/master/conf/config-example.yml) to see it in use.
[This one](https://github.com/williamsdevaccount/enqueuer-plugin-xunit-report), for instance, generates xUnit like reports from enqueuer's output.


#### plugin installation
In order to enqueuer get awareness that you want to use a plugin, you have to tell it, right?
You can tell enqueuer to use a plugin in three different ways: using it as a command line argument, through the configuration file or letting enqueuer finding it in a default location.

##### command line
Tell enqueuer to use your plugin through command line this way `$ nqr -l <plugin-folder> -l <another-plugin-folder>`.
Where plugin-folder and another-plugin-folder are the directories where the plugins are installed in.
    
##### configuration file
Tell enqueuer to use your plugin through configuration file this way:
    
    plugins: 
    -   plugin-folder
    -   another-plugin-folder

Where plugin-folder and another-plugin-folder are the directories where the plugins are installed in.

##### implicitly
When enqueuer runs, it looks for modules in its same installation directory or in `.nqr` folder in the home directory, a.k.a. ~/ folder in linux distributions.
Therefore, if you run:
    
    $ npm install --global enqueuer
    $ mkdir ~/.nqr
    $ cd ~/.nqr
    $ npm install enqueuer-plugin-amqp
    $ nqr -p amqp
Or
    
    $ npm install --global enqueuer enqueuer-plugin-amqp
    $ nqr -p amqp
    
You'll see that the `enqueuer-plugin-amqp` plugin will be loaded.
Every enqueuer compatible module gets implicitly loaded.
In order to be enqueuer compatible, a module has to have an `entryPoint` exported function in its main file and, in its package.json file, it has to have either 'enqueuer' or 'nqr' as keywords.

### Stacker
Looking for ~~a really really good looking~~ an human error proof solution way of writing these requisition files?  
Consider taking a look at [stacker](https://lopidio.github.io/stacker/): open source, cross-platform, multi protocol client testing tool.
The official enqueuer's best friend forever. Do amazing things and change the world with enqueuer’s GUI!
With them, you create, manage and run requisitions and and see their results in a really nice way.
See this amazing beauty with your own eyes to get an idea of how it works:  

![screenshot-passing](https://raw.githubusercontent.com/lopidio/stacker/master/docs/img/http-passing-test.png)

----

### Open source
We (by 'we' we mean enqueuer's maintainers not the human race, unfortunately) are very opened to any kind of contributions in general.
As long as they make sense and add value to the product, you're free to go.
We mean it, do it. Even if it's a typo fix in this README file. Go ahead.
If you like it but don't want to waste time creating a pull request, no problem either.
Create an issue, or, even easier, give it a github star. It's cheap and it doesn't hurt anyone.
You know what? Just head up to [enqueuer's github repo](https://github.com/enqueuer-land/enqueuer) and keep staring at its repo.
It may help somehow. 

#### contributors
Thank you. It sounds *cliché*, but this project wouldn't be the same without the massive contribution from everyone.

#### code it
In order to contribute with some code, you have to follow a few steps.
First of all, get the code:

    $ git clone git@github.com:enqueuer-land/enqueuer.git
    $ cd enqueuer
    
Get its dependencies installed:
    
    $ npm install

Build it: 
    
    $ npm run build
    
Go for it. Make the changes you want.
After everything is done:

    $ npm run all
    
Commit it:

    $ npm run commit

Push it:

    $ git push

#### feedback
We'd love to get your feedback!
If you have any comments, suggestions, etc. you can reach us [here](mailto:guilherme.moraes@outlook.com).

[![NPM](https://nodei.co/npm/enqueuer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/enqueuer/)
