#!/usr/bin/env bash

file test
mkdir temp

sqs test
wget https://s3-eu-west-1.amazonaws.com/softwaremill-public/elasticmq-server-0.13.11.jar

cat > elasticMq.conf << EOF
include classpath("application.conf")

// What is the outside visible address of this ElasticMQ node
// Used to create the queue URL (may be different from bind address!)
node-address {
    protocol = http
    host = localhost
    port = 9324
    context-path = ""
}

rest-sqs {
    enabled = true
    bind-port = 9324
    bind-hostname = "0.0.0.0"
    // Possible values: relaxed, strict
    sqs-limits = strict
}

// Should the node-address be generated from the bind port/hostname
// Set this to true e.g. when assigning port automatically by using port 0.
generate-node-address = false


queues {
    enqueuerQueue {
        defaultVisibilityTimeout = 10 seconds
        delay = 5 seconds
        receiveMessageWait = 0 seconds
    }
}
EOF

java -Dconfig.file=elasticMq.conf -jar elasticmq-server-0.13.11.jar &

./rabbitmqadmin declare exchange name=enqueuer.exchange type=topic