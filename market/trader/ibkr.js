const fetch = require("node-fetch");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const SYMBOL = process.argv[2] || "AAPL";
const INVEST_AMOUNT = 5000;
const BASE_URL = "https://localhost:5000/v1/api";

// -----------------------------
// HTTP Helpers
// -----------------------------
async function httpGet(url) {
    const res = await fetch(url);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) throw new Error(text);
    return data;
}

async function httpPost(url, body = null) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    console.log("\n🔍 RAW RESPONSE FROM IBKR:");
    console.log(text);

    if (!res.ok) throw new Error(text);
    return data;
}

// -----------------------------
// IBKR API Calls
// -----------------------------
async function getConidFromSymbol(symbol) {
    const url = `${BASE_URL}/trsrv/stocks?symbols=${encodeURIComponent(symbol)}`;
    const data = await httpGet(url);

    const key = Object.keys(data).find(k => k.toUpperCase() === symbol.toUpperCase());
    if (!key || !Array.isArray(data[key]) || data[key].length === 0) {
        throw new Error(`No contracts found for symbol: ${symbol}`);
    }

    const item = data[key][0];
    const conid = item.conid || item.contracts?.[0]?.conid;
    if (!conid) throw new Error(`Could not extract conid for ${symbol}`);
    return conid;
}

async function getPriceFromConid(conid) {
    const url = `${BASE_URL}/iserver/marketdata/snapshot?conids=${conid}&fields=31`;
    const data = await httpGet(url);

    if (Array.isArray(data) && data[0] && data[0]["31"] !== undefined) {
        return data[0]["31"];
    }

    throw new Error(`No price data for conid ${conid}`);
}

async function getAccountId() {
    const url = `${BASE_URL}/iserver/accounts`;
    const data = await httpGet(url);

    if (data?.accounts?.length > 0) {
        return data.accounts[0];
    }

    throw new Error("No account ID found");
}

// -----------------------------
// Order Placement (WORKING VERSION)
// -----------------------------
async function placeMarketOrder(accountId, conid, quantity) {
    const orderUrl = `${BASE_URL}/iserver/account/${accountId}/orders`;

    const order = [{
        acctId: accountId,
        account: accountId,

        conid: conid,
        secType: "STK",
        orderType: "MKT",
        side: "BUY",
        tif: "DAY",
        quantity: quantity,

        // Required for EU/UK/IBIE/IBCE
        currency: "USD",
        exchange: "SMART",
        listingExchange: "SMART",

        // Required flags
        outsideRTH: false,
        useAdaptive: false,
        isSingleGroup: false,
        dontUseAutoPrice: false,
        allocated: false,
        transmit: true,

        // Schema fields
        orderTypeDescription: "",
        price: 0,
        auxPrice: 0,

        // Optional
        cOID: `${accountId}-${SYMBOL}-BUY-MKT`,
        referrer: "API"
    }];

    console.log("\n--- Sending order preview ---");
    const preview = await httpPost(orderUrl, order);
    console.log("\nParsed preview:", preview);

    let orderId = Array.isArray(preview) ? preview[0]?.id : undefined;
    const replyId = Array.isArray(preview) ? preview[0]?.replyid : undefined;

    if (replyId) {
        console.log(`\n--- Reply required: ${replyId} ---`);
        const replyUrl = `${BASE_URL}/iserver/reply/${replyId}`;
        const reply = await httpPost(replyUrl);
        console.log("\nParsed reply:", reply);
        orderId = Array.isArray(reply) ? reply[0]?.id : orderId;
    }

    if (!orderId) {
        console.log("\nNo orderId returned; IBKR may have already transmitted the order.");
        return;
    }

    console.log(`\n--- Confirming order ID ${orderId} ---`);
    const confirmUrl = `${orderUrl}/${orderId}`;
    const confirm = await httpPost(confirmUrl);
    console.log("\nParsed confirmation:", confirm);
}

// -----------------------------
// Main
// -----------------------------
(async () => {
    try {
        console.log(`Fetching conid for ${SYMBOL}...`);
        const conid = await getConidFromSymbol(SYMBOL);
        console.log(`Symbol ${SYMBOL} → conid ${conid}`);

        console.log(`Fetching latest price...`);
        const price = await getPriceFromConid(conid);
        console.log(`Latest price: $${price}`);

        const shares = Math.floor(INVEST_AMOUNT / price);
        if (shares <= 0) throw new Error("Investment amount too small for 1 share");

        console.log(`Buying $${INVEST_AMOUNT} of ${SYMBOL} → ${shares} shares`);

        console.log(`Fetching account ID...`);
        const accountId = await getAccountId();
        console.log(`Account ID: ${accountId}`);

        console.log(`Placing market BUY order...`);
        await placeMarketOrder(accountId, conid, shares);

        console.log("\n✔ Done");

    } catch (err) {
        console.error("\n❌ Error:", err.message);
    }
})();
