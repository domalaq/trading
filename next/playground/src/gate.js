"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTickers = exports.getCandleSticks = exports.getSupportedCurrencyPairs = void 0;
const axios_1 = __importDefault(require("axios"));
const host = "https://api.gateio.ws/api/v4";
function getSupportedCurrencyPairs() {
    return axios_1.default.get(`${host}/spot/currency_pairs`);
}
exports.getSupportedCurrencyPairs = getSupportedCurrencyPairs;
function getCandleSticks(currency_pair) {
    return axios_1.default.get(`${host}/spot/candlesticks`, {
        params: {
            currency_pair,
            limit: 200,
            interval: "30m",
        },
    });
}
exports.getCandleSticks = getCandleSticks;
function getTickers() {
    return axios_1.default.get(`${host}/spot/tickers`);
}
exports.getTickers = getTickers;
