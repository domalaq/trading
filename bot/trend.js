"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
const gate_1 = require("./gate");
const telegraf_1 = require("telegraf");
const bot = new telegraf_1.Telegraf("238413949:AAEr2sNKSXZELaK9tVjNdTa-9ioP2dII6k4");
bot.start((ctx) => {
    return ctx.reply("Bot is ready");
});
let newPairs = [];
const job = new cron_1.CronJob({
    cronTime: "* * * * *",
    onTick: () => __awaiter(void 0, void 0, void 0, function* () {
        let pairRes;
        console.log("Getting currency pairs");
        try {
            pairRes = yield (0, gate_1.getCurrencyPairs)();
        }
        catch (error) {
            console.log(error);
            return Promise.resolve();
        }
        const usdtPairs = pairRes.data.filter((d) => d.quote === "USDT" && d.trade_status === "tradable");
        console.log("Getting tickers");
        const tickersRes = yield (0, gate_1.getTickers)();
        const tickers = tickersRes.data;
        const pairs = usdtPairs
            .map((p) => {
            const ticker = tickers.find((t) => t.currency_pair === p.id);
            return Object.assign(Object.assign({}, p), { volume24h: ticker.quote_volume, high: ticker.high_24h, low: ticker.low_24h, last: ticker.last });
        })
            .filter((p) => p.volume24h > 2000000);
        console.log("Analyzing market");
        const trendingPairs = yield Promise.all(pairs.map((pair) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const res = yield (0, gate_1.getCandleSticks)(pair.id, "5m");
                const candles = res.data.map((d) => ({
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
                const avgVolume = candles.reduce((sum, c) => sum + c.baseVolume, 0) / candles.length;
                const lastCandles = candles
                    .map((c, i) => (Object.assign(Object.assign({}, c), { priceChange: i === 0
                        ? 0
                        : Math.abs((c.close / candles[i - 1].close - 1) * 100), volumeChange: (c.baseVolume / avgVolume - 1) * 100 })))
                    .filter((_, i) => i > candles.length - 3);
                if (lastCandles.some((l) => l.volumeChange > 100 && l.priceChange > 0.5)) {
                    return Promise.resolve({
                        symbol: lastCandles[0].symbol,
                        volumeChange: Math.max(...lastCandles.map((l) => l.volumeChange)),
                        priceChange: Math.max(...lastCandles.map((l) => l.priceChange)),
                    });
                }
                return Promise.resolve({
                    symbol: "",
                });
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
                return Promise.resolve({
                    symbol: "",
                });
            }
        })));
        console.log("Finished");
        const filteredPairs = trendingPairs.filter((t) => t.symbol !== "" && !newPairs.some((n) => n.symbol === t.symbol));
        newPairs = filteredPairs.length > 0 ? filteredPairs : newPairs;
        if (filteredPairs.length > 0) {
            const message = `Trending pairs:\n\n` +
                filteredPairs.reduce((str, t) => {
                    var _a, _b;
                    return str +
                        `[${t.symbol}](https://www.gate.io/trade/${t.symbol}) - ${(_a = t.volumeChange) === null || _a === void 0 ? void 0 : _a.toFixed(2)}%, ${(_b = t.priceChange) === null || _b === void 0 ? void 0 : _b.toFixed(2)}%\n\n`;
                }, "");
            try {
                yield bot.telegram.sendMessage(169921072, message, {
                    parse_mode: "Markdown",
                });
            }
            catch (error) {
                console.log(error);
            }
        }
        return Promise.resolve();
    }),
});
bot.launch();
job.start();
