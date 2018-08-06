#!/usr/bin/env node

const client = require("./config").client;
const argv = require("yargs").argv;
const lib = require("./lib");
const exchangeInfo = require("./exchange-info");

if (!argv.base) throw Error("--base required!");
if (!argv.quote) {
  argv.quote = "BTC";
}
if (!argv.stopPrice) throw Error("--stopPrice required!");
if (!argv.price) throw Error("--price required!");

(async function() {
  try {
    console.log(`\n==> STOP LOSS <==\n`);

    const symbolExchangeInfo = lib.symbolInfo(exchangeInfo, argv.base + argv.quote);

    // check price and stopPrice does not exceed tick size (number or decimal places)
    lib.checkTickSize(argv.price, 'price', symbolExchangeInfo.priceFilter) 
    lib.checkTickSize(argv.stopPrice, 'stopPrice', symbolExchangeInfo.priceFilter) 

    // get all open orders with locked asset value
    let base = await lib.assetValue(client, argv.base);
    lib.printAssetValue(base)

    // cancel the open orders with locked values
    if (parseFloat(base.locked) !== 0) {
      await lib.cancelOpenOrders(client, argv.base)
      
      // wait a few seconds for binance to complete the order cancelation and update balances
      await lib.pause(5000)

      // get all open orders with locked asset value
      base = await lib.assetValue(client, argv.base);
      lib.printAssetValue(base)
    }

    // place stop loss order
    console.log("\n==> Place Stop Loss Order...");

    let quantity;

    if (symbolExchangeInfo.lotSize.decimals) {
      quantity = parseFloat(base.free).toFixed(symbolExchangeInfo.lotSize.decimals)
    }
    else {
      // if only a whole unit (1) can be sold then round down, toFixed() above rounds up.
      quantity = Math.floor(parseFloat(base.free))
    }

    const order = {
      symbol: argv.base + argv.quote,
      side: "SELL",
      type: "STOP_LOSS_LIMIT",
      quantity,
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
