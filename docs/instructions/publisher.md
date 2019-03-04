----

## Publisher

A publisher action is triggered by enqueuer itself. It **acts** whereas a subscription **reacts**.
Every publisher has its own properties, depending on its protocol and implementation. But they all have these properties.

###### name
Optional, describes what the publisher is suppose to do

    name: publisher action

###### type
Mandatory. Run `nqr -p` to check available ones.
    
    type: http
    
###### payload
Since a publisher usually publishes something, it's very likely you have to set a value here.
The message itself that will be send through this IPC protocol. Be it a string, a number, a boolean value or even whole objects.

    payload: value
    
###### events
Available events are described [here](./events.md). A 'publisher' object is available to access and change its attributes.  

