## enqueuer

Checks whether an event-driven-component acts as expected when it receives an event.
By "acts as expected" we mean, the component:
  - publishes where it is suppose to publish;
  - publishes what it is suppose to publish; and
  - publishes faster than the timeout limit.
  
## how it works?
  - receives a requisition from some IPC mechanism (i.e. standard input, file, UDS etc.);
      - publishes as the requisition says (executing hooks scripts); or
      - waits on an event described by the requisition (validating the event);
  - waits for events subscribed in requisition;
  - executes validations upon these received events;
  - reports back through some mechanism (i.e. saves file, standard output, mqtt, http post).
  
By doing this, we intend to make sure that the event-driven-component behaves properly when triggered by some sort of event.
