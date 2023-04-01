"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.Trade = void 0;
const sequelize_1 = require("sequelize");
// import { WebsocketClient, WsMessageTradeRaw } from "binance";
// import { api_key, api_secret } from "./config";
const sequelize = new sequelize_1.Sequelize("mysql://baq:Liver2012@localhost:3306/trading");
// const wsClient = new WebsocketClient({ api_key, api_secret });
exports.Trade = sequelize.define("Trade", {
    eventTime: sequelize_1.DataTypes.DATE,
    symbol: sequelize_1.DataTypes.STRING,
    tradeId: sequelize_1.DataTypes.BIGINT,
    price: sequelize_1.DataTypes.FLOAT,
    quantity: sequelize_1.DataTypes.FLOAT,
    buyerOrderId: sequelize_1.DataTypes.BIGINT,
    sellerOrderId: sequelize_1.DataTypes.BIGINT,
    tradeTime: sequelize_1.DataTypes.DATE,
    isBuyerMaker: sequelize_1.DataTypes.BOOLEAN,
});
async function init() {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    }
    catch (error) {
        console.error("Unable to connect to the database:", error);
        return;
    }
    await sequelize.sync({ force: true });
}
exports.init = init;
// async function main() {
//   wsClient.on("message", async (data) => {
//     const trade = data as WsMessageTradeRaw;
//     await Trade.create({
//       eventTime: trade.E,
//       symbol: trade.s,
//       tradeId: trade.t,
//       price: trade.p,
//       quantity: trade.q,
//       buyerOrderId: trade.b,
//       sellerOrderId: trade.a,
//       tradeTime: trade.T,
//       isBuyerMaker: trade.m,
//     });
//   });
//   wsClient.subscribeTrades("VETUSDT", "spot");
// }
// main();
