"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const binance_1 = require("binance");
const config_1 = require("./config");
const cliui_1 = __importDefault(require("cliui"));
const ui = (0, cliui_1.default)({ width: 180 });
const wsClient = new binance_1.WebsocketClient({ api_key: config_1.api_key, api_secret: config_1.api_secret });
let count = 0;
let avgPrice = 0;
let priceSum = 0;
let maxPrice = 0;
let minPrice = 0;
let avgQuantity = 0;
let quantitySum = 0;
let maxQuantity = 0;
let minQuantity = 0;
let avgVolume = 0;
let volumeSum = 0;
let maxVolume = 0;
let minVolume = 0;
(function () {
    wsClient.on("message", (data) => {
        count++;
        const trade = data;
        priceSum = priceSum + Number(trade.p);
        avgPrice = Math.round((priceSum / count) * 100) / 100;
        maxPrice =
            Number(trade.p) > maxPrice || maxPrice === 0 ? Number(trade.p) : maxPrice;
        minPrice =
            Number(trade.p) < minPrice || minPrice === 0 ? Number(trade.p) : minPrice;
        quantitySum = quantitySum + Number(trade.q);
        avgQuantity = Math.round((quantitySum / count) * 100) / 100;
        maxQuantity =
            Number(trade.q) > maxQuantity || maxQuantity === 0
                ? Number(trade.q)
                : maxQuantity;
        minQuantity =
            Number(trade.q) < minQuantity || minQuantity === 0
                ? Number(trade.q)
                : minQuantity;
        const volume = Number(trade.q) * Number(trade.p);
        volumeSum = volumeSum + volume;
        avgVolume = Math.round((volumeSum / count) * 100) / 100;
        maxVolume = volume > maxVolume || maxVolume === 0 ? volume : maxVolume;
        minVolume = volume < minVolume || minVolume === 0 ? volume : minVolume;
        ui.resetOutput();
        ui.div({
            text: `Price`,
            padding: [],
        }, {
            text: `Quantity`,
            padding: [],
        }, {
            text: `Volume`,
            padding: [],
        });
        ui.div({
            text: `Last: ${trade.p}`,
            padding: [],
        }, {
            text: `Last: ${trade.q}`,
            padding: [],
        }, {
            text: `Last: ${volume}`,
            padding: [],
        });
        ui.div({
            text: `Avg: ${avgPrice}`,
            padding: [],
        }, {
            text: `Avg: ${avgQuantity}`,
            padding: [],
        }, { text: `Avg: ${avgVolume}`, padding: [] });
        ui.div({
            text: `Max: ${maxPrice}`,
            padding: [],
        }, {
            text: `Max: ${maxQuantity}`,
            padding: [],
        }, { text: `Max: ${maxVolume}`, padding: [] });
        ui.div({
            text: `Min: ${minPrice}`,
            padding: [],
        }, {
            text: `Min: ${minQuantity}`,
            padding: [],
        }, { text: `Min: ${minVolume}`, padding: [] });
        console.clear();
        console.log(ui.toString());
    });
    wsClient.subscribeTrades("NEOUSDT", "spot");
})();
