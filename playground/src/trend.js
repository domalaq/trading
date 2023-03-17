"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const indicatorts_1 = require("indicatorts");
const gate_1 = require("./gate");
async function main() {
    let res;
    console.log("Getting currency pairs");
    try {
        res = await (0, gate_1.getSupportedCurrencyPairs)();
    }
    catch (error) {
        console.log(error);
        return;
    }
    const usdtPairs = res.data.filter((d) => d.quote === "USDT" && d.trade_status === "tradable");
    console.log("Getting tickers");
    const tickersRes = await (0, gate_1.getTickers)();
    const tickers = tickersRes.data;
    const pairs = usdtPairs
        .map((p) => {
        const ticker = tickers.find((t) => t.currency_pair === p.id);
        return { ...p, volume24h: ticker.quote_volume };
    })
        .filter((p) => p.volume24h > 200000);
    console.log("Analyzing market");
    pairs.forEach(async (pair) => {
        try {
            const res = await (0, gate_1.getCandleSticks)(pair.id);
            const candles = res.data.map((d) => ({
                close: Number(d[2]),
                trades: -1,
                baseVolume: Number(d[6]),
                quoteVolume: Number(d[1]),
                time: Number(d[0]),
                volume24h: pair.volume24h,
                lowerBand: 0,
                change: 0,
            }));
            const bbs = (0, indicatorts_1.bollingerBands)(candles.map((c) => c.close));
            const lastCandles = candles
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
                console.log(JSON.stringify(lastCandles.map((l) => ({
                    close: l.close,
                    change: l.change,
                    volume24h: l.volume24h,
                }))) + "\n");
            }
        }
        catch (error) {
            if (error.errno === -110 ||
                error.errno === -3001 ||
                error.code === "ECONNRESET") {
                console.log("request timed out or other connection issues");
            }
            else {
                console.log(error);
            }
        }
    });
}
main();
