#!/usr/bin/env node

const argv = require("yargs").argv;
const nconf = require("nconf");
const Binance = require("binance-api-node").default;

nconf.env();

if (!nconf.get("APIKEY")) throw Error("APIKEY required!");
if (!nconf.get("APISECRET")) throw Error("APISECRET required!");

// Authenticated client, can make signed calls
exports.client = Binance({
  apiKey: nconf.get("APIKEY"),
  apiSecret: nconf.get("APISECRET")
});
