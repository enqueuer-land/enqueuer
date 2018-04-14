# enqueuer

### summary
**Enqueuer** is an event-driven-component asynchronous messages testing tool.

```There are many reasons why you should care about events; they drive autonomy, increase stability, help you move faster and allow for time travel, Jonas Bonér.```\
There is no doubt in how important events are, hence, test them becomes a high priority task. When developing an event-driven-architecture, it gets hard to keep track of how every component exchange messages with each other. Sometimes it occurs through message brokers, sometime it is a synchronous http post and sometimes it writes a file.\
In an event-driven world everything all events move asynchronously. As soon as we exit the boundary of a service, we enter a nondeterministic world. What **enqueuer** proposes to do is to give you confidence that a single component of your architecture acts like it should act when it was designed. It makes you be sure that, at least on the boundaries of this service, everything works as expected.

######Go ahead and try it:
    $ git clone https://github.com/lopidio/enqueuer.git
    $ cd enqueuer
    $ npm install
    $ npm start -- --config-file conf/enqueuer.yml

### what it does?
Checks whether an event-driven-component acts as expected.
By "acts as expected" we mean, the event-driven-component, when triggered by an event:
  - publishes where it is suppose to publish;
  - publishes what it is suppose to publish; and
  - publishes faster than the its timeout.

### how to use
    $ enqueuer --help
         Usage: enqueuer [options]
         Options:
           -V, --version             output the version number
           -v, --verbose             Activates verbose mode
           -l, --log-level <level>   Set log level
           -c, --config-file <path>  Set configurationFile
           -h, --help                output usage information

No big surprises, hum? No mistery, as simple as $enqueuer.

### requisition
Generally, a requisition looks like [this](/examples/publishAsStartEvent.enq.json "Requisition example") and [these](/integrationTest "Others examples").
Let me explain what each value means:

-	**requisitionVersion**: string, it tells you which version of requisition should be ran. Ex.: "01.00.00".
-	**timeout**: optional number in milliseconds, it tells you how long the requisition has to wait before being considered as an invalid one. Ex.: 2000.
-	**subscriptions**: subscription array
	-	**subscription**, object
		-	**type**: string, it tells how to identify and instantiate the proper subscription. Ex.: "mqtt".
		-	**timeout**: optional number in milliseconds, how long the subscription has to wait to be considered as an invalid one. Ex.: 1000.
		-	**onMessageReceived**: js code, script executed when a message is received.
		        Here, you have a special variable called **message** and it will have the value received in the subscription.
		        That's where you would make assertions on the received payload. 
		        Ex.: ```"test['test label'] = true;"``` or ```"test['some time has passed'] = new Date().getTime() + '' >= message"```.
-	**startEvent**: object
	-	**publisher**: object
		-	**type**: string, it tells how to identify and instantiate the proper publisher. Ex.: "mqtt".
		-	**payload**: object, what's is gonna be published. It may be whatever you want: string, number or even another [requisition](/src/inceptionTest/inceptionRequisition.enq).
		-	**prePublishing**: js code, script executed when a message is received. 
		        That's where you would make assertions on the received payload. 
		        Ex.: ```"test['test label'] = true;"```.
                Here, you have a special variable called **publisher** and it will publisher attributes.
		        You can even redefine a new value for *publisher* attributes in run tume. 
		        Like this: ```"publisher.payload=new Date().getTime();"``` or ```"publisher.type='mqtt'"```.

### why is it useful?
It is meant to help your development process.
Although there are other ways of using it, the two main ways are:
  - using it while you are developing a new feature of your component, in some kind of TDDish way; and
  - adding it to your testing pipeline, so you'll be asserting that the event-driven-component still behaves properly in every commit.

### how it works?
-	receives a [requisition](/examples/publishAsStartEvent.enq.json "Requisition example") from some IPC mechanism defined in its [configuration](/conf/enqueuer.yml);
-	confirms the requisition reception;
	-	starts the requisition (publishing or waiting on an event);
	-	waits for events published by the event-driven-component;
-	executes hook script upon these received events;
-	reports back the [result](/outputExamples/).
    
#### let me draw it for you
This is how your event-driven-conponent should act when triggered by an *Input*:\
![2018-03-11 19_20_00](https://media.giphy.com/media/YWLDPktqvpBIBgzYEX/giphy.gif "Event-driven-component expected behavior")

What **enqueuer** does is to trigger *Input*, by itself, so the component-to-be-tested acts like it should. And then, **enqueuer** collects component-to-be-tested outputs and checks if they are what they are supposed to be.
Quite simple, don't you think?

When **enqueuer** receives a requisition, it starts an event described in the requisition and awaits until all expected outputs are fulfilled or timed out. Once it happens, **enqueuer** gathers all it has and reports the result back through a mechanism described in the requisition.

### configuration file
So, by default, **enqueuer** reads [conf/enqueuer.yml](/conf/enqueuer.yml) file to configure its execution options.
Below, there is an explanation of each field of a configuration file.

      run-mode:
Specifies in which execution mode **enqueueuer** will run. There are two options, mutually exclusive:
- *daemon* (default): it will run indefinitely. Endlessly. As a service. When running in daemon mode, it will be waiting for requisitions through those mechanisms listed in *configFile.run-mode.daemon*.

- *single-run*:  this is the one that has to be used when your goal is to integrate your pipeline. It runs every file that matches the fileNamePattern value sorted in a lexicographical order.
Once all of the matching files are ran, **enqueuer** ends its execution, compiles a summary and saves it in a file defined in *configFile.run-mode.single-run.output-file* and returns, as status code:
     - 0, if all requisitions are valid; or
     - 1, if there is at least one invalid requisition.
    
```
outputs:
```

Accepts a list of publishing mechanisms. So, every time a new requisition is executed, **enqueuer** publishes through this its result with values like: schema validation, id, its errors list etc. I think some of these [examples](/outputExamples/) may give you an idea.

    log-level:

And last, but not least, log-level defines how execution information are logged in the standard output file descriptor.
Accepted values are: **trace**; **debug**; **info**; **warning**; **error**; and **fatal**.

## testing stuff
### writing tests
As mentioned previously in requisition chapter of this README file. 
While writing a meta function body field (*onMessageReceived, prePublishing) you have a special variable called **test**.
    
    "onMessageReceived": "test['failed'] = false;",
    ...
    "prePublishing": "test['failing test label'] = 1 == 2;"

Every test assertion will be taken in consideration in order to determine whether a requisition is valid.
   
### when is a requisition result invalid?
A requisition is invalid when:
- Requisition has timed out; or
- Start event has failed; or
    - has been unable to connect; or
    - at least one test has been failed.
- At least one subscription has failed:
    - has been unable to connect; or
    - has timed out; or
    - has not received any message; or
    - at least one test has been failed.

The value '**valid**' in the root of report json file will be shown as false and there will be an error description justifying it.

 
### frequently asked question
1.	**Q**: Given that **enqueuer** is a tool that tests event-driven-components and it is also an event-driven-component, does it test itself?\
	**A**: I'm glad that you asked. As a matter of fact, yes, it does test itself, absolutely, [check it out.](/src/inceptionTest/inception.test.ts "Inception Test")