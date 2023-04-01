import { NextApiRequest, NextApiResponse } from "next";
import { getCurrencyPairs, getMyTrades } from "../../src/gate";
import { Trade } from "../../src/types";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { currencyPair } = req.query;

    const pairRes = await getCurrencyPairs(currencyPair as string);

    const pair = pairRes.data;

    const tradeRes = await getMyTrades(0, 10, currencyPair as string);

    const buyTrade = tradeRes.data.filter((d: Trade) => d.side === "buy")[0];

    return res.status(200).send({ ...buyTrade, precision: pair.precision });
  } catch (error: any) {
    console.log(error.response.data);

    return res.status(500).send("error");
  }
};
