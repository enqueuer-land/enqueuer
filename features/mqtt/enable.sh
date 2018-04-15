#!/usr/bin/env bash

cp features/mqtt/mqtt.json integrationTest/
cp features/mqtt/mqtt-publisher src/publishers/mqtt-publisher.ts
cp features/mqtt/mqtt-subscription src/subscriptions/mqtt-subscription.ts
npm install "mqtt"