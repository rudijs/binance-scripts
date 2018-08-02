#!/usr/bin/env node

const client = require("./config").client;
const lib = require("./lib");

(async function() {
  try {
    console.log(`\n==> ACCOUNT INFO <==`);

    const accountInfo = await lib.accountInfo(client);

    console.log("\n==> Balances:");
    console.log(accountInfo.balances);

    console.log("\n==> Open Orders:");
    console.log(accountInfo.openOrders);

    console.log("\n==> Open Orders Details:");
    // console.log(accountInfo.openOrderDetails);
    accountInfo.openOrderDetails.forEach(item => {
      console.log("");
      console.log("Symbol:", item.symbol, "-", item.side);
      console.log("Stop Price:".padEnd(14), item.stopPrice);
      console.log("Price:".padEnd(14), item.price);
      console.log("Orig QTY:".padEnd(14), item.origQty);
      console.log("Executed QTY:".padEnd(14), item.executedQty);
    });
  } catch (e) {
    console.log("==> Error");
    console.log(e);
  }
})();
