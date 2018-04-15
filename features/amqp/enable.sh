#!/usr/bin/env bash

cp features/amqp/amqp.json integrationTest/
cp features/amqp/amqp-publisher.ts src/publishers/
cp features/amqp/amqp-subscription.ts src/subscriptions/
npm install "amqp"