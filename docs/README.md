# enqueuer
Event-Driven-Component testing tool
  
## what it does?
Checks whether an event-driven-component acts as expected.
By "acts as expected" we mean, the event-driven-component, when triggered by an event:
  - publishes where it is suppose to publish;
  - publishes what it is suppose to publish; and
  - publishes faster than the its timeout.
  
## why is it useful?
It is meant to help your development process.
Although there are other ways of using it, the two main ways are:
  - using it while you are developing a new feature of your component, in some kind of TDDish kind of way; and
  - adding it to your testing pipeline, so you'll be asserting that the event-driven-component behaves properly.

## how it works?
  - receives a [requisition](https://github.com/lopidio/enqueuer/blob/developer/examples/subscriptionAsStartEvent.enq "example") from some IPC mechanism (i.e. standard input, file, UDS, http, amqp, files etc.) defined in its [configuration](https://github.com/lopidio/enqueuer/blob/developer/conf/enqueuer.yml);
  - starts the requisition, by:
      - publishing as it says; or
      - waiting on an event described.
  - waits for events defined;
  - executes hook script upon these received events;
  - reports back the [result](https://github.com/lopidio/enqueuer/blob/developer/output/outputReportExample) through some IPC mechanism.
