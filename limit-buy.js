#!/usr/bin/env node

const questions = require("./questions");
const client = require("./config").client;
const argv = require("yargs").argv;
const lib = require("./lib");
const exchangeInfo = require("./exchange-info");

if (!argv.risk) throw Error("--risk required!");
if (!argv.base) throw Error("--base required!");
if (!argv.quote) {
  argv.quote = "BTC";
}
if (!argv.price && !argv.current) throw Error("--price or --current required!");
if (!argv.stopPrice && !argv.sats)
  throw Error("--stopPrice or --sats required!");

(async function() {
  try {
    console.log(`\n==> TRADE <==\n`);

    const prices = await client.prices();

    if (argv.current) {
      argv.price = parseFloat(prices[argv.base + argv.quote]);
    }
    if (argv.sats) {
      argv.stopPrice = (argv.price - argv.sats * 0.00000001).toFixed(8);
    }

    const symbolExchangeInfo = lib.symbolInfo(
      exchangeInfo,
      argv.base + argv.quote
    );

    // check price and stopPrice does not exceed tick size (number or decimal places)
    lib.checkTickSize(argv.price, "price", symbolExchangeInfo.priceFilter);
    lib.checkTickSize(
      argv.stopPrice,
      "stopPrice",
      symbolExchangeInfo.priceFilter
    );

    console.log(`BTCUSDT = ${prices["BTCUSDT"]}`);

    console.log("");
    console.log(`${argv.base} BTC = ${prices[argv.base + argv.quote]}`);
    const pairUSD = (
      prices["BTCUSDT"] * prices[argv.base + argv.quote]
    ).toFixed(5);
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
    console.log("Risk USD =", argv.risk);
    console.log(
      `${argv.base} units to buy =`,
      unitsBuy.toFixed(symbolExchangeInfo.lotSize.decimals)
    );

    const unitsBuyPriceBTC = unitsBuy * prices[argv.base + argv.quote];
    const unitsBuyPriceUSD = unitsBuy * pairUSD;
    console.log("");
    console.log(
      `${argv.base} units to buy cost BTC =`,
      unitsBuyPriceBTC.toFixed(8)
    );
    console.log(
      `${argv.base} units to buy cost USD =`,
      unitsBuyPriceUSD.toFixed(3)
    );
    console.log("");

    if (argv.order) {
      const order = {
        symbol: argv.base + argv.quote,
        side: "BUY",
        type: "LIMIT",
        quantity: unitsBuy.toFixed(symbolExchangeInfo.lotSize.decimals),
        price: argv.price
      };
      console.log("Order", order);

      const confirmOrder = await questions.confirmOrder();

      if (confirmOrder === "y") {
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
