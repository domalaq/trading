import { NextApiRequest, NextApiResponse } from "next";
import BigNumber from "bignumber.js";
import { getCurrencyPairs, buyOrder, getOrderBook } from "../../src/gate";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { currencyPair, amount } = req.body;

    const pairRes = await getCurrencyPairs(currencyPair);

    const pair = pairRes.data;

    let amountBN = new BigNumber(amount);

    let orderStatus = "";

    while (orderStatus !== "closed") {
      const orderBookRes = await getOrderBook(currencyPair, 1);

      const price = new BigNumber(orderBookRes.data.asks[0][0]);
      const baseAmount = amountBN.div(price);

      const orderRes = await buyOrder(
        currencyPair,
        baseAmount.toFixed(pair.amount_precision),
        price.toString()
      );

      const order = orderRes.data;

      amountBN = amountBN.minus(order.fill_price);

      orderStatus = order.status;
    }

    console.log("bought", pair);

    return res.status(200).send("ok");
  } catch (error: any) {
    console.log(error.response.data);

    return res.status(500).send("error");
  }
};
