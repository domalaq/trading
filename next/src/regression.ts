// import MLR from "ml-regression-multivariate-linear";
import { RandomForestRegression as RFRegression } from "ml-random-forest";
import { AxiosResponse } from "axios";
import { Kline, Pair, Ticker } from "./types";
import { getCandleSticks, getSupportedCurrencyPairs, getTickers } from "./gate";
import { atr, bollingerBands } from "indicatorts";

const main = async () => {
  let pairRes: AxiosResponse<Pair[]>;

  console.log("Getting currency pairs");

  try {
    pairRes = await getSupportedCurrencyPairs();
  } catch (error) {
    return console.log(error);
  }

  const usdtPairs: Pair[] = pairRes.data.filter(
    (d: Pair) => d.quote === "USDT" && d.trade_status === "tradable"
  );

  console.log("Getting tickers");

  const tickersRes = await getTickers();

  const tickers = tickersRes.data;

  const pairs = usdtPairs
    .map((p) => {
      const ticker = tickers.find((t: Ticker) => t.currency_pair === p.id);

      return {
        ...p,
        volume24h: ticker.quote_volume,
        high: ticker.high_24h,
        low: ticker.low_24h,
      };
    })
    .filter((p) => p.volume24h > 1000000);

  console.log("Analyzing market");

  await Promise.all(
    pairs.map(async (pair) => {
      try {
        const res: AxiosResponse<string[][]> = await getCandleSticks(
          pair.id,
          "5m"
        );

        const candles: Kline[] = res.data.map((d) => ({
          close: Number(d[2]),
          trades: -1,
          baseVolume: Number(d[6]),
          quoteVolume: Number(d[1]),
          time: Number(d[0]),
          volume24h: pair.volume24h,
          upperBand: 0,
          lowerBand: 0,
          change: 0,
          symbol: pair.id,
          high24h: pair.high,
          low24h: pair.low,
          high: Number(d[3]),
          low: Number(d[4]),
          atr: 0,
          atrChange: 0,
          priceChange: 0,
          widthChange: 0,
          volumeChange: 0,
          precision: pair.precision,
          amountPrecision: pair.amount_precision,
          vwap: 0,
          rsi: 0,
        }));

        const bbs = bollingerBands(candles.map((c) => c.close));

        const atrs = atr(
          14,
          candles.map((c) => c.high),
          candles.map((c) => c.low),
          candles.map((c) => c.close)
        );

        const lastCandles: Kline[] = candles.map((c, i) => ({
          ...c,
          upperBand: bbs.upperBand[i],
          middleBand: bbs.middleBand[i],
          lowerBand: bbs.lowerBand[i],
          change: 100 - (c.close / bbs.lowerBand[i]) * 100,
          atr: atrs.atrLine[i],
          atrChange:
            i === 0 ? 0 : (atrs.atrLine[i] / atrs.atrLine[i - 1] - 1) * 100,
          priceChange: i === 0 ? 0 : (c.close / candles[i - 1].close - 1) * 100,
          widthChange:
            i === 0
              ? 0
              : ((bbs.upperBand[i] - bbs.lowerBand[i]) /
                  (bbs.upperBand[i - 1] - bbs.lowerBand[i - 1]) -
                  1) *
                100,
          volumeChange:
            i === 0
              ? 0
              : (c.quoteVolume / candles[i - 1].quoteVolume - 1) * 100,
        }));

        const options = {
          seed: 3,
          maxFeatures: 2,
          replacement: false,
          nEstimators: 200,
        };

        const regression = new RFRegression(options);

        let x: number[][] = [];
        let y: number[] = [];

        lastCandles.forEach((lc, i) => {
          if (i === 0 || i > lastCandles.length - 10) {
            return;
          }

          const pc = lastCandles[i - 1];

          x.push([pc.atr, pc.close, pc.upperBand, pc.quoteVolume]);

          y.push(lc.close);
        });

        regression.train(x, y);

        lastCandles.forEach((lc, i) => {
          if (i <= lastCandles.length - 10) {
            return;
          }

          const pc = lastCandles[i - 1];

          const result = regression.predict([
            [pc.atr, pc.close, pc.upperBand, pc.quoteVolume],
          ]);

          console.log(
            lc.symbol,
            result,
            lc.close,
            (((lc.close - result[0]) / lc.close) * 100).toFixed(2)
          );
        });
      } catch (error: any) {
        if (
          error.errno === -110 ||
          error.errno === -3001 ||
          error.code === "ECONNRESET"
        ) {
          console.log("request timed out or other connection issues");
        } else {
          console.log(error);
        }
      }
    })
  );
};

main();
