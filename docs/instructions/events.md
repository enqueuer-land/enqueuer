----
## Event

Events are actions triggered by something.
There are three events available:

    onInit: # Available in requisitions, publishers and subscriptions. It gets executed as soon as the field is initialized
    
    onFinish: # Available in requisitions, publishers and subscriptions. It gets executed when the field is about to finish
    
    onMessageReceived: # Available in every subscriptions and in synchronous publishers (http, kafka, tcp, uds etc.). 
                       # It gets executed when the field receives a message.
                       # An additional 'message' object is available having all of its attributes.

#### fields
Every event object has 3 children:

###### script 
Javascript code snippet executed when the event is triggered.
###### store
Data to be persisted
###### assertions
Array of assertions. Run '$ nqr -t' to see available ones

##### examples
    onInit:
      script: |-
        stringLiteral = 'string value'
    
      assertions:
        - expect: stringLiteral
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
