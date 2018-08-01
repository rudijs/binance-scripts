#!/usr/bin/env node

const argv = require("yargs").argv;
const nconf = require("nconf");
const Binance = require("binance-api-node").default;

nconf.env();

if (!nconf.get("APIKEY")) throw Error("APIKEY required!");
if (!nconf.get("APISECRET")) throw Error("APISECRET required!");

if (!argv.base) throw Error("--base required!");
if (!argv.quote) {
  argv.quote = "BTC";
}
if (!argv.stopPrice) throw Error("--stopPrice required!");
if (!argv.price) throw Error("--price required!");

// Authenticated client, can make signed calls
const client = Binance({
  apiKey: nconf.get("APIKEY"),
  apiSecret: nconf.get("APISECRET")
});

async function assetValue(base) {
  const accountInfo = await client.accountInfo();
  const baseBalance = accountInfo.balances.filter(base => {
    return base.asset === argv.base;
  })[0];
  return ({ asset, free, locked } = baseBalance);
}

function pause(ms) {
  console.log("Pausing for", ms, "ms");
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

(async function() {
  try {
    console.log(`\n==> STOP LOSS <==\n`);

    // get all open orders with locked asset value
    let base = await assetValue(argv.base);
    console.log("Base", base.asset);
    console.log("Free", base.free);
    console.log("Locked", base.locked);

    // cancel the open orders with locked values
    if (parseFloat(base.locked) !== 0) {
      console.log("Canceling Open Orders...");
      const openOrders = await client.openOrders({
        symbol: argv.base + argv.quote
      });
      for (const openOrder of openOrders) {
        console.log("Cancel Order ID:", openOrder.orderId);
        console.log(
          await client.cancelOrder({
            symbol: argv.base + argv.quote,
            orderId: openOrder.orderId
          })
        );
      }
      await pause(5000);
    }

    // place stop loss order
    console.log("Place Stop Loss Order...");

    // get all open orders with locked asset value
    base = await assetValue(argv.base);
    console.log("Base", base.asset);
    console.log("Free", base.free);
    console.log("Locked", base.locked);

    const order = {
      symbol: argv.base + argv.quote,
      side: "SELL",
      type: "STOP_LOSS_LIMIT",
      quantity: Math.floor(parseFloat(base.free) * 100) / 100,
      stopPrice: argv.stopPrice,
      price: argv.price
    };
    console.log("Order:", order);
    console.log(await client.order(order));
  } catch (e) {
    console.log("==> Error");
    console.log(e);
  }
})();
