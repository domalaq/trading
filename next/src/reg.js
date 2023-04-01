const { RandomForestRegression } = require("ml-random-forest");
const { getCandleSticks } = require("./gate");

const getPredictions = async (symbol, high24h, low24h) => {
  try {
    const res = await getCandleSticks(symbol, "15m");

    const candles = res.data.map((d) => ({
      close: Number(d[2]),
      open: Number(d[5]),
      baseVolume: Number(d[6]),
      quoteVolume: Number(d[1]),
      time: Number(d[0]),
      symbol,
      high24h,
      low24h,
      high: Number(d[3]),
      low: Number(d[4]),
    }));

    const options = {
      seed: 3,
      maxFeatures: 7,
      replacement: true,
      nEstimators: 500,
    };

    const regression = new RandomForestRegression(options);

    let x = [];
    let y = [];

    candles.forEach((lc, i) => {
      if (i === 0 || i > candles.length - 2) {
        return;
      }

      const pc = candles[i - 1];

      x.push([
        pc.open,
        pc.high,
        pc.close,
        pc.low,
        pc.baseVolume,
        high24h,
        low24h,
      ]);

      y.push(lc.close);
    });

    regression.train(x, y);

    const pc = candles[candles.length - 1];

    const result = regression.predict([
      [pc.open, pc.high, pc.close, pc.low, pc.baseVolume, high24h, low24h],
    ]);

    return Promise.resolve(result);
  } catch (error) {
    if (
      error.errno === -110 ||
      error.errno === -3001 ||
      error.code === "ECONNRESET"
    ) {
      console.log("request timed out or other connection issues");
    } else {
      console.log(error);
    }

    return Promise.resolve([]);
  }
};

module.exports = {
  getPredictions,
};
