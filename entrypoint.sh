#!/bin/bash

yarn install
docker-compose up -d
npm i -g concurrently
concurrently "yarn interrepMock" "yarn server" "yarn appExample"
sleep 1
