"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const indicatorts_1 = require("indicatorts");
const binance_1 = require("binance");
const assets_json_1 = __importDefault(require("./assets.json"));
const config_1 = require("./config");
const client = new binance_1.MainClient({
    api_key: config_1.api_key,
    api_secret: config_1.api_secret,
});
const limit = 200;
console.log(`Checking symbols`);
assets_json_1.default.data.forEach(async (d) => {
    const symbol = d.assetCode + "USDT";
    try {
        const tickerRes = await client.get24hrChangeStatististics({
            symbol,
        });
        const ticker = tickerRes;
        if (ticker.quoteVolume < 100000) {
            return;
        }
        const res = await client.getKlines({ symbol, interval: "30m", limit });
        const candles = res.map((c) => ({
            close: Number(c[4]),
            trades: c[8],
            baseVolume: Number(c[9]),
            quoteVolume: Number(c[10]),
            volume24h: Number(ticker.quoteVolume),
            lowerBand: 0,
            time: -1,
            change: 0,
        }));
        const bbs = (0, indicatorts_1.bollingerBands)(candles.map((c) => c.close));
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
    }
    catch (error) {
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
