import axios from "axios";
import { getPayloadHash, getSign, getSignatureString } from "./crypto";

const host = "https://api.gateio.ws/api/v4";

export function getSupportedCurrencyPairs() {
  return axios.get(`${host}/spot/currency_pairs`);
}

export function getCandleSticks(currency_pair: string) {
  return axios.get(`${host}/spot/candlesticks`, {
    params: {
      currency_pair,
      limit: 200,
      interval: "5m",
    },
  });
}

export function getTickers() {
  return axios.get(`${host}/spot/tickers`);
}

export function createOrder(currency_pair: string, amount: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const url = "/spot/orders";
  const payload = {
    currency_pair,
    type: "market",
    account: "spot",
    side: "buy",
    amount,
    time_in_force: "fok",
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
