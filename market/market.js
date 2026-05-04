const options = {
  method: 'GET',
  headers: {
    'x-request-id': '2e85fa7c-49f3-4bd3-8e6b-a4425ec72cfd',
    'x-api-key': 'sdgdskldFPLGfjHn1421dgnlxdGTbngdflg6290bRjslfihsjhSDsdgGHH25hjf',
    'x-user-key': 'eyJjaSI6IjYwY2FiYjBiLTU1OTctNDQ4NS04ZjYzLTdlOWUwNTZlMGJiOCIsImVhbiI6IlVucmVnaXN0ZXJlZEFwcGxpY2F0aW9uIiwiZWsiOiJ1Y2JLdy05QjJtUmNFZ0tTNWRGN1FiTFhVUTh2MzdWbnZkcTBuM0I2dWVNaXhJaktKZFdmVi4zTXZYYkN5ZDU4WFpiSi5uejFYR0NJMUk2UFc1VkJXLXFieGNiQ09FRDdUS2Z1R3ljSkhHb18ifQ__'
  }
};

const symbol = 'AAPL';
const url = `https://public-api.etoro.com/api/v1/market-data/search?internalSymbolFull=${symbol}`;

fetch(url, options)
    .then(res => res.json())
    // Find the exact match in the returned items list
    .then(res => {
        const instrument = res.items.find(i => i.internalSymbolFull === symbol);
        console.log("Instrument ID:", instrument.instrumentId);
    })
    .catch(err => console.error(err));