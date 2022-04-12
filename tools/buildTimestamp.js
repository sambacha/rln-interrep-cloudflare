#!/usr/bin/env node
'use strict';
const now = new Date();
if (process.env.SOURCE_DATE_EPOCH) {
  now = new Date(
    process.env.SOURCE_DATE_EPOCH * 1000 + now.getTimezoneOffset() * 60000
  );
}
console.log(now);