#!/usr/bin/env bash

cp features/amqp/amqp.json integrationTest/
cp features/amqp/amqp-publisher src/publishers/amqp-publisher.ts
cp features/amqp/amqp-subscription src/subscriptions/amqp-subscription.ts
npm install "amqp"