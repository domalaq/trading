import axios from "axios";

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
