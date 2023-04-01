import { AxiosResponse } from "axios";
import { bollingerBands } from "indicatorts";
import { getCandleSticks, getSupportedCurrencyPairs, getTickers } from "./gate";
import { Kline } from "./types";

interface Pair {
  quote: string;
  trade_status: "tradable" | "untradable";
  id: string;
}

interface Ticker {
  quote_volume: string;
  currency_pair: string;
}

async function main() {
  let res: AxiosResponse<Pair[]>;

  console.log("Getting currency pairs");

  try {
    res = await getSupportedCurrencyPairs();
  } catch (error) {
    console.log(error);
    return;
  }

  const usdtPairs: Pair[] = res.data.filter(
    (d: Pair) => d.quote === "USDT" && d.trade_status === "tradable"
  );

  console.log("Getting tickers");

  const tickersRes = await getTickers();

  const tickers = tickersRes.data;

  const pairs = usdtPairs
    .map((p) => {
      const ticker = tickers.find((t: Ticker) => t.currency_pair === p.id);

      return { ...p, volume24h: ticker.quote_volume };
    })
    .filter((p) => p.volume24h > 200000);

  console.log("Analyzing market");

  pairs.forEach(async (pair) => {
    try {
      const res: AxiosResponse<string[][]> = await getCandleSticks(pair.id);

      const candles: Kline[] = res.data.map((d) => ({
        close: Number(d[2]),
        trades: -1,
        baseVolume: Number(d[6]),
        quoteVolume: Number(d[1]),
        time: Number(d[0]),
        volume24h: pair.volume24h,
        lowerBand: 0,
        change: 0,
      }));

      const bbs = bollingerBands(candles.map((c) => c.close));

      const lastCandles: Kline[] = candles
        .map((c, i) => ({
          ...c,
          upperBand: bbs.upperBand[i],
          middleBand: bbs.middleBand[i],
          lowerBand: bbs.lowerBand[i],
          symbol: pair.id,
          change: 100 - (c.close / bbs.lowerBand[i]) * 100,
        }))
        .filter((_, i) => i > candles.length - 4);

      // remove last element
      lastCandles.pop();

      if (lastCandles.every((l) => l.close < l.lowerBand)) {
        console.log(`Check this pair ${pair.id}`);
        console.log(
          JSON.stringify(
            lastCandles.map((l) => ({
              close: l.close,
              change: l.change,
              volume24h: l.volume24h,
            }))
          ) + "\n"
        );
      }
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
  });
}

main();
