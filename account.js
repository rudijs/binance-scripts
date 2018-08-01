#!/usr/bin/env node

const client = require("./config").client;

const argv = require("yargs").argv;

async function assetValue(base) {
  const accountInfo = await client.accountInfo();
  const baseBalance = accountInfo.balances.filter(base => {
    return base.asset === argv.base;
  })[0];
  return ({ asset, free, locked } = baseBalance);
}

(async function() {
  try {
    console.log(`\n==> ACCOUNT INFO <==\n`);

    const accountInfo = await client.accountInfo();
    // console.log(accountInfo);

    const balances = accountInfo.balances.filter(balance => {
      return parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0;
    });
    console.log("Balances:");
    console.log(balances);

    const openOrders = balances.filter(balance => {
      return parseFloat(balance.locked) > 0;
    });
    console.log("Open Orders");
    // console.log(openOrders);

    for (const openOrder of openOrders) {
      console.log( await client.openOrders({
          symbol: openOrder.asset + "BTC"
        })
      );
    }
  } catch (e) {
    console.log("==> Error");
    console.log(e);
  }
})();
