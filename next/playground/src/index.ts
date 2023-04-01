import { bollingerBands } from "indicatorts";
import { DailyChangeStatistic, MainClient } from "binance";
import assets from "./assets.json";
import { api_key, api_secret } from "./config";
import { Kline } from "./types";

const client = new MainClient({
  api_key,
  api_secret,
});

const limit = 200;

console.log(`Checking symbols`);

assets.data.forEach(async (d) => {
  const symbol = d.assetCode + "USDT";

  try {
    const tickerRes = await client.get24hrChangeStatististics({
      symbol,
    });

    const ticker = tickerRes as DailyChangeStatistic;

    if (ticker.quoteVolume < 100000) {
      return;
    }

    const res = await client.getKlines({ symbol, interval: "30m", limit });
    const candles: Kline[] = res.map((c) => ({
      close: Number(c[4]),
      trades: c[8],
      baseVolume: Number(c[9]),
      quoteVolume: Number(c[10]),
      volume24h: Number(ticker.quoteVolume),
      lowerBand: 0,
      time: -1,
      change: 0,
    }));

    const bbs = bollingerBands(candles.map((c) => c.close));

    const lastCandles = candles
      .map((c, i) => ({
        ...c,
        upperBand: bbs.upperBand[i],
        middleBand: bbs.middleBand[i],
        lowerBand: bbs.lowerBand[i],
        change: 100 - (c.close / bbs.lowerBand[i]) * 100,
        symbol,
      }))
      .filter((_, i) => i > limit - 4);

    lastCandles.pop();

    if (lastCandles.some((l) => l.close < l.lowerBand)) {
      console.log(`${symbol} is bullish ${JSON.stringify(lastCandles)}\n`);
    }
  } catch (error: any) {
    if (error.code === -1121) {
      return console.log(`Invalid symbol ${d.assetCode}`);
    }

    if (error.code === "ECONNRESET") {
      return console.log(`Connection reset error`);
    }

    if (error.code === "ETIMEDOUT") {
      return console.log(`Connection timeout error`);
    }

    console.log(error);
  }
});
