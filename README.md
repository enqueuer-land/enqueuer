## enqueuer

Checks whether an event-driven-component acts as expected when it receives an event.
By "acts as expected" we mean, the component:
  - publishes where it is suppose to publish;
  - publishes what it is suppose to publish; and
  - publishes faster than the timeout limit.
  
## how it works?
  - receives a requisition from some mechanism (i.e.. mqtt, standard input, file, rest http);
  - publishes as the requisition says (executing hooks scripts);
  - waits for events subscribed in requisition (queues messages, in general);
  - executes validations upon these received events;
  - reply a report back through some mechanism (i.e. saves file, standard output, mqtt) mechanism.
  
By doing this, we intend to make sure that the event-driven-component behaves properly when triggered by some sort of event.
