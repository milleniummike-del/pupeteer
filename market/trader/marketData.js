export function convertAPIResponseToCandles(data) {
  const raw = data[0].candles;

  return raw.map(c => ({
    time: Math.floor(new Date(c.fromDate).getTime() / 1000),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close
  }));
}
