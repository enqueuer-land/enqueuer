FROM rabbitmq:3.6-alpine

RUN apk add --update nodejs-current nodejs-npm openjdk8 make gcc g++ python

# ENV NPM_CONFIG_PREFIX=/home/enqueuer/.npm-global

# RUN adduser --system enqueuer
# USER enqueuer

# RUN mkdir -p /home/enqueuer/.npm-global


# WORKDIR /home/enqueuer

RUN wget -O /kafka_2.11-1.0.0.tgz https://archive.apache.org/dist/kafka/1.0.0/kafka_2.11-1.0.0.tgz
RUN tar -xvzf /kafka_2.11-1.0.0.tgz

RUN wget -O /elasticmq-server-0.13.11.jar https://s3-eu-west-1.amazonaws.com/softwaremill-public/elasticmq-server-0.13.11.jar

RUN rabbitmq-plugins enable --offline rabbitmq_mqtt rabbitmq_stomp

ADD /misc /config

COPY /misc/rabbitmq.config /etc/rabbitmq/rabbitmq.config

RUN npm install zeromq@5.0.0 --no-optional

RUN npm install -g jest

RUN npm install -g n

#kafka
EXPOSE 9093
#kafka
EXPOSE 9092
#amqp
EXPOSE 5672
#mqtt
EXPOSE 1883
#stomp
EXPOSE 61613
#sqs
EXPOSE 9324
#zeromq
EXPOSE 23000
EXPOSE 3000

ENTRYPOINT [ "./config/docker-init.sh" ]
