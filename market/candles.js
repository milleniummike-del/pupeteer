const headers = require('./headers.js');
const fs = require('fs');
// -------------------------
// Named arguments parser
// -------------------------
const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, value] = arg.split('=');
    return [key, value];
  })
);

// -------------------------
// Config
// -------------------------
const symbol = args.symbol || 'BTC';

const interval = args.interval || `FifteenMinutes`;
const direction = `asc`;

// -------------------------
// Safe JSON helper
// -------------------------
async function safeJson(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// -------------------------
// Main
// -------------------------
const placeOrder = async () => {
  try {
    // -------------------------
    // 1. Get instrument
    // -------------------------
    const searchUrl =
      `https://public-api.etoro.com/api/v1/market-data/search?internalSymbolFull=${symbol}`;

    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await safeJson(searchRes);

    const instrument = searchData.items?.find(
      i => i.internalSymbolFull === symbol
    );

    if (!instrument) {
      throw new Error(`Instrument not found: ${symbol}`);
    }

    const instrumentId = instrument.instrumentId;
    console.log('Instrument ID:', instrumentId);

    // -------------------------
    // 2. Get price
    // -------------------------
    const priceUrl =
      `https://public-api.etoro.com/api/v1/market-data/instruments/rates?instrumentIds=${instrumentId}`;

    const priceRes = await fetch(priceUrl, {
      method: 'GET',
      headers
    });

    const priceData = await safeJson(priceRes);
    const price = priceData.rates?.[0]?.bid;

    if (!price) {
      throw new Error('Price not available');
    }

    console.log('Price:', price);
    const candleUrl =
      `https://public-api.etoro.com/api/v1/market-data/instruments/${instrumentId}/history/candles/${direction}/${interval}/100`;

    const candleRes = await fetch(candleUrl, {
      method: 'GET',
      headers
    });

    const candleData = await safeJson(candleRes);

   // console.log(candleData.candles);

    const filePath = "tradehelper/mock.json";

  fs.writeFile(filePath, JSON.stringify(candleData, null, 2), (err) => {
    if (err) {
      console.error("Error writing JSON:", err);
    } else {
      console.log("JSON saved to mock.json");
    }
  });

  } catch (err) {
    console.error('ERROR:', err.message);
  }
};

placeOrder();
