import { DataTypes, Sequelize } from "sequelize";
// import { WebsocketClient, WsMessageTradeRaw } from "binance";
// import { api_key, api_secret } from "./config";

const sequelize = new Sequelize("mysql://baq:Liver2012@localhost:3306/trading");

// const wsClient = new WebsocketClient({ api_key, api_secret });

export const Trade = sequelize.define("Trade", {
  eventTime: DataTypes.DATE,
  symbol: DataTypes.STRING,
  tradeId: DataTypes.BIGINT,
  price: DataTypes.FLOAT,
  quantity: DataTypes.FLOAT,
  buyerOrderId: DataTypes.BIGINT,
  sellerOrderId: DataTypes.BIGINT,
  tradeTime: DataTypes.DATE,
  isBuyerMaker: DataTypes.BOOLEAN,
});

export async function init() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return;
  }

  await sequelize.sync({ force: true });
}

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
