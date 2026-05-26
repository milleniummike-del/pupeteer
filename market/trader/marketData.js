export function convertAPIResponseToCandles(data) {
  if (!data) return [];
  
  let raw = [];
  if (Array.isArray(data)) {
    // Check if it's the specific structure [{ candles: [...] }]
    if (data.length > 0 && data[0].candles) {
      raw = data[0].candles;
    } else {
      raw = data;
    }
  } else if (data.candles) {
    raw = data.candles;
  }

  if (!Array.isArray(raw)) return [];

  return raw.map(c => ({
    time: Math.floor(new Date(c.fromDate).getTime() / 1000),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close
  })).filter(c => !isNaN(c.time));
}
