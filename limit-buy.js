#!/usr/bin/env node

const argv = require("yargs").argv;
const nconf = require("nconf");
const Binance = require("binance-api-node").default;

nconf.env();

if (!nconf.get("APIKEY")) throw Error("APIKEY required!");
if (!nconf.get("APISECRET")) throw Error("APISECRET required!");

if (!argv.risk) throw Error("--risk required!");
if (!argv.base) throw Error("--base required!");
if (!argv.quote) { argv.quote = "BTC";}
if (!argv.price) throw Error("--price required!");
if (!argv.stopPrice) throw Error("--stopPrice required!");

// Authenticated client, can make signed calls
const client = Binance({
  apiKey: nconf.get("APIKEY"),
  apiSecret: nconf.get("APISECRET")
});

(async function() {
  try {
    const prices = await client.prices();

    console.log(`\n==> TRADE <==\n`);

    console.log(`BTCUSDT = ${prices["BTCUSDT"]}`);

    console.log("");
    console.log(`${argv.base} BTC = ${prices[argv.base + argv.quote]}`);
    const pairUSD = (prices["BTCUSDT"] * prices[argv.base + argv.quote]).toFixed(5);
    console.log(`${argv.base} USD = ${pairUSD}`);

    console.log("");
    console.log("Price".padEnd(10), "=", argv.price);
    console.log("Stop Price".padEnd(10), "=", argv.stopPrice);

    const riskBTC = argv.price - argv.stopPrice;
    const riskUSD = prices["BTCUSDT"] * riskBTC;
    console.log("");
    console.log("Risk per unit BTC".padEnd(10), "=", riskBTC.toFixed(8));
    console.log("Risk per unit USD".padEnd(10), "=", riskUSD.toFixed(4));

    const unitsBuy = argv.risk / riskUSD;
    console.log("");
    console.log(`${argv.base} units to buy =`, unitsBuy.toFixed(2));

    const unitsBuyPriceBTC = unitsBuy * prices[argv.base + argv.quote];
    const unitsBuyPriceUSD = unitsBuy * pairUSD;
    console.log("");
    console.log(`${argv.base} units to buy cost BTC =`, unitsBuyPriceBTC.toFixed(8));
    console.log(`${argv.base} units to buy cost USD =`, unitsBuyPriceUSD.toFixed(3));
    console.log("");

    if (argv.order) { 
      const order = {
        symbol: argv.base + argv.quote,
        side: "BUY",
        type: "LIMIT",
        quantity: unitsBuy.toFixed(2),
        price: argv.price
      };
      console.log("Order", order)
      // console.log(await client.order(order));
    }

  } catch (e) {
    console.log("==> Error");
    console.log(e);
  }
})();