#!/usr/bin/env node

const client = require("./config").client;
const argv = require("yargs").argv;
const lib = require("./lib");

if (!argv.base) throw Error("--base required!");
if (!argv.quote) {
  argv.quote = "BTC";
}
if (!argv.stopPrice) throw Error("--stopPrice required!");
if (!argv.price) throw Error("--price required!");

(async function() {
  try {
    console.log(`\n==> STOP LOSS <==\n`);

    // get all open orders with locked asset value
    let base = await lib.assetValue(client, argv.base);
    lib.printAssetValue(base)

    // cancel the open orders with locked values
    if (parseFloat(base.locked) !== 0) {
      await lib.cancelOpenOrders(client, argv.base)
      // wait a few seconds for binance to complete the order cancelation and update balances
      await lib.pause(5000)
    }

    // place stop loss order
    console.log("\n==> Place Stop Loss Order...");

    // get all open orders with locked asset value
    base = await lib.assetValue(client, argv.base);
    lib.printAssetValue(base)

    const order = {
      symbol: argv.base + argv.quote,
      side: "SELL",
      type: "STOP_LOSS_LIMIT",
      quantity: Math.floor(parseFloat(base.free) * 100) / 100,
      stopPrice: argv.stopPrice,
      price: argv.price
    };
    console.log("\nOrder:", order);
    console.log(await client.order(order));
  } catch (e) {
    console.log("==> Error");
    console.log(e);
  }
})();
