import { NextApiRequest, NextApiResponse } from "next";
import BigNumber from "bignumber.js";
import { getCurrencyPairs, priceOrder, getAccounts } from "../../src/gate";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { currencyPair, sellPrice } = req.body;

    const currency = currencyPair.split("_")[0];

    const pairRes = await getCurrencyPairs(currencyPair);
    const pair = pairRes.data;

    const accountRes = await getAccounts(currency);

    const amount = new BigNumber(accountRes.data[0].available).toFixed(
      pair.amount_precision,
      1
    );

    const priceOrderRes = await priceOrder(
      currencyPair,
      amount,
      sellPrice,
      ">=",
      "sell",
      pair.precision
    );

    return res.status(200).send(priceOrderRes.data);
  } catch (error: any) {
    return res.status(500).send(error.response.data);
  }
};
