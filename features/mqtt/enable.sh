#!/usr/bin/env bash

cp features/mqtt/mqtt.json integrationTest/
cp features/mqtt/mqtt-publisher.ts src/publishers/
cp features/mqtt/mqtt-subscription.ts src/subscriptions/
npm install "@types/mqtt"