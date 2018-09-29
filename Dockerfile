FROM rabbitmq:3.6-alpine

RUN apk add --update nodejs-current nodejs-npm openjdk8 make gcc g++ python
RUN npm install -g n


RUN wget -O /usr/local/kafka_2.11-1.0.0.tgz https://archive.apache.org/dist/kafka/1.0.0/kafka_2.11-1.0.0.tgz
RUN tar -xvzf /usr/local/kafka_2.11-1.0.0.tgz

RUN wget -O /usr/local/elasticmq-server-0.13.11.jar https://s3-eu-west-1.amazonaws.com/softwaremill-public/elasticmq-server-0.13.11.jar

RUN rabbitmq-plugins enable --offline rabbitmq_mqtt rabbitmq_stomp

ADD ./misc /config

COPY ./misc/rabbitmq.config /etc/rabbitmq/rabbitmq.config

ENTRYPOINT [ "/config/docker-init.sh" ]
