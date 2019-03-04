----
## requisition
This file describe the test scenario. It tells what and how test stuff.
It's a collection of [publishers](./publisher.md), a [subscriptions](./subscription.md) and other [requisitions](requisition.md).
[Variable replacements](./variables.md) are available through the entire requisition.

###### name
Optional, describes what the requisition is suppose to do

    name: requisition action

###### timeout
Sets in milliseconds how log the requisition waits to expire. Defaults to 5000.
Set to zero or less than zero to run it endlessly

    timeout: 3000
    
###### delay
Optional. Defaults to 0. Sets in milliseconds how log the test has to wait before starting.

    delay: 0

###### iterations
Optional. Defaults to 1. Sets how many times this test will be executed

    iterations: 3

###### publishers
Optional. List of [publishers](./publisher.md)

###### subscriptions
Optional. List of [subscriptions](./subscription.md)

###### requisitions
Optional. Things get really interesting. List of [requisitions](requisition.md). Yes, it can get really recursive.

###### events
Available events are described [here](./events.md). A 'requisition' object is available to access and change its attributes.  

