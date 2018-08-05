module.exports = {
  accountInfo,
  cancelOpenOrders,
  assetValue,
  printAssetValue,
  pause,
  symbolInfo,
  checkTickSize
};

async function accountInfo(client) {
  const info = await client.accountInfo();
  // console.log(info);

  const balances = info.balances.filter(balance => {
    return parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0;
  });
  // console.log(balances);

  const openOrders = balances.filter(balance => {
    return parseFloat(balance.locked) > 0;
  });
  // console.log(openOrders);

  const openOrderDetails = [];

  for (const openOrder of openOrders) {
    const symbolOpenOrderDetails = await client.openOrders({
      symbol: openOrder.asset + "BTC"
    });

    symbolOpenOrderDetails.forEach(item => {
      openOrderDetails.push(item);
    });
  }

  return { info, balances, openOrders, openOrderDetails };
}

async function cancelOpenOrders(client, base, quote = "BTC") {
  console.log("\n==> Canceling Open Orders...");
  const openOrders = await client.openOrders({
    symbol: base + quote
  });
  for (const openOrder of openOrders) {
    console.log("\n==> Cancel Order ID:", openOrder.orderId);
    console.log(
      await client.cancelOrder({
        symbol: base + quote,
        orderId: openOrder.orderId
      })
    );
  }
}

async function assetValue(client, base) {
  const accountInfo = await client.accountInfo();
  const baseBalance = accountInfo.balances.filter(asset => {
    return asset.asset === base;
  })[0];
  return ({ asset, free, locked } = baseBalance);
}

function printAssetValue(base) {
  console.log("\nBase", base.asset);
  console.log("Free", base.free);
  console.log("Locked", base.locked);
}

async function pause(ms) {
  console.log("\n==> Pausing for", ms, "ms");
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function symbolInfo(src, symbol) {
  const data = src.symbols.filter(item => {
    return item.symbol === symbol;
  })[0];

  const lotSize = data.filters.filter(item => {
    return item.filterType === "LOT_SIZE";
  })[0];

  lotSize.decimals = countDecimals(parseFloat(lotSize.stepSize));

  const priceFilter = data.filters.filter(item => {
    return item.filterType === "PRICE_FILTER";
  })[0];

  priceFilter.decimals = countDecimals(parseFloat(priceFilter.tickSize));

  return { data, lotSize, priceFilter };
}

function countDecimals(value) {
  let sats = value
  // check if large number (exponential) and convert to sats. Ex 1e-7 to 0.00000001
  if (sats.toString().match('e-') != null ) {
    sats = value.toFixed(8)
  }
  if (Math.floor(sats) === sats) return 0;
  return sats.toString().split(".")[1].length || 0;
}

function checkTickSize(price, type, priceFilter) {
  // check price does not exceed tick size (number or decimal places)
  if (countDecimals(price) > priceFilter.decimals) {
    const msg = `${type} tick size exceeded. Tick Size: ${
      priceFilter.tickSize
    } (${priceFilter.decimals} decimal places)`;
    throw new Error(msg);
  }
}
