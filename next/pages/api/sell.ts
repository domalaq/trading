import { NextApiRequest, NextApiResponse } from "next";
import { sellOrder } from "../../src/gate";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { currencyPair, amount } = req.body;

    const orderRes = await sellOrder(currencyPair, amount, "");

    console.log(orderRes);

    return res.status(200).send("ok");
  } catch (error: any) {
    console.log(error.response.data);

    return res.status(500).send("error");
  }
};
