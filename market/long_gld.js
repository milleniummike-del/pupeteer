const headers = require('./headers.js');

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
const symbol = args.symbol || 'GLD';
const position = (args.position || 'LONG').toUpperCase();
const amount = Number(args.amount ?? 1000);
const leverage = Number(args.leverage ?? 5);

const stopPercent = Number(args.stop ?? 0.008);
const profitPercent = Number(args.profit ?? 0.005);

const stopMultiplier = 1 - stopPercent;
const profitMultiplier = 1 + profitPercent;

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
    console.log('--- CONFIG ---');
    console.log({ symbol, position, amount, leverage });

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

    // -------------------------
    // 3. SL / TP calculation
    // -------------------------
    let stopLoss, takeProfit;

    if (position === 'LONG') {
      stopLoss = price * stopMultiplier;
      takeProfit = price * profitMultiplier;
    } else {
      stopLoss = price * profitMultiplier;
      takeProfit = price * stopMultiplier;
    }

    console.log('Stop Loss:', stopLoss);
    console.log('Take Profit:', takeProfit);

    // -------------------------
    // 4. Order payload
    // -------------------------
    const orderBody = {
      InstrumentId: instrumentId,
      Amount: amount,
      StopLossRate: stopLoss,
      TakeProfitRate: takeProfit,
      Leverage: leverage,
      IsBuy: position === 'LONG'
    };

    console.log('Order Payload:');
    console.log(JSON.stringify(orderBody, null, 2));

    // -------------------------
    // 5. Place order
    // -------------------------
    const orderUrl =
      'https://public-api.etoro.com/api/v1/trading/execution/demo/market-open-orders/by-amount';

    const orderRes = await fetch(orderUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderBody)
    });

    const result = await safeJson(orderRes);

    console.log('--- RESPONSE ---');
    console.log('Status:', orderRes.status);

    if (!orderRes.ok) {
      console.log('Error Response:', result);
      return;
    }

    console.log('Success Response:', result);

  } catch (err) {
    console.error('ERROR:', err.message);
  }
};

placeOrder();