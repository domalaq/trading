import { AxiosResponse } from "axios";
import { bollingerBands, atr } from "indicatorts";
import { NextApiRequest, NextApiResponse } from "next";
import {
  getCandleSticks,
  getSupportedCurrencyPairs,
  getTickers,
} from "../../src/gate";
import { Kline } from "../../src/types";

interface Pair {
  quote: string;
  trade_status: "tradable" | "untradable";
  id: string;
}

interface Ticker {
  quote_volume: string;
  currency_pair: string;
}

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  let pairRes: AxiosResponse<Pair[]>;

  console.log("Getting currency pairs");

  try {
    pairRes = await getSupportedCurrencyPairs();
  } catch (error) {
    console.log(error);
    return res.status(500);
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
    .filter((p) => p.volume24h > 400000);

  console.log("Analyzing market");

  const trendingPairs = await Promise.all(
    pairs.map(async (pair) => {
      try {
        const res: AxiosResponse<string[][]> = await getCandleSticks(pair.id);

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
        }));

        const bbs = bollingerBands(candles.map((c) => c.close));

        const atrs = atr(
          14,
          candles.map((c) => c.high),
          candles.map((c) => c.low),
          candles.map((c) => c.close)
        );

        const lastCandles: Kline[] = candles
          .map((c, i) => ({
            ...c,
            upperBand: bbs.upperBand[i],
            middleBand: bbs.middleBand[i],
            lowerBand: bbs.lowerBand[i],
            change: 100 - (c.close / bbs.lowerBand[i]) * 100,
            atr: atrs.atrLine[i],
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
            volumeChange:
              i === 0
                ? 0
                : (c.quoteVolume / candles[i - 1].quoteVolume - 1) * 100,
          }))
          .filter((_, i) => i > candles.length - 3);

        // remove last element
        lastCandles.pop();

        if (
          lastCandles.some(
            (l) =>
              l.atrChange > 0 &&
              // l.close < l.lowerBand
              // l.change > -0.5 &&
              l.priceChange > 1 &&
              l.volumeChange > 1
          )
        ) {
          console.log(`Check this pair ${pair.id}`);
          console.log(
            JSON.stringify(
              lastCandles.map((l) => ({
                close: l.close,
                change: l.change,
                volume24h: l.volume24h,
                atrChange: l.atrChange,
              }))
            ) + "\n"
          );

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
