#!/usr/bin/env node

const questions = require("./questions");
const client = require("./config").client;
const argv = require("yargs").argv;
const lib = require("./lib");
const exchangeInfo = require("./exchange-info");

if (!argv.base) throw Error("--base required!");
if (!argv.price && !argv.current) throw Error("--price or --current required!");
if (!argv.quote) {
  argv.quote = "BTC";
}

(async function() {
  try {
    console.log(`\n==> LIMIT SELL <==\n`);

    const prices = await client.prices();

    if (argv.current) {
      argv.price = parseFloat(prices[argv.base + argv.quote]);
    }

    const symbolExchangeInfo = lib.symbolInfo(
      exchangeInfo,
      argv.base + argv.quote
    );

    // check price does not exceed tick size (number or decimal places)
    lib.checkTickSize(argv.price, "price", symbolExchangeInfo.priceFilter);

    console.log(`BTCUSDT = ${prices["BTCUSDT"]}`);

    console.log("");
    console.log(`${argv.base} BTC = ${prices[argv.base + argv.quote]}`);

    const pairUSD = (
      prices["BTCUSDT"] * prices[argv.base + argv.quote]
    ).toFixed(6);
    console.log(`${argv.base} USD = ${pairUSD}`);

    console.log("");
    console.log("Price =", argv.price);

    // get all open orders with locked asset value
    let base = await lib.assetValue(client, argv.base);
    lib.printAssetValue(base);

    if (argv.order) {
      const confirmOrder = await questions.confirmOrder();

      if (confirmOrder === "y") {
        // cancel the open orders with locked values
        if (parseFloat(base.locked) !== 0) {
          await lib.cancelOpenOrders(client, argv.base);

          // wait a few seconds for binance to complete the order cancelation and update balances
          await lib.pause(5000);

          // get updated free asset value
          base = await lib.assetValue(client, argv.base);
          lib.printAssetValue(base);
        }

        let quantity;

        if (symbolExchangeInfo.lotSize.decimals) {
          quantity = parseFloat(base.free).toFixed(
            symbolExchangeInfo.lotSize.decimals
          );
        } else {
          // if only a whole unit (1) can be sold then round down, toFixed() above rounds up.
          quantity = Math.floor(parseFloat(base.free));
        }

        const order = {
          symbol: argv.base + argv.quote,
          side: "SELL",
          type: "LIMIT",
          quantity,
          price: argv.price
        };
        console.log("\nOrder:", order);

        console.log(await client.order(order));
      } else {
        console.log("\n==> Order not placed.");
      }
    }

    questions.rl.close();
  } catch (e) {
    console.log("==> Error");
    console.log(e);
  }
})();
