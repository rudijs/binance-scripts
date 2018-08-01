#!/usr/bin/env node

const client = require("./config").client;
const lib = require("./lib");

(async function() {
  try {
    console.log(`\n==> ACCOUNT INFO <==\n`);

    const accountInfo = await lib.accountInfo(client);

    console.log("==> Balances:");
    console.log(accountInfo.balances);

    console.log("==> Open Orders:");
    console.log(accountInfo.openOrders);

    console.log("==> Open Orders Details:");
    console.log(accountInfo.openOrderDetails);
  } catch (e) {
    console.log("==> Error");
    console.log(e);
  }
})();
