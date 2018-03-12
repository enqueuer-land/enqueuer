# enqueuer
Event-Driven-Component testing tool.\
When developing an event-driven-architecture, it gets hard to keep track of how every component should exchange messages with each other.\
Sometimes it occurs through message brokers, sometime it is a synchronous http post and sometimes it writes a file.\
What **enqueuer** proposes to do is to give you confidence that every component of your architecture acts like it should act when it was designed.
  
## what it does?
Checks whether an event-driven-component acts as expected.
By "acts as expected" we mean, the event-driven-component, when triggered by an event:
  - publishes where it is suppose to publish;
  - publishes what it is suppose to publish; and
  - publishes faster than the its timeout.
  
## why is it useful?
It is meant to help your development process.
Although there are other ways of using it, the two main ways are:
  - using it while you are developing a new feature of your component, in some kind of TDDish way; and
  - adding it to your testing pipeline, so you'll be asserting that the event-driven-component still behaves properly in every commit.

## how it works?
1. receives a [requisition](/examples/subscriptionAsStartEvent.enq.json "Requisition example") from some IPC mechanism defined in its [configuration](/conf/enqueuer.yml);
2. confirms the requisition reception;
	3. starts the requisition (publishing or waiting on an event);
	4. waits for events published by the event-driven-component;
    5. executes hook script upon these received events;
    6. reports back the [result](/output/outputReportExample.json).
    
### let me draw it for you
This is how your event-driven-conponent should act when triggered by an *Input*:\
![2018-03-11 19_20_00](https://media.giphy.com/media/YWLDPktqvpBIBgzYEX/giphy.gif "Event-driven-component expected behavior")\

What **enqueuer** does is to trigger *Input*, by itself, so the component-to-be-tested acts like it should. And then, **enqueuer** collects component-to-be-tested outputs and checks if they are what they are supposed to be.
Quite simple, don't you think?

When **enqueuer** receives a requisition, it starts an event described in the requisition and awaits untill all expecteds outputs are fulfilled or timed out. Once it happens, **enqueuer** gathers all it has and reports the result back through a mechanism described in the requisition.

###### Examples of IPC mechanisms currently supported are:
        standard input; standard output; files; UDS; http; amqp and mqtt.
