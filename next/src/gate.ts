import axios from "axios";
import { getPayloadHash, getSign, getSignatureString } from "./crypto";
import BigNumber from "bignumber.js";

const host = "https://api.gateio.ws/api/v4";

export function getCurrencyPairs(currency_pair: string = "") {
  const param = currency_pair === "" ? "" : "/" + currency_pair;

  return axios.get(`${host}/spot/currency_pairs${param}`);
}

export function getOrderBook(currency_pair: string = "", limit: number = 0) {
  return axios.get(`${host}/spot/order_book`, {
    params: {
      currency_pair,
      limit: limit > 0 ? limit : undefined,
    },
  });
}

export function getCandleSticks(currency_pair: string, interval: string) {
  return axios.get(`${host}/spot/candlesticks`, {
    params: {
      currency_pair,
      limit: 1000,
      interval,
    },
  });
}

export function getTickers(currency_pair: string = "") {
  const options =
    currency_pair === ""
      ? undefined
      : {
          params: {
            currency_pair,
            timezone: "utc8",
          },
        };

  return axios.get(`${host}/spot/tickers`, options);
}

export function buyOrder(currency_pair: string, amount: string, price: string) {
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

  const payloadHash = getPayloadHash(JSON.stringify(payload));

  const signatureString = getSignatureString(
    "POST",
    url,
    "",
    payloadHash,
    timestamp
  );

  return axios.post(`${host + url}`, payload, {
    headers: {
      KEY: "f3699a3ba1f904fddbb02123f4990ab1",
      Timestamp: timestamp,
      SIGN: getSign(signatureString),
    },
  });
}

export function sellOrder(
  currency_pair: string,
  amount: string,
  price: string
) {
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

  const payloadHash = getPayloadHash(JSON.stringify(payload));

  const signatureString = getSignatureString(
    "POST",
    url,
    "",
    payloadHash,
    timestamp
  );

  return axios.post(`${host + url}`, payload, {
    headers: {
      KEY: "f3699a3ba1f904fddbb02123f4990ab1",
      Timestamp: timestamp,
      SIGN: getSign(signatureString),
    },
  });
}

export function priceOrder(
  market: string,
  amount: string,
  price: string,
  rule: "<=" | ">=",
  side: "buy" | "sell",
  precision: number
) {
  const timestamp = Math.round(Date.now() / 1000);
  const url = "/spot/price_orders";

  const priceBN = new BigNumber(price);

  const payload = {
    trigger: {
      price:
        rule === ">="
          ? priceBN.plus(10 ** -precision).toFixed(precision)
          : priceBN.toFixed(precision),
      rule,
      expiration: 60 * 60 * 24,
    },
    put: {
      type: "limit",
      side,
      price:
        rule === "<="
          ? priceBN.plus(10 ** -precision).toFixed(precision)
          : priceBN.toFixed(precision),
      amount,
      account: "normal",
      time_in_force: "gtc",
    },
    market,
  };

  const payloadHash = getPayloadHash(JSON.stringify(payload));

  const signatureString = getSignatureString(
    "POST",
    url,
    "",
    payloadHash,
    timestamp
  );

  return axios.post(`${host + url}`, payload, {
    headers: {
      KEY: "f3699a3ba1f904fddbb02123f4990ab1",
      Timestamp: timestamp,
      SIGN: getSign(signatureString),
    },
  });
}

export function getMyTrades(
  from: number = 0,
  limit: number = 0,
  currency_pair: string = ""
) {
  const timestamp = Math.round(Date.now() / 1000);
  const url = "/spot/my_trades";

  const payloadHash = getPayloadHash("");

  const query = [];
  interface Params {
    from?: number;
    limit?: number;
    currency_pair?: string;
  }
  const params: Params = {};
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

  const signatureString = getSignatureString(
    "GET",
    url,
    query.join("&"),
    payloadHash,
    timestamp
  );

  return axios.get(`${host + url}`, {
    headers: {
      KEY: "f3699a3ba1f904fddbb02123f4990ab1",
      Timestamp: timestamp,
      SIGN: getSign(signatureString),
    },
    params,
  });
}

export function getAccounts(currency: string = "") {
  const timestamp = Math.round(Date.now() / 1000);
  const url = "/spot/accounts";

  const payloadHash = getPayloadHash("");

  const query = [];
  interface Params {
    currency?: string;
  }

  const params: Params = {};

  if (currency !== "") {
    query.push(`currency=${currency}`);
    params.currency = currency;
  }

  const signatureString = getSignatureString(
    "GET",
    url,
    query.join("&"),
    payloadHash,
    timestamp
  );

  return axios.get(`${host + url}`, {
    headers: {
      KEY: "f3699a3ba1f904fddbb02123f4990ab1",
      Timestamp: timestamp,
      SIGN: getSign(signatureString),
    },
    params,
  });
}
