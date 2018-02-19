# enqueuer

Checks whether an event-driven queue-based-component acts as expected when it receives an event.
By "acts as expected" we mean, the component:
  - publishes where it is suppose to publish;
  - publishes what it is suppose to publish; and
  - publishes faster than the timeout limit.
  
  Receives a requisition from some IPC mechanism (eg. mqtt), processes it and reply a report through the same mechanism.
    
