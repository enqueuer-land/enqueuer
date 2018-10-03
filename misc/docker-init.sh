#!/bin/bash
rabbitmq-server start &
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start rabbitmq-server: $status"
  exit $status
fi

# Start the first process
java -Dconfig.file=/config/elasticMq.conf -jar /elasticmq-server-0.13.11.jar &
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start elasticMq: $status"
  exit $status
fi

# Start the second process
/kafka_2.11-1.0.0/bin/zookeeper-server-start.sh /kafka_2.11-1.0.0/config/zookeeper.properties &
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start zookeeper-server: $status"
  exit $status
fi


/kafka_2.11-1.0.0/bin/kafka-server-start.sh /config/server.properties &
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start kafka-server: $status"
  exit $status
fi

retry=0
while true; do
  /kafka_2.11-1.0.0/bin/kafka-topics.sh --create --topic enqueuer-topic-name --zookeeper localhost:2181 --partitions 3 --replication-factor 1
  if [ $? -eq 0 ] || [ $retry -gt 10 ]; then
    break;
  fi
  echo "================= INFO Retry number $retry"
  ((retry++))
  sleep 1s
done

/kafka_2.11-1.0.0/bin/kafka-topics.sh --list --zookeeper localhost:2181 | grep "enqueuer-topic-name"
if [ $? -ne 0 ]; then
  echo "Failed to create kafka-topics: $?"
  exit $status
fi

exec "$@"