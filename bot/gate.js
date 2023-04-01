"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTrades = exports.sellOrder = exports.buyOrder = exports.getTickers = exports.getCandleSticks = exports.getOrderBook = exports.getCurrencyPairs = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("./crypto");
const host = "https://api.gateio.ws/api/v4";
function getCurrencyPairs(currency_pair = "") {
    const param = currency_pair === "" ? "" : "/" + currency_pair;
    return axios_1.default.get(`${host}/spot/currency_pairs${param}`);
}
exports.getCurrencyPairs = getCurrencyPairs;
function getOrderBook(currency_pair = "", limit = 0) {
    return axios_1.default.get(`${host}/spot/order_book`, {
        params: {
            currency_pair,
            limit: limit > 0 ? limit : undefined,
        },
    });
}
exports.getOrderBook = getOrderBook;
function getCandleSticks(currency_pair, interval) {
    return axios_1.default.get(`${host}/spot/candlesticks`, {
        params: {
            currency_pair,
            limit: 1000,
            interval,
        },
    });
}
exports.getCandleSticks = getCandleSticks;
function getTickers(currency_pair = "") {
    const options = currency_pair === ""
        ? undefined
        : {
            params: {
                currency_pair,
                timezone: "utc8",
            },
        };
    return axios_1.default.get(`${host}/spot/tickers`, options);
}
exports.getTickers = getTickers;
function buyOrder(currency_pair, amount, price) {
    const timestamp = Math.round(Date.now() / 1000);
    const url = "/spot/orders";
    const payload = {
        currency_pair,
        type: "limit",
        account: "spot",
        side: "buy",
        amount,
        time_in_force: "ioc",
        price,
    };
    const payloadHash = (0, crypto_1.getPayloadHash)(JSON.stringify(payload));
    const signatureString = (0, crypto_1.getSignatureString)("POST", url, "", payloadHash, timestamp);
    return axios_1.default.post(`${host + url}`, payload, {
        headers: {
            KEY: "f3699a3ba1f904fddbb02123f4990ab1",
            Timestamp: timestamp,
            SIGN: (0, crypto_1.getSign)(signatureString),
        },
    });
}
exports.buyOrder = buyOrder;
function sellOrder(currency_pair, amount, price) {
    const timestamp = Math.round(Date.now() / 1000);
    const url = "/spot/orders";
    const payload = {
        currency_pair,
        type: "limit",
        account: "spot",
        side: "buy",
        amount,
        time_in_force: "ioc",
        price,
    };
    const payloadHash = (0, crypto_1.getPayloadHash)(JSON.stringify(payload));
    const signatureString = (0, crypto_1.getSignatureString)("POST", url, "", payloadHash, timestamp);
    return axios_1.default.post(`${host + url}`, payload, {
        headers: {
            KEY: "f3699a3ba1f904fddbb02123f4990ab1",
            Timestamp: timestamp,
            SIGN: (0, crypto_1.getSign)(signatureString),
        },
    });
}
exports.sellOrder = sellOrder;
function getMyTrades(from = 0, limit = 0, currency_pair = "") {
    const timestamp = Math.round(Date.now() / 1000);
    const url = "/spot/my_trades";
    const payloadHash = (0, crypto_1.getPayloadHash)("");
    const query = [];
    const params = {};
    if (from > 0) {
        query.push(`from=${from}`);
        params.from = from;
    }
    if (limit > 0) {
        query.push(`limit=${limit}`);
        params.limit = limit;
    }
    if (currency_pair !== "") {
        query.push(`currency_pair=${currency_pair}`);
        params.currency_pair = currency_pair;
    }
    const signatureString = (0, crypto_1.getSignatureString)("GET", url, query.join("&"), payloadHash, timestamp);
    return axios_1.default.get(`${host + url}`, {
        headers: {
            KEY: "f3699a3ba1f904fddbb02123f4990ab1",
            Timestamp: timestamp,
            SIGN: (0, crypto_1.getSign)(signatureString),
        },
        params,
    });
}
exports.getMyTrades = getMyTrades;
