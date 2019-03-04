----

## Subscription
A subscription is an "under demand" event. It **reacts** whereas a publisher **acts**.
It means that it is not triggered by enqueuer itself. 
Rather than that, enqueuer waits on an external event to be triggered and then it asserts against the message that flew through it
Every subscription has its own properties, depending on its protocol and implementation. But they all have these properties. 

###### name
Optional, describes what the subscription is suppose to do

    name: subscription action

###### type
Mandatory. Run `nqr -p` to check available ones.
    
    type: tcp

###### avoid
Identifies that this subscription should not receive any message. Defaults to false.
If set and a message is received a failing test will be generated
On the other hand, when it's false and no message is received in a given timeout. This subscription is a valid one
    
    avoid: false

###### timeout
Sets in milliseconds how log the subscription waits to expire. Defaults to 3000.
Set to zero or less than zero to run it endlessly

    timeout: 3000

###### events
Available events are described [here](./events.md). A 'subscription' object is available to access and change its attributes.  
