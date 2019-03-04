----

## variables
To give you even more power and flexibility, enqueuer allows you to use values that will be defined later.
That's why there is a 'store' field and you'll see a lot of '<<' and '{{' being used in the examples files.
It works as simple as this:

    variableName: <<valueToBeDefinedLater>>

Every time enqueuer sees these kind of notations, it searches in its store for a thing like:
    
    valueToBeDefinedLater: `value`

Then, when enqueuer parses the original map, it gets translated to this:
    
    variableName: `value`

#### set a variable
There are a few ways to set a value in store.

###### 1. configuration file
configuration file's store [field](./config-file.md#store)
###### 2. command line
a command line argument `nqr --store key=value`
###### 3. event's store
dynamically set it through an event's store [field](./events.md#store)

#### content file insertion
Another really nice feature is to be able to insert file content in a requisition/publisher/subscription field.

    fileContent: <<json://path/to/file.json>>

Doing this way, enqueuer will read the file and parse its content as a JSON object.
Other parseable values are these ones:

    csv: <<csv://misc/file-content.csv>>
    tsv: <<tsv://misc/file-content.tsv>>
    json: <<json://misc/file-content.json>>
    yml: <<yaml://misc/file-content.yml>>
    regularFile: <<file://misc/file-content.yml>>

You can even read java script code and insert it into a 'script' field in an event field. You have no limits.
Check [this test example](../../examples/file-placeholder.yml) test to get a full picture of it.
