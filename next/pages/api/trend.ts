import { AxiosResponse } from "axios";
import {
  bollingerBands,
  atr,
  volumeWeightedAveragePrice,
  rsi,
  ema,
} from "indicatorts";
import { NextApiRequest, NextApiResponse } from "next";
import { getCandleSticks, getCurrencyPairs, getTickers } from "../../src/gate";
import { Kline, Pair, Ticker } from "../../src/types";
// import { getPredictions } from "../../src/reg";

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  let pairRes: AxiosResponse<Pair[]>;

  console.log("Getting currency pairs");

  try {
    pairRes = await getCurrencyPairs();
  } catch (error) {
    console.log(error);
    return res.status(500).send("error");
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
        last: ticker.last,
      };
    })
    .filter((p) => p.volume24h > 2000000);

  console.log("Analyzing market");

  const trendingPairs = await Promise.all(
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
          emaFlip: false,
          vwapFlip: false,
        }));

        const bbs = bollingerBands(candles.map((c) => c.close));

        const atrs = atr(
          14,
          candles.map((c) => c.high),
          candles.map((c) => c.low),
          candles.map((c) => c.close)
        );

        const vwaps = volumeWeightedAveragePrice(
          1000,
          candles.map((c) => c.close),
          candles.map((c) => c.quoteVolume)
        );

        const rsis = rsi(candles.map((c) => c.close));

        const emas = ema(
          9,
          candles.map((c) => c.close)
        );

        const avgVolume =
          candles.reduce((sum, c) => sum + c.baseVolume, 0) / candles.length;

        const lastCandles: Kline[] = candles
          .map((c, i) => ({
            ...c,
            upperBand: bbs.upperBand[i],
            middleBand: bbs.middleBand[i],
            lowerBand: bbs.lowerBand[i],
            change: 100 - (c.close / bbs.lowerBand[i]) * 100,
            atr: atrs.atrLine[i],
            vwap: vwaps[i],
            rsi: rsis[i],
            ema: emas[i],
            emaFlip:
              i === 0
                ? false
                : emas[i] < c.close && emas[i - 1] > candles[i - 1].close,
            vwapFlip:
              i === 0
                ? false
                : vwaps[i] < c.close && vwaps[i - 1] > candles[i - 1].close,
            atrChange:
              i === 0 ? 0 : (atrs.atrLine[i] / atrs.atrLine[i - 1] - 1) * 100,
            priceChange:
              i === 0 ? 0 : (c.close / candles[i - 1].close - 1) * 100,
            widthChange:
              i === 0
                ? 0
                : ((bbs.upperBand[i] - bbs.lowerBand[i]) /
                    (bbs.upperBand[i - 1] - bbs.lowerBand[i - 1]) -
                    1) *
                  100,
            volumeChange: (c.baseVolume / avgVolume - 1) * 100,
          }))
          .filter((_, i) => i > candles.length - 3);

        // remove last element
        lastCandles.pop();

        if (
          lastCandles.every(
            (l) =>
              // l.atrChange > 0 &&
              // l.priceChange > 0 &&
              l.volumeChange > 100 &&
              // l.close > l.upperBand &&
              // l.emaFlip &&
              // l.vwapFlip &&
              // l.priceChange < 0 &&
              // l.close < l.lowerBand &&
              // ((l.close - l.vwap) / l.close) * 100 < 2 &&
              // ((l.close - l.vwap) / l.close) * 100 >= 0 &&
              // (l.high24h - l.close) / l.close > 0.1 &&
              // l.rsi < 35 &&
              //
              true
          )
        ) {
          console.log(`Check this pair ${pair.id}, ${avgVolume}`);

          // const predictions: number[] = await getPredictions(
          //   pair.id,
          //   Number(pair.high),
          //   Number(pair.low)
          // );

          // const change = ((predictions[0] - pair.last) / pair.last) * 100;

          // console.log(predictions, change.toFixed(2) + "%");
          console.log(JSON.stringify(lastCandles) + "\n");

          return Promise.resolve(lastCandles);
        }

        return Promise.resolve([]);
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

        return Promise.resolve([]);
      }
    })
  );

  console.log("Finished");

  return res.json(trendingPairs.filter((t) => t.length > 0));
};
