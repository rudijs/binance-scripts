#!/usr/bin/env node

const nconf = require("nconf");

nconf.env();

if (!nconf.get("APIKEY")) throw Error("APIKEY required!");
if (!nconf.get("APISECRET")) throw Error("APISECRET required!");
// refactor above
// import Binance from "binance-api-node";
const Binance = require("binance-api-node").default;

// Authenticated client, can make signed calls
const client = Binance({
  apiKey: nconf.get("APIKEY"),
  apiSecret: nconf.get("APISECRET")
});

// client.ws.ticker("EOSBTC", ticker => {
  // console.log(ticker);
  // console.log("curDayClose", ticker.curDayClose);
  // console.log("bestBid", ticker.bestBid);
  // console.log("bestAsk", ticker.bestAsk);
// });

const symbolsFilter = ['EOSBTC', 'BNBBTC', 'XLMBTC']

client.ws.allTickers(tickers => {
  // console.log(tickers)
  const tickersFiltered = tickers.filter(ticker => {
    return symbolsFilter.indexOf(ticker.symbol) > -1
  })
  // console.log(tickersFiltered)
  tickersFiltered.forEach(ticker => {
    console.log(ticker.symbol, ticker.curDayClose)
  })
  console.log("\n")
})
