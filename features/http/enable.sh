#!/usr/bin/env bash

cp features/http/http.json integrationTest/
cp features/http/http-client-publisher src/publishers/http-client-publisher.ts
cp features/http/http-server-subscription src/subscriptions/http-server-subscription.ts
npm install "express"